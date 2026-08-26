const FRONTMATTER_RE = /^---[\s\S]*?---/
const HTML_TAG_RE = /<[\s\S]*?>/g
const ZH_RE = /[\u4E00-\u9FFF]/g
const EN_RE = /[a-z]/gi
const CODE_BLOCK_RE = /```[\s\S]*?```/g

/** Chinese characters plus English letter-runs. */
export function countWords(text?: string): number {
  if (!text)
    return 0
  const content = text
    .replace(FRONTMATTER_RE, '')
    .replace(CODE_BLOCK_RE, '')
    .replace(HTML_TAG_RE, '')
  const zh = content.match(ZH_RE)?.length || 0
  const en = content.match(EN_RE)?.length || 0
  return zh + en
}
