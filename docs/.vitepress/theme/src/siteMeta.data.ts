import { createContentLoader } from 'vitepress'
import { SITE_LAUNCH_AT } from '../composables/stats/constants'
import { countWords } from '../utils/usePostUtils'

export interface SiteMeta {
  totalWordCount: number
  entryCount: number
  siteLaunchAt: string
}

declare const data: SiteMeta
export { data }

/**
 * Build-time site aggregates (word count, launch timestamp).
 * Not a list — transform returns a single meta object.
 */
export default createContentLoader([
  'posts/**/!(index).md',
  'corpus/!(_template)/!(index).md',
], {
  includeSrc: true,
  transform(raw): SiteMeta {
    const totalWordCount = raw.reduce(
      (sum, entry) => sum + countWords(entry.src),
      0,
    )
    return {
      totalWordCount,
      entryCount: raw.length,
      siteLaunchAt: SITE_LAUNCH_AT,
    }
  },
})
