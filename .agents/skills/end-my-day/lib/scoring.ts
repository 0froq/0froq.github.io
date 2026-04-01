import type { Task, Document, GitEvidence, LinkScore, Evidence } from './types.ts'

export function calculateLinkScore(task: Task, doc: Document, gitEvidences: GitEvidence[]): LinkScore {
  const evidence: Evidence[] = []
  let totalScore = 0
  
  if (doc.frontmatter.tasks?.includes(task.task_id)) {
    evidence.push({ type: 'frontmatter_task_ref', score: 70, value: task.task_id })
    totalScore += 70
  }
  
  for (const git of gitEvidences) {
    if (git.commitMessage?.includes(task.task_id) || git.commitMessage?.includes(task.title)) {
      evidence.push({ type: 'commit_message_ref', score: 50, value: git.commitSha })
      totalScore += 50
    }
  }
  
  if (task.expected_paths?.some(pattern => matchPath(doc.path, pattern))) {
    evidence.push({ type: 'path_match', score: 20, value: doc.path })
    totalScore += 20
  }
  
  const tagOverlap = intersect(task.tags || [], doc.frontmatter.tags || [])
  if (tagOverlap.length > 0) {
    evidence.push({ type: 'tag_overlap', score: 10, value: tagOverlap.join(',') })
    totalScore += 10
  }
  
  const keywordOverlap = intersect(
    extractKeywords(task.title + ' ' + (task.dod || '')),
    extractKeywords((doc.frontmatter.title || '') + ' ' + doc.headings.join(' '))
  )
  if (keywordOverlap.length > 0) {
    evidence.push({ type: 'keyword_match', score: Math.min(10, keywordOverlap.length * 2), value: keywordOverlap.join(',') })
    totalScore += Math.min(10, keywordOverlap.length * 2)
  }
  
  evidence.push({ type: 'time_overlap', score: 8, value: doc.modifiedTime })
  totalScore += 8
  
  for (const git of gitEvidences) {
    if (task.sourceFile && git.filesChanged?.includes(task.sourceFile)) {
      evidence.push({ type: 'same_commit', score: 8, value: git.commitSha })
      totalScore += 8
    }
  }
  
  const confidence = totalScore >= 70 ? 'strong' : totalScore >= 45 ? 'medium' : 'weak'
  
  return { task_id: task.task_id, doc_id: doc.path, score: totalScore, confidence, evidence }
}

function matchPath(path: string, pattern: string): boolean {
  const regex = pattern
    .replace(/\*\*/g, '{{GLOBSTAR}}')
    .replace(/\*/g, '[^/]*')
    .replace(/\?/g, '.')
    .replace(/{{GLOBSTAR}}/g, '.*')
  return new RegExp(`^${regex}$`).test(path)
}

function extractKeywords(text: string): string[] {
  return [...new Set(text.toLowerCase()
    .replace(/[^\u4e00-\u9fa5a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 2))]
}

function intersect(a: string[], b: string[]): string[] {
  return a.filter(x => b.includes(x))
}
