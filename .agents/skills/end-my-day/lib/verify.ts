import type {
  WindowType,
  Task,
  Document,
  GitCommit,
  PotentialLink,
  VerificationContext,
  VerificationInput,
  LatestEnd,
  Acknowledgement,
} from './types.ts'
import { scanDirectories, filterDocsByWindow } from './scan.ts'
import { collectGitEvidence } from './git.ts'
import { readLatestEnd, hasAcknowledgement, readIssues, writeAcknowledgement, ensureDir } from './state.ts'
import { getDailyWindow, getWeeklyWindow } from './window.ts'
import { writeFileSync } from 'node:fs'
import YAML from 'yaml'

export type {
  WindowType,
  Task,
  Document,
  GitCommit,
  PotentialLink,
  VerificationContext,
  VerificationInput,
  LatestEnd,
  Acknowledgement,
}
export { readLatestEnd, hasAcknowledgement, readIssues, writeAcknowledgement }

interface InputTask {
  title: string
  status: string
  priority: 'high' | 'medium' | 'low'
  dod?: string
  tags?: string[]
  links?: Array<{ label: string; url: string }>
}

interface LinkReason {
  kind: 'explicit' | 'commit' | 'metadata' | 'content' | 'path'
  message: string
}

export async function verifyTaskDocConsistency(input: VerificationInput): Promise<VerificationContext> {
  const runId = generateRunId()
  const window = input.window_type === 'daily'
    ? getDailyWindow(input.window_id)
    : getWeeklyWindow(input.window_id)

  const tasks: Task[] = input.plan.tasks.map((task: InputTask, index: number) => ({
    task_id: `${input.window_id}-${index}`,
    title: task.title,
    status: normalizeStatus(task.status),
    priority: task.priority,
    dod: task.dod,
    tags: task.tags,
    links: task.links,
    window,
  }))

  const documents = filterDocsByWindow(scanDirectories(input.corpus_dirs), window.start, window.end)
  const gitCommits = input.git_enabled
    ? await collectGitEvidence(window.start, window.end)
    : []

  const potentialLinks = collectPotentialLinks(tasks, documents, gitCommits)

  const context: VerificationContext = {
    run_id: runId,
    window: { type: input.window_type, id: input.window_id },
    tasks,
    documents,
    git_commits: gitCommits,
    potential_links: potentialLinks,
  }

  saveRunDetails(runId, context)
  return context
}

function generateRunId(): string {
  return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
}

function normalizeStatus(status: string): Task['status'] {
  const normalized = status.toLowerCase().replace(/[^a-z]/g, '')

  if (normalized === 'done') return 'done'
  if (normalized === 'inprogress') return 'inprogress'
  if (normalized === 'notstarted') return 'notstarted'
  if (normalized === 'deferred' || normalized === 'deffered') return 'deferred'
  if (normalized === 'cancelled' || normalized === 'canceled') return 'cancelled'
  if (normalized === 'blocked') return 'blocked'

  return 'notstarted'
}

function collectPotentialLinks(tasks: Task[], documents: Document[], gitCommits: GitCommit[]): PotentialLink[] {
  const links: PotentialLink[] = []

  for (const task of tasks) {
    for (const document of documents) {
      const reasons = collectReasons(task, document, gitCommits)
      if (reasons.length === 0) continue

      const relatedCommitShas = findRelatedCommitShas(task, document, gitCommits)
      links.push({
        task_id: task.task_id,
        doc_path: document.path,
        confidence: classifyConfidence(reasons),
        reasons: reasons.map(reason => reason.message),
        related_commit_shas: relatedCommitShas.length > 0 ? relatedCommitShas : undefined,
      })
    }
  }

  return links.sort(sortLinks)
}

function collectReasons(task: Task, document: Document, gitCommits: GitCommit[]): LinkReason[] {
  const reasons: LinkReason[] = []
  const taskKeywords = extractKeywords(`${task.title} ${task.dod || ''}`)
  const docKeywords = extractKeywords(`${document.frontmatter.title || ''} ${document.headings.join(' ')} ${document.path}`)

  if (document.frontmatter.tasks?.includes(task.task_id)) {
    reasons.push({ kind: 'explicit', message: `frontmatter.tasks includes task id ${task.task_id}` })
  }

  if (document.frontmatter.tasks?.some(ref => normalizeText(ref) === normalizeText(task.title))) {
    reasons.push({ kind: 'explicit', message: 'frontmatter.tasks contains the task title' })
  }

  const linkedTaskUrl = task.links
    ?.map(link => link.url)
    .find(url => url.includes(document.path) || document.path.includes(url))
  if (linkedTaskUrl) {
    reasons.push({ kind: 'explicit', message: `task link references this document (${linkedTaskUrl})` })
  }

  const tagOverlap = intersect(task.tags || [], document.frontmatter.tags || [])
  if (tagOverlap.length > 0) {
    reasons.push({ kind: 'metadata', message: `shared tags: ${tagOverlap.join(', ')}` })
  }

  const keywordOverlap = intersect(taskKeywords, docKeywords)
  if (keywordOverlap.length > 0) {
    reasons.push({ kind: 'content', message: `shared keywords: ${keywordOverlap.slice(0, 6).join(', ')}` })
  }

  const pathOverlap = intersect(taskKeywords, extractKeywords(document.path.replaceAll('/', ' ')))
  if (pathOverlap.length > 0) {
    reasons.push({ kind: 'path', message: `document path overlaps task keywords: ${pathOverlap.slice(0, 6).join(', ')}` })
  }

  for (const commit of gitCommits) {
    if (!commit.filesChanged.includes(document.path)) continue

    const commitKeywords = extractKeywords(commit.commitMessage)
    const commitOverlap = intersect(taskKeywords, commitKeywords)

    if (commit.commitMessage.includes(task.task_id) || commitOverlap.length > 0) {
      reasons.push({
        kind: 'commit',
        message: `commit ${commit.commitSha.slice(0, 7)} touches this document and message overlaps task (${commitOverlap.slice(0, 4).join(', ') || task.task_id})`,
      })
    }
  }

  return dedupeReasons(reasons)
}

function findRelatedCommitShas(task: Task, document: Document, gitCommits: GitCommit[]): string[] {
  const taskKeywords = extractKeywords(`${task.title} ${task.dod || ''}`)

  return gitCommits
    .filter((commit) => {
      if (!commit.filesChanged.includes(document.path)) return false
      if (commit.commitMessage.includes(task.task_id)) return true
      return intersect(taskKeywords, extractKeywords(commit.commitMessage)).length > 0
    })
    .map(commit => commit.commitSha)
}

function classifyConfidence(reasons: LinkReason[]): PotentialLink['confidence'] {
  const explicitSignals = reasons.filter(reason => reason.kind === 'explicit').length
  const commitSignals = reasons.filter(reason => reason.kind === 'commit').length

  if (explicitSignals > 0 || commitSignals > 0) return 'strong'
  if (reasons.length >= 2) return 'medium'
  return 'weak'
}

function sortLinks(a: PotentialLink, b: PotentialLink): number {
  const order = { strong: 3, medium: 2, weak: 1 }
  return order[b.confidence] - order[a.confidence]
    || b.reasons.length - a.reasons.length
    || a.doc_path.localeCompare(b.doc_path)
}

function extractKeywords(text: string): string[] {
  return [...new Set(
    text
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s/-]/gu, ' ')
      .split(/\s+/)
      .map(token => token.trim())
      .filter(token => token.length >= 2),
  )]
}

function intersect(left: string[], right: string[]): string[] {
  const rightSet = new Set(right.map(normalizeText))
  return [...new Set(left.filter(item => rightSet.has(normalizeText(item))))]
}

function normalizeText(value: string): string {
  return value.toLowerCase().trim()
}

function dedupeReasons(reasons: LinkReason[]): LinkReason[] {
  const seen = new Set<string>()
  return reasons.filter((reason) => {
    const key = `${reason.kind}:${reason.message}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function saveRunDetails(runId: string, context: VerificationContext): void {
  const runDir = `docs/dashboard/advisor/runs/${runId}`
  ensureDir(runDir)
  writeFileSync(`${runDir}/context.yml`, YAML.stringify(context), 'utf-8')
  writeFileSync(`${runDir}/tasks.yml`, YAML.stringify({ tasks: context.tasks }), 'utf-8')
  writeFileSync(`${runDir}/docs.yml`, YAML.stringify({ documents: context.documents }), 'utf-8')
  writeFileSync(`${runDir}/git-commits.yml`, YAML.stringify({ git_commits: context.git_commits }), 'utf-8')
  writeFileSync(`${runDir}/potential-links.yml`, YAML.stringify({ potential_links: context.potential_links }), 'utf-8')
}
