<script setup lang="ts">
import { useData, useRoute } from 'vitepress'
import { computed } from 'vue'
import { renderMdInline } from '../../utils/renderMdInline'
import { data as corpus } from '../src/corpus.data'
import { data as posts } from '../src/posts.data'
import PostNavigation from './PostNavigation.vue'
import ProgressBarHeader from './ProgressBarHeader.vue'

const articles = [
  ...corpus,
  ...posts,
]

const { frontmatter } = useData()
const { path } = useRoute()
// const { findPostByTitle, getNextPost, getPrevPost, filterPostsByFrontmatter } = usePostFilters()

/**
 * Computed property to find the current post based on its title from frontmatter.
 * @returns The current post object or null if not found.
 */
const post = computed(() => {
  // const foundPost = findPostByTitle(frontmatter.value.title)
  // const foundPost = posts.find(post => post.frontmatter.title === frontmatter.value.title)
  const foundPost = articles.find(post => post.url === path)
  return foundPost
})

/**
 * Computed property to generate meta strings for display, such as creation date and reading time.
 * @returns An array of strings containing post metadata.
 */
const metaStrings = computed(() => {
  if (!post.value) {
    return []
  }
  const strings = [
    new Date(post.value.created).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    `约${post.value.readingTime}分钟`,
  ]
  return strings
})

/**
 * Computed property to create a pool of related posts for navigation.
 * Posts are filtered by the same category and optionally by the same series.
 * @returns An array of related post objects.
 */
const postPool = computed(() => {
  if (!post.value)
    return []
  let filteredPosts = articles.filter(p => p.frontmatter.category === post.value!.frontmatter.category)
  if (post.value.frontmatter.series) {
    filteredPosts = filteredPosts.filter(p => p.frontmatter.series === post.value!.frontmatter.series)
  }
  return filteredPosts
})

/**
 * Computed property to determine the next post in the navigation pool.
 * @returns The next post object or null if there is no next post.
 */
const nextPost = computed(() => {
  if (!post.value)
    return null
  const currentIndex = postPool.value.findIndex(p => p.url === post.value!.url)
  if (currentIndex === -1)
    return null
  return postPool.value[currentIndex + 1] ?? null
  // return getNextPost(post.value, postPool.value)
})

/**
 * Computed property to determine the previous post in the navigation pool.
 * @returns The previous post object or null if there is no previous post.
 */
const prevPost = computed(() => {
  if (!post.value)
    return null
  const currentIndex = postPool.value.findIndex(p => p.url === post.value!.url)
  if (currentIndex === -1)
    return null
  return currentIndex > 0 ? postPool.value[currentIndex - 1] : null
  // return getPrevPost(post.value, postPool.value)
})

console.warn(post.value)
</script>

<template>
  <ProgressBarHeader
    v-if="post?.frontmatter.title"
    :id="post?.frontmatter.title"
    :title="renderMdInline(post?.frontmatter.title) || ''"
  />
  <div
    un-flex="~ row"
    un-justify-end
    un-mt-4
    un-gap-4
    un-text-neutral-500
  >
    <div
      v-for="string, i in metaStrings"
      :key="i"
    >
      {{ string }}
    </div>
  </div>
  <!-- Main content slot for the post -->

  <Content
    id="content"
    data-allow-mismatch
    :class="frontmatter.unstyled ? 'unstyled' : ''"
  />

  <!-- Post navigation links (previous and next post) -->
  <PostNavigation
    :prev-post="prevPost || null"
    :next-post="nextPost || null"
  />
</template>
