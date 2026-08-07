import { getTags } from '../../../../scripts/lib/tagHierarchy.mjs'

const FRONTMATTER_RE = /---[\s\S]*?---/
const HTML_TAG_RE = /<[\s\S]*?>/g
const ZH_RE = /[\u4E00-\u9FA5]/g
const EN_RE = /[a-z]/gi
const CODE_BLOCK_RE = /```[\s\S]*?```/g

function calculateReadingTime(text?: string): number {
  if (!text) {
    return 0
  }

  const WORDS_PER_MINUTE_ZH = 400
  const WORDS_PER_MINUTE_EN = 225
  const BLOCKS_PER_MINUTE_CODE = 1

  const content = text
    .replace(FRONTMATTER_RE, '') // Remove frontmatter
    .replace(HTML_TAG_RE, '') // Remove HTML tags

  const countZh = content.match(ZH_RE)?.length || 0
  const countEn = content.match(EN_RE)?.length || 0
  const countCodeBlocks = content.match(CODE_BLOCK_RE)?.length || 0

  const minutes = Math.ceil(
    countZh / WORDS_PER_MINUTE_ZH
    + countEn / WORDS_PER_MINUTE_EN
    + countCodeBlocks * BLOCKS_PER_MINUTE_CODE,
  )

  return minutes
}

function normalizeCategory(category: string | undefined): string {
  const categoryMap: Record<string, string> = {
    log: '代序',
    roadmap: '成言',
    collection: '前脩',
  }
  if (!category) {
    return '未分类'
  }
  return categoryMap[category] || category
}

export { calculateReadingTime, getTags, normalizeCategory }
