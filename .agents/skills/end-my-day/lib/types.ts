export type TaskStatus = 'done' | 'inprogress' | 'notstarted' | 'deferred' | 'cancelled' | 'blocked'
export type Priority = 'high' | 'medium' | 'low'
export type WindowType = 'daily' | 'weekly'
export type VerdictStatus = 'pass' | 'warn' | 'fail' | 'block'
export type Confidence = 'strong' | 'medium' | 'weak'
export type Severity = 'high' | 'medium' | 'low'

export interface TaskLink {
  label: string
  url: string
}

export interface Task {
  task_id: string
  title: string
  status: TaskStatus
  priority: Priority
  dod?: string
  tags?: string[]
  links?: TaskLink[]
  expected_paths?: string[]
  sourceFile?: string
  window: TimeWindow
}

export interface TimeWindow {
  type: WindowType
  id: string
  start: string
  end: string
}

export interface Document {
  path: string
  frontmatter: {
    title?: string
    tasks?: string[]
    tags?: string[]
    [key: string]: unknown
  }
  headings: string[]
  modifiedTime: string
  isNew: boolean
  diffStats?: { additions: number; deletions: number }
}

export interface GitCommit {
  commitSha: string
  commitMessage: string
  commitTime: string
  filesChanged: string[]
  status: 'committed' | 'untracked' | 'modified'
}

export type GitEvidence = GitCommit

export interface Evidence {
  type: 'frontmatter_task_ref' | 'commit_message_ref' | 'path_match' | 'tag_overlap' | 'keyword_match' | 'time_overlap' | 'same_commit'
  score: number
  value: string
}

export interface LinkScore {
  task_id: string
  doc_id: string
  score: number
  confidence: Confidence
  evidence: Evidence[]
}

export interface PotentialLink {
  task_id: string
  doc_path: string
  confidence: Confidence
  reasons: string[]
  related_commit_shas?: string[]
}

export interface Issue {
  id: string
  severity: Severity
  type: 'done_task_without_evidence' | 'done_task_only_weak_evidence' | 'output_without_done_task'
  task_id?: string
  doc_id?: string
  message: string
  recommendation: string
  user_ack?: string
  ack_by?: string
  ack_at?: string
}

export interface VerificationInput {
  window_type: WindowType
  window_id: string
  plan: {
    tasks: Array<{
      title: string
      status: string
      priority: Priority
      dod?: string
      tags?: string[]
      links?: TaskLink[]
    }>
  }
  daily_plans?: Array<{
    date: string
    tasks: Array<{
      title: string
      status: string
      priority: Priority
    }>
  }>
  corpus_dirs: string[]
  git_enabled: boolean
}

export interface VerificationContext {
  run_id: string
  window: { type: WindowType; id: string }
  tasks: Task[]
  documents: Document[]
  git_commits: GitCommit[]
  potential_links: PotentialLink[]
}

export type VerificationResult = VerificationContext

export interface LatestEnd {
  run_id: string
  window_type: WindowType
  window_id: string
  status: VerdictStatus
  blocking: boolean
  issues_open: number
  has_high_severity: boolean
  proof_hash: string
  created_at: string
}

export interface Acknowledgement {
  id: string
  issue_ids: string[]
  reason: string
  provided_by: 'user' | 'system'
  provided_at: string
  expires_after_runs: number
}
