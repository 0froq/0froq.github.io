export interface CorpusData {
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
  html?: string
}

export interface PostsData {
  url: string
  frontmatter: Record<string, any>
  excerpt?: string
  created: Date
  lastModified: Date
  readingTime: number
  tagsExtended: string[]
  tags: string[]
  title: string
  html?: string
}

export interface TagUtils {
  currentTagHierarchy: string[]
  allUniqueExtendedTags: string[]
  extendedTagsForCurrentTag: string[]
}

export type TagsData = string[]
