import type { Ref } from 'vue'
import { useData } from 'vitepress'
import { computed } from 'vue'
import { data as corpus } from '../src/corpus.data'
import { data as posts } from '../src/posts.data'

const articles = [...corpus, ...posts]

/**
 * Provides utility functions and computed properties for tag-related logic.
 */
export function useTagUtils() {
  const { params } = useData()

  /**
   * Computes the hierarchical path of the current tag.
   * E.g., for "tech/frontend/vue", it returns ["tech", "tech/frontend", "tech/frontend/vue"].
   */
  const currentTagHierarchy: Ref<string[]> = computed(() => {
    if (!params.value?.tag)
      return []
    return params.value.tag
      .split('/')
      .map((_tag: string, index: number, hierarchy: string[]) => {
        return hierarchy.slice(0, index + 1).join('/')
      })
  })

  /**
   * Computes all unique extended tags from all posts, sorted alphabetically.
   */
  const allUniqueExtendedTags = computed(() => {
    return [...new Set(articles.map(post => post.tagsExtended).flat())].sort()
  })

  /**
   * Filters extended tags that start with the current tag but are not the current tag itself.
   */
  const extendedTagsForCurrentTag = computed(() => {
    if (!params.value?.tag)
      return []
    return allUniqueExtendedTags.value.filter(
      tag => tag.startsWith(params.value!.tag) && tag !== params.value!.tag,
    )
  })

  return {
    currentTagHierarchy,
    allUniqueExtendedTags,
    extendedTagsForCurrentTag,
  }
}
