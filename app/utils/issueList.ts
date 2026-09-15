import { countWords } from '~/utils/countWords'

export interface LayerEntry {
  path: string
  title: string
  created?: string
  last_modified?: string
  status?: string
  aigc?: boolean
  locale?: string
  kind?: string
  description?: string
  slip?: string
  words?: number
  tags?: string[]
}

function nodeText(node: unknown): string {
  if (typeof node === 'string' || typeof node === 'number')
    return String(node)
  if (!Array.isArray(node))
    return ''
  return node.slice(2).map(nodeText).join('')
}

function bodyNodes(body: unknown): unknown[] | null {
  if (!body || typeof body !== 'object' || !('value' in body))
    return null
  const value = (body as { value: unknown }).value
  return Array.isArray(value) ? value : null
}

function nodePlain(node: unknown): string {
  return nodeText(node).replace(/\s+/g, ' ').trim()
}

/** Cairn tag lines, including ATX headings that ate the first `#`. */
function parseTagLine(text: string): string[] | null {
  const parts = text.split(/\s+/).filter(Boolean)
  if (!parts.length)
    return null
  const tags: string[] = []
  let sawHash = false
  let sawSlash = false
  for (const part of parts) {
    const hashed = part.startsWith('#')
    const raw = hashed ? part.slice(1) : part
    if (!raw || !/^[A-Z][\w/]*$/i.test(raw))
      return null
    if (hashed)
      sawHash = true
    if (raw.includes('/'))
      sawSlash = true
    tags.push(raw)
  }
  if (!sawHash && !sawSlash)
    return null
  return tags
}

export function isIssueTagLine(text: string): boolean {
  return parseTagLine(text) != null
}

/** First real paragraph, stopping at a thematic break. */
export function issueExcerpt(body: unknown, fallback?: string): string {
  const fromMeta = fallback?.trim()
  if (fromMeta)
    return fromMeta
  const nodes = bodyNodes(body)
  if (!nodes)
    return ''
  for (const node of nodes) {
    if (!Array.isArray(node))
      continue
    const tag = node[0]
    if (tag === 'hr')
      break
    if (tag !== 'p')
      continue
    const text = nodePlain(node)
    if (!text || text === '[[toc]]' || parseTagLine(text) || text.startsWith('#'))
      continue
    return text
  }
  return ''
}

/** Opening note of a gathering, stopping at the first break or heading. */
export function issueGatheringNote(body: unknown, fallback?: string): string {
  const nodes = bodyNodes(body)
  if (nodes) {
    const paras: string[] = []
    for (const node of nodes) {
      if (!Array.isArray(node))
        continue
      const tag = node[0]
      if (tag === 'hr' || (typeof tag === 'string' && /^h[1-6]$/.test(tag)))
        break
      if (tag !== 'p')
        continue
      const text = nodePlain(node)
      if (!text || text === '[[toc]]' || parseTagLine(text) || text.startsWith('#'))
        continue
      paras.push(text)
    }
    const joined = paras.join(' ').trim()
    if (joined)
      return joined
  }
  return fallback?.trim() || ''
}

/** First readable fragment, including text after a break. Used as a cabinet slip. */
export function issueSlip(body: unknown, fallback?: string): string {
  const nodes = bodyNodes(body)
  if (nodes) {
    const paras: string[] = []
    for (const node of nodes) {
      if (!Array.isArray(node))
        continue
      const tag = node[0]
      if (tag !== 'p' && tag !== 'blockquote')
        continue
      const text = nodePlain(node)
      if (!text || text === '[[toc]]' || parseTagLine(text) || text.startsWith('#'))
        continue
      paras.push(text)
      if (paras.join(' ').length > 200)
        break
    }
    const joined = paras.join(' ').trim()
    if (joined) {
      if (joined.length <= 240)
        return joined
      return `${joined.slice(0, 240).replace(/\s+\S*$/, '')}…`
    }
  }
  return fallback?.trim() || ''
}

export function issueTags(body: unknown): string[] {
  const nodes = bodyNodes(body)
  if (!nodes)
    return []
  const tags: string[] = []
  for (const node of nodes) {
    if (!Array.isArray(node))
      continue
    const parsed = parseTagLine(nodePlain(node))
    if (parsed)
      tags.push(...parsed)
  }
  return [...new Set(tags)]
}

export function issueWords(body: unknown): number {
  const nodes = bodyNodes(body)
  if (!nodes)
    return 0
  let text = ''
  for (const node of nodes) {
    const chunk = nodePlain(node)
    if (!chunk || chunk === '[[toc]]' || parseTagLine(chunk))
      continue
    text += ` ${chunk}`
  }
  return countWords(text)
}

export function toLayerEntry(entry: {
  path: string
  title?: string
  stem?: string
  created?: string
  status?: string
  aigc?: boolean
  locale?: string
  kind?: string
  last_modified?: string
  description?: string
  body?: unknown
}): LayerEntry {
  const title = entry.title || entry.stem || entry.path
  return {
    path: entry.path,
    title,
    created: entry.created,
    last_modified: entry.last_modified,
    status: entry.status,
    aigc: entry.aigc,
    locale: resolveLocale(entry.path, entry.locale, title),
    kind: entry.kind,
    description: issueExcerpt(entry.body, entry.description),
    slip: entry.kind === 'evergreen'
      ? issueGatheringNote(entry.body, entry.description)
      : issueSlip(entry.body, entry.description),
    words: issueWords(entry.body),
    tags: issueTags(entry.body),
  }
}

export function isIssueEvergreen(entry: Pick<LayerEntry, 'kind'>): boolean {
  return entry.kind === 'evergreen'
}

/** List/peek flags shared across hub surfaces. */
export function issueMetaFlags(entry: Pick<LayerEntry, 'aigc' | 'status'>): string[] {
  const flags: string[] = []
  if (entry.aigc)
    flags.push('aigc')
  if (entry.status === 'draft')
    flags.push('draft')
  if (entry.status === 'void')
    flags.push('void')
  return flags
}

/** Show only non-English locales as list flags. */
export function resolveLocale(
  path: string,
  locale: string | undefined,
  title: string,
): string | undefined {
  const raw = locale?.trim().toLowerCase()
  if (raw === 'en' || /\/en(\/|$)/.test(path))
    return undefined
  if (raw && raw !== 'en')
    return raw
  if (/[\u3400-\u9FFF]/.test(title))
    return 'zh'
  return undefined
}

/** Stable-ish sample of recent entries for hub home. */
export function pickHubEntries(entries: LayerEntry[], count = 6): LayerEntry[] {
  if (entries.length <= count)
    return entries
  const recent = entries.slice(0, Math.min(entries.length, count * 3))
  const picked: LayerEntry[] = []
  const used = new Set<string>()
  // Prefer first of each third, then fill.
  for (let i = 0; i < recent.length && picked.length < count; i += 3) {
    const item = recent[i]!
    picked.push(item)
    used.add(item.path)
  }
  for (const item of recent) {
    if (picked.length >= count)
      break
    if (used.has(item.path))
      continue
    picked.push(item)
    used.add(item.path)
  }
  return picked
}
