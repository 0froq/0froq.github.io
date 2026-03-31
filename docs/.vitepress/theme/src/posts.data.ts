import type { PostsData } from '../types'
import { createContentLoader } from 'vitepress'
import { toChineseNumber } from '../utils/toChineseNumber'
import {
  calculateReadingTime,
  getTags,
  normalizeCategory,
} from '../utils/usePostUtils'

declare const data: PostsData[]
export { data }

export default createContentLoader('posts/**/!(index).md', {
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
      category: normalizeCategory(url.split('/')[2].split('_')[1]),
      year: String(new Date(frontmatter.created).getFullYear()),
      chineseYear: toChineseNumber(String(new Date(frontmatter.created).getFullYear())),
    }))
      .sort((a, b) => b.created.getTime() - a.created.getTime())
  },
})
