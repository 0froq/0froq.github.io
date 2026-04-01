import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import YAML from 'yaml'

type WindowType = 'daily' | 'weekly'

interface LatestEnd {
  run_id: string
  window_type: WindowType
  window_id: string
  status: 'pass' | 'warn' | 'fail' | 'block'
  blocking: boolean
  issues_open: number
  has_high_severity: boolean
  proof_hash: string
  created_at: string
}

interface Issue {
  id: string
  severity: 'high' | 'medium' | 'low'
  message: string
  recommendation: string
}

const STATE_DIR = 'docs/dashboard/advisor/state'
const RUNS_DIR = 'docs/dashboard/advisor/runs'
const ACK_DIR = 'docs/dashboard/advisor/acknowledgements'

export function readLatestEnd(windowType: WindowType): LatestEnd | null {
  const filePath = `${STATE_DIR}/latest-end.${windowType}.yml`
  
  if (!existsSync(filePath)) {
    const legacyPath = `${STATE_DIR}/latest-end.json`
    if (existsSync(legacyPath)) {
      try {
        const data = JSON.parse(readFileSync(legacyPath, 'utf-8')) as LatestEnd
        if (data.window_type === windowType) return data
      } catch {}
    }
    return null
  }
  
  try {
    return YAML.parse(readFileSync(filePath, 'utf-8')) as LatestEnd
  } catch {
    return null
  }
}

export function hasAcknowledgement(runId: string): boolean {
  const issues = readIssues(runId)
  if (issues.length === 0) return true
  if (!existsSync(ACK_DIR)) return false
  
  try {
    const ackedIssueIds = new Set<string>()
    for (const file of readdirSync(ACK_DIR)) {
      if (!file.endsWith('.yaml') && !file.endsWith('.yml')) continue
      const ack = YAML.parse(readFileSync(join(ACK_DIR, file), 'utf-8'))
      ack.issue_ids?.forEach((id: string) => ackedIssueIds.add(id))
    }
    return issues.every(i => ackedIssueIds.has(i.id))
  } catch {
    return false
  }
}

export function readIssues(runId: string): Issue[] {
  const issuesPath = `${RUNS_DIR}/${runId}/issues.yml`
  const legacyPath = `${RUNS_DIR}/${runId}/issues.json`
  
  if (existsSync(issuesPath)) {
    try {
      const data = YAML.parse(readFileSync(issuesPath, 'utf-8'))
      return (data.issues || []) as Issue[]
    } catch {
      return []
    }
  }
  
  if (existsSync(legacyPath)) {
    try {
      return JSON.parse(readFileSync(legacyPath, 'utf-8')) as Issue[]
    } catch {
      return []
    }
  }
  
  return []
}
