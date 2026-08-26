import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import process from 'node:process'
import { countWords } from '~/utils/countWords'
import { SITE_LAUNCH_AT } from '~/utils/siteConstants'

const SKIP = new Set(['index.md'])

async function walkMarkdown(dir: string, acc: string[]): Promise<void> {
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  }
  catch {
    return
  }
  for (const entry of entries) {
    if (entry.name.startsWith('.') || entry.name.startsWith('_'))
      continue
    const path = join(dir, entry.name)
    if (entry.isDirectory()) {
      await walkMarkdown(path, acc)
      continue
    }
    if (entry.isFile() && entry.name.endsWith('.md') && !SKIP.has(entry.name))
      acc.push(path)
  }
}

export default defineEventHandler(async () => {
  const roots = [
    join(process.cwd(), 'docs/posts'),
    join(process.cwd(), 'docs/corpus'),
  ]
  const files: string[] = []
  for (const root of roots)
    await walkMarkdown(root, files)

  let totalWordCount = 0
  let entries = 0

  for (const file of files) {
    let text = ''
    try {
      text = await readFile(file, 'utf-8')
    }
    catch {
      continue
    }
    entries++
    totalWordCount += countWords(text)
  }

  return {
    totalWordCount,
    entryCount: entries,
    siteLaunchAt: SITE_LAUNCH_AT,
  }
})
