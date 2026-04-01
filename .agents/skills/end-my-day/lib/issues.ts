import type { Task, Document, LinkScore, Issue, GitEvidence } from './types.ts'

export function detectIssues(tasks: Task[], docs: Document[], links: LinkScore[], gitEvidences: GitEvidence[]): Issue[] {
  const issues: Issue[] = []
  
  for (const task of tasks) {
    const taskLinks = links.filter(l => l.task_id === task.task_id)
    
    const issueA = detectDoneWithoutEvidence(task, taskLinks)
    if (issueA) issues.push(issueA)
    
    const issueB = detectDoneWithWeakEvidence(task, taskLinks, gitEvidences)
    if (issueB) issues.push(issueB)
  }
  
  issues.push(...detectOutputWithoutTask(docs, links))
  return issues
}

function detectDoneWithoutEvidence(task: Task, links: LinkScore[]): Issue | null {
  if (task.status !== 'done') return null
  const strongOrMedium = links.filter(l => l.confidence === 'strong' || l.confidence === 'medium')
  
  if (strongOrMedium.length === 0) {
    return {
      id: `ISSUE-${task.window.id}-${task.task_id}`,
      severity: 'high',
      type: 'done_task_without_evidence',
      task_id: task.task_id,
      message: `任务 "${task.title}" 标记为 done，但未找到足够的文档或 Git 证据`,
      recommendation: '补充设计文档，或将任务改回 in_progress'
    }
  }
  return null
}

function detectDoneWithWeakEvidence(task: Task, links: LinkScore[], gitEvidences: GitEvidence[]): Issue | null {
  if (task.status !== 'done') return null
  const strongOrMedium = links.filter(l => l.confidence === 'strong' || l.confidence === 'medium')
  const onlyWeak = links.filter(l => l.confidence === 'weak')
  
  if (strongOrMedium.length === 0 && onlyWeak.length > 0) {
    const doc = onlyWeak[0]
    const isDirty = gitEvidences.some(g => g.status === 'untracked' && g.filesChanged?.some(f => doc.doc_id.includes(f)))
    
    return {
      id: `ISSUE-${task.window.id}-${task.task_id}`,
      severity: 'medium',
      type: 'done_task_only_weak_evidence',
      task_id: task.task_id,
      message: `任务 "${task.title}" 有产出但证据较弱${isDirty ? '且未提交' : ''}`,
      recommendation: isDirty ? '提交文档到 Git' : '完善文档内容或增加关联引用'
    }
  }
  return null
}

function detectOutputWithoutTask(docs: Document[], links: LinkScore[]): Issue[] {
  return docs.filter(isSignificant).map(doc => {
    const linkedDoneTasks = links.filter(l => l.doc_id === doc.path).map(l => l.task_id)
    if (linkedDoneTasks.length === 0) {
      return {
        id: `ISSUE-${doc.modifiedTime}-${doc.path}`,
        severity: doc.isNew ? 'medium' : 'low',
        type: 'output_without_done_task',
        doc_id: doc.path,
        message: `文档 "${doc.frontmatter.title || doc.path}" 有显著产出但未关联到 done 任务`,
        recommendation: '检查是否忘记勾选相关任务，或为此产出创建新任务'
      } as Issue
    }
    return null
  }).filter(Boolean) as Issue[]
}

function isSignificant(doc: Document): boolean {
  if (doc.isNew) return true
  if (doc.path.startsWith('posts/') && doc.isNew) return true
  if (doc.diffStats?.additions && doc.diffStats.additions >= 50) return true
  return false
}
