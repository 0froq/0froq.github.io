import type { CorpusData } from '../types'
import { createContentLoader } from 'vitepress'
import { toChineseNumber } from '../utils/toChineseNumber'
import {
  calculateReadingTime,
  getTags,
} from '../utils/usePostUtils'

declare const data: CorpusData[]
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
    }))
      .sort((a, b) => b.created.getTime() - a.created.getTime())
  },
})
