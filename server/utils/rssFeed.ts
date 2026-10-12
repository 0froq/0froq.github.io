import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { publicationSections } from '../../app/utils/layers'
import { SITE_DESCRIPTION, SITE_NAME, SITE_ORIGIN, canonicalUrl } from '../../app/utils/siteConstants'

const HIDDEN = new Set(['draft', 'void'])
const CREATED_RE = /(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?/

interface FeedItem {
  title: string
  path: string
  section: string
  stamp: number
  description: string
}

function xml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function unquote(value: string) {
  if (
    (value.startsWith('"') && value.endsWith('"'))
    || (value.startsWith('\'') && value.endsWith('\''))
  )
    return value.slice(1, -1)
  return value
}

function frontmatter(raw: string) {
  const meta: Record<string, string> = {}
  if (!raw.startsWith('---'))
    return { meta, body: raw }
  const end = raw.indexOf('\n---', 3)
  if (end === -1)
    return { meta, body: raw }
  for (const line of raw.slice(3, end).split('\n')) {
    const match = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/)
    if (!match)
      continue
    meta[match[1]!] = unquote(match[2]!.trim())
  }
  return { meta, body: raw.slice(end + 4).replace(/^\r?\n/, '') }
}

function stampOf(created: string) {
  const match = created.match(CREATED_RE)
  if (!match)
    return null
  return Date.UTC(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
    Number(match[4] ?? 0),
    Number(match[5] ?? 0),
    Number(match[6] ?? 0),
  )
}

function isTagLine(line: string) {
  const parts = line.split(/\s+/).filter(Boolean)
  return parts.length > 0 && parts.every(part => /^#[\w/]+$/i.test(part))
}

function excerpt(body: string) {
  const lines: string[] = []
  for (const line of body.split('\n')) {
    const trimmed = line.trim()
    if (trimmed === '---')
      break
    if (!trimmed || trimmed.startsWith('#') || isTagLine(trimmed))
      continue
    lines.push(trimmed.replace(/^>\s?/, ''))
  }
  const text = lines
    .join(' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_`]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  if (text.length <= 320)
    return text
  const cut = text.slice(0, 320)
  const space = cut.lastIndexOf(' ')
  return `${(space > 80 ? cut.slice(0, space) : cut).trim()}…`
}

function items(docsRoot: string): FeedItem[] {
  const found: FeedItem[] = []
  for (const section of publicationSections) {
    let names: string[] = []
    try {
      names = readdirSync(join(docsRoot, section.slug))
    }
    catch {
      continue
    }
    for (const name of names) {
      if (!name.endsWith('.md') || name === 'index.md')
        continue
      const raw = readFileSync(join(docsRoot, section.slug, name), 'utf8')
      const { meta, body } = frontmatter(raw)
      if (meta.status && HIDDEN.has(meta.status))
        continue
      const stamp = stampOf(meta.created || meta.last_modified || '')
      if (stamp == null)
        continue
      const slug = name.slice(0, -3)
      found.push({
        title: meta.title || slug,
        path: `/${section.slug}/${slug}`,
        section: section.label,
        stamp,
        description: excerpt(body),
      })
    }
  }
  found.sort((a, b) => b.stamp - a.stamp)
  return found
}

export function buildRss(docsRoot: string) {
  const feed = items(docsRoot)
  const self = `${SITE_ORIGIN}/rss.xml`
  const newest = feed[0]?.stamp
  const entries = feed.map((item) => {
    const link = canonicalUrl(item.path)
    return [
      '    <item>',
      `      <title>${xml(item.title)}</title>`,
      `      <link>${xml(link)}</link>`,
      `      <guid isPermaLink="true">${xml(link)}</guid>`,
      `      <pubDate>${new Date(item.stamp).toUTCString()}</pubDate>`,
      `      <category>${xml(item.section)}</category>`,
      `      <description>${xml(item.description)}</description>`,
      '    </item>',
    ].join('\n')
  })
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '  <channel>',
    `    <title>${xml(SITE_NAME)}</title>`,
    `    <link>${xml(SITE_ORIGIN)}/</link>`,
    `    <description>${xml(SITE_DESCRIPTION)}</description>`,
    '    <language>en</language>',
    `    <atom:link href="${xml(self)}" rel="self" type="application/rss+xml"/>`,
    ...(newest == null ? [] : [`    <lastBuildDate>${new Date(newest).toUTCString()}</lastBuildDate>`]),
    ...entries,
    '  </channel>',
    '</rss>',
    '',
  ].join('\n')
}
