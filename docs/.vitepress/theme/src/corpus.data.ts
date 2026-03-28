import { createContentLoader } from 'vitepress'
import { toChineseNumber } from '../utils/toChineseNumber'
import {
  calculateReadingTime,
  getTags,
  normalizeCategory,
} from '../utils/usePostUtils'

export interface Data {
  url: string
  frontmatter: Record<string, any>
  excerpt?: string
  created: Date
  lastModified: Date
  readingTime: number
  tagsExtended: string[]
  tags: string[]
  title: string
  layer: string
  year: string
  chineseYear: string
  // groupProperty: {
  //   category: string
  //   chineseYear: string
  // }
  html?: string
}

declare const data: Data[]
export { data }

export default createContentLoader([
  'corpus/!(_template)/!(index).md',
], {
  includeSrc: true,
  excerpt: true,
  render: true,
  transform(raw) {
    return raw.map(({ html, url, frontmatter, excerpt, src }) => ({
      url,
      frontmatter,
      excerpt,
      created: new Date(frontmatter.created),
      lastModified: new Date(frontmatter.last_modified),
      readingTime: calculateReadingTime(src),
      tags: [...getTags(html, frontmatter).tags],
      tagsExtended: [...getTags(html, frontmatter).tagsExtended],
      title: frontmatter.title,
      layer: url.split('/')[2],
      year: String(new Date(frontmatter.created).getFullYear()),
      chineseYear: toChineseNumber(String(new Date(frontmatter.created).getFullYear())),
      groupProperty: {
        // category: frontmatter.category,
        // Use url to determine category to avoid issues with missing frontmatter
        // category: normalizeCategory(url.split('/')[-1].split('_')[1]) || '未分类',
      },
    }))
      .sort((a, b) => b.created.getTime() - a.created.getTime())
  },
})
