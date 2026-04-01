import { existsSync, readFileSync, statSync, readdirSync } from 'node:fs'
import { join, extname } from 'node:path'
import YAML from 'yaml'
import type { Document } from './types.ts'

export function scanDirectories(dirs: string[]): Document[] {
  const docs: Document[] = []
  for (const dir of dirs) {
    if (!existsSync(dir)) continue
    docs.push(...scanDirectory(dir))
  }
  return docs
}

function scanDirectory(dir: string): Document[] {
  const docs: Document[] = []
  try {
    const entries = readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = join(dir, entry.name)
      if (entry.isDirectory()) {
        docs.push(...scanDirectory(fullPath))
      } else if (extname(entry.name) === '.md') {
        const doc = parseDocument(fullPath)
        if (doc) docs.push(doc)
      }
    }
  } catch {}
  return docs
}

function parseDocument(path: string): Document | null {
  try {
    const content = readFileSync(path, 'utf-8')
    const stats = statSync(path)
    const match = content.match(/^---\n([\s\S]*?)\n---/)
    const frontmatter = match ? YAML.parse(match[1]) || {} : {}
    const headings = content.split('\n')
      .map(line => line.match(/^#{1,6}\s+(.+)$/)?.[1]?.trim())
      .filter(Boolean) as string[]
    
    return {
      path,
      frontmatter,
      headings,
      modifiedTime: stats.mtime.toISOString(),
      isNew: false
    }
  } catch {
    return null
  }
}

export function filterDocsByWindow(docs: Document[], start: string, end: string): Document[] {
  const startTime = new Date(start).getTime()
  const endTime = new Date(end).getTime()
  return docs.filter(doc => {
    const docTime = new Date(doc.modifiedTime).getTime()
    return docTime >= startTime && docTime <= endTime
  })
}
