import { simpleGit } from 'simple-git'
import type { GitEvidence } from './types.ts'

export async function collectGitEvidence(since: string, until: string): Promise<GitEvidence[]> {
  try {
    const git = simpleGit()
    if (!await git.checkIsRepo()) return []

    const log = await git.log({ from: since, to: until, format: { hash: '%H', date: '%ai', message: '%s' } })
    const evidence: GitEvidence[] = []

    for (const commit of log.all) {
      const show = await git.show([commit.hash, '--name-only', '--pretty=format:'])
      evidence.push({
        commitSha: commit.hash,
        commitMessage: commit.message,
        commitTime: commit.date,
        filesChanged: show.split('\n').map(file => file.trim()).filter(file => file.length > 0),
        status: 'committed',
      })
    }

    const status = await git.status()
    const untrackedFiles = [...status.not_added, ...status.created]
    const modifiedFiles = [...status.modified, ...status.staged, ...status.renamed.map(item => item.to)]

    if (untrackedFiles.length > 0) {
      evidence.push({
        commitSha: 'untracked',
        commitMessage: 'Untracked working tree changes',
        commitTime: new Date().toISOString(),
        filesChanged: [...new Set(untrackedFiles)],
        status: 'untracked',
      })
    }

    if (modifiedFiles.length > 0) {
      evidence.push({
        commitSha: 'working-tree',
        commitMessage: 'Modified working tree changes',
        commitTime: new Date().toISOString(),
        filesChanged: [...new Set(modifiedFiles)],
        status: 'modified',
      })
    }

    return evidence
  }
  catch {
    return []
  }
}

export async function getCurrentHead(): Promise<string | undefined> {
  try {
    const git = simpleGit()
    if (!await git.checkIsRepo()) return undefined
    return (await git.revparse(['HEAD'])).trim()
  }
  catch {
    return undefined
  }
}

export async function isWorkingDirectoryDirty(): Promise<boolean> {
  try {
    return (await simpleGit().status()).files.length > 0
  }
  catch {
    return false
  }
}
