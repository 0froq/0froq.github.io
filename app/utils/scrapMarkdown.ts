import { charsOf } from '~/utils/textStream'

export type ScrapMdPart =
  | { type: 'text', value: string }
  | { type: 'link', href: string, label: string }

const LINK_RE = /\[([^\]]+)\]\(([^)\s]+)\)/g

export function parseScrapMarkdown(source: string): ScrapMdPart[] {
  const parts: ScrapMdPart[] = []
  let last = 0
  for (const match of source.matchAll(LINK_RE)) {
    const index = match.index ?? 0
    if (index > last)
      parts.push({ type: 'text', value: source.slice(last, index) })
    parts.push({
      type: 'link',
      label: match[1] ?? '',
      href: match[2] ?? '',
    })
    last = index + match[0].length
  }
  if (last < source.length)
    parts.push({ type: 'text', value: source.slice(last) })
  return parts
}

export { charsOf }

export function scrapPlainText(source: string) {
  return parseScrapMarkdown(source).map(part => (
    part.type === 'text' ? part.value : part.label
  )).join('')
}

export function scrapCharCount(parts: ScrapMdPart[]) {
  return parts.reduce((count, part) => {
    const value = part.type === 'text' ? part.value : part.label
    return count + charsOf(value).length
  }, 0)
}

export function takeScrapChars(parts: ScrapMdPart[], charCount: number): ScrapMdPart[] {
  const out: ScrapMdPart[] = []
  let left = Math.max(0, charCount)
  for (const part of parts) {
    if (left <= 0)
      break
    const chars = charsOf(part.type === 'text' ? part.value : part.label)
    if (chars.length <= left) {
      out.push(part)
      left -= chars.length
      continue
    }
    const slice = chars.slice(0, left).join('')
    if (part.type === 'link')
      out.push({ type: 'link', href: part.href, label: slice })
    else
      out.push({ type: 'text', value: slice })
    left = 0
  }
  return out
}
