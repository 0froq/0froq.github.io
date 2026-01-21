function calculateReadingTime(text?: string): number {
  if (!text) {
    return 0
  }

  const WORDS_PER_MINUTE_ZH = 400
  const WORDS_PER_MINUTE_EN = 225
  const BLOCKS_PER_MINUTE_CODE = 1

  const content = text
    .replace(/---[\s\S]*?---/, '') // Remove frontmatter
    .replace(/<[\s\S]*?>/g, '') // Remove HTML tags

  const countZh = content.match(/[\u4E00-\u9FA5]/g)?.length || 0
  const countEn = content.match(/[a-z]/gi)?.length || 0
  const countCodeBlocks = content.match(/```[\s\S]*?```/g)?.length || 0

  const minutes = Math.ceil(
    countZh / WORDS_PER_MINUTE_ZH
    + countEn / WORDS_PER_MINUTE_EN
    + countCodeBlocks * BLOCKS_PER_MINUTE_CODE,
  )

  return minutes
}

function dealTagHierarchy(tag: string): Set<string> {
  const tags = new Set<string>()
  const levels = tag.split('/')
  levels.forEach((_: string, i: number) => {
    tags.add(levels.slice(0, i + 1).join('/'))
  })

  return tags
}

function getTags(
  html: string | undefined,
  frontmatter: Record<string, any>,
): {
  tags: Set<string>
  tagsExtended: Set<string>
} {
  let tagsExtended: Set<string> = new Set()
  const tags: Set<string> = new Set()

  if (!html) {
    return {
      tags,
      tagsExtended,
    }
  }

  const tagReg = /<a href="[./tags][^"]*">\s*<span class="tag">(.*?)<\/span>\s*<\/a>/g
  let match: RegExpExecArray | null = tagReg.exec(html)

  while (match) {
    tags.add(match[1])
    tagsExtended = new Set([...tagsExtended, ...dealTagHierarchy(match[1])])
    match = tagReg.exec(html)
  }

  if (frontmatter.tags) {
    frontmatter.tags.forEach((tag: string) => {
      tags.add(tag)
      tagsExtended = new Set([...tagsExtended, ...dealTagHierarchy(tag)])
    })
  }

  return {
    tags,
    tagsExtended,
  }
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

export {
  calculateReadingTime,
  getTags,
  normalizeCategory,
}
