import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import YAML from 'yaml'
import type { LatestEnd, Acknowledgement, VerdictStatus, WindowType, Issue } from './types.ts'

const STATE_DIR = 'docs/dashboard/advisor/state'
const ACK_DIR = 'docs/dashboard/advisor/acknowledgements'
const RUNS_DIR = 'docs/dashboard/advisor/runs'

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

export function writeLatestEnd(
  runId: string,
  windowType: WindowType,
  windowId: string,
  status: VerdictStatus,
  issues: Issue[],
  proofHash: string
): void {
  ensureDir(STATE_DIR)
  const highIssues = issues.filter(i => i.severity === 'high')
  
  const data: LatestEnd = {
    run_id: runId,
    window_type: windowType,
    window_id: windowId,
    status,
    blocking: status === 'fail' || status === 'block' || highIssues.length > 0,
    issues_open: issues.filter(i => !i.user_ack).length,
    has_high_severity: highIssues.length > 0,
    proof_hash: proofHash,
    created_at: new Date().toISOString()
  }
  
  writeFileSync(`${STATE_DIR}/latest-end.${windowType}.yml`, YAML.stringify(data), 'utf-8')
}

export function hasAcknowledgement(runId: string): boolean {
  const issues = readIssues(runId)
  if (issues.length === 0) return true
  if (!existsSync(ACK_DIR)) return false
  
  try {
    const ackedIssueIds = new Set<string>()
    for (const file of readdirSync(ACK_DIR)) {
      if (!file.endsWith('.yaml') && !file.endsWith('.yml')) continue
      const ack = YAML.parse(readFileSync(join(ACK_DIR, file), 'utf-8')) as Acknowledgement
      ack.issue_ids.forEach(id => ackedIssueIds.add(id))
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

export function writeAcknowledgement(ack: Acknowledgement): void {
  ensureDir(ACK_DIR)
  writeFileSync(`${ACK_DIR}/${ack.id}.yml`, YAML.stringify(ack), 'utf-8')
}

export function ensureDir(dir: string): void {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
}
