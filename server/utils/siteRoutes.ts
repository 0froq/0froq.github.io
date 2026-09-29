import { readdirSync } from 'node:fs'
import { join } from 'node:path'

const SECTIONS = ['essays', 'journal', 'cabinet'] as const

const STATIC_PATHS = ['/', '/cv', '/contact', '/stack', '/essays', '/journal', '/cabinet']

export function publicationPaths(docsRoot: string) {
  const paths: string[] = []
  for (const section of SECTIONS) {
    let names: string[] = []
    try {
      names = readdirSync(join(docsRoot, section))
    }
    catch {
      continue
    }
    for (const name of names) {
      if (!name.endsWith('.md') || name === 'index.md')
        continue
      paths.push(`/${section}/${name.slice(0, -3)}`)
    }
  }
  return paths
}

export function sitemapPaths(docsRoot: string) {
  return [...STATIC_PATHS, ...publicationPaths(docsRoot)]
}
