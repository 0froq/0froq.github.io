<script setup lang="ts">
import { computed } from 'vue'
import ArticleList from '@/ui/article/ArticleList.vue'
import { data as corpus } from '~/src/corpus.data'
import { data as posts } from '~/src/posts.data'

const DAYS = 14
const LIMIT = 7

interface Entry {
  url: string
  title: string
  created: Date | string
  frontmatter: Record<string, any>
  source: 'corpus' | 'posts'
  readingTime?: number
  tags?: string[]
  excerpt?: string
  raw: Record<string, any>
}

const allEntries = computed<Entry[]>(() => {
  const fromCorpus = corpus
    .filter(p => !p.frontmatter.index)
    .map(p => ({
      url: p.url,
      title: p.title,
      created: p.created,
      frontmatter: p.frontmatter,
      source: 'corpus' as const,
      readingTime: p.readingTime,
      tags: p.tags,
      excerpt: p.excerpt,
      raw: p,
    }))
  const fromPosts = posts.map(p => ({
    url: p.url,
    title: p.title,
    created: p.created,
    frontmatter: p.frontmatter,
    source: 'posts' as const,
    readingTime: p.readingTime,
    tags: p.tags,
    excerpt: p.excerpt,
    raw: p,
  }))
  return [...fromCorpus, ...fromPosts]
    .filter(p => !p.frontmatter.aigc)
    .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())
})

const items = computed(() => {
  const cutoff = Date.now() - DAYS * 24 * 60 * 60 * 1000
  const list = allEntries.value
  const recent = list
    .filter((p) => {
      const created = new Date(p.created).getTime()
      return Number.isFinite(created) && created >= cutoff
    })
    .slice(0, LIMIT)

  const filled = [...recent]
  if (filled.length < LIMIT) {
    const recentUrls = new Set(recent.map(p => p.url))
    for (const p of list) {
      if (filled.length >= LIMIT)
        break
      if (recentUrls.has(p.url))
        continue
      filled.push(p)
    }
    filled.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())
  }

  return filled.map(p => ({
    url: p.url,
    title: p.title,
    created: p.created,
    frontmatter: p.frontmatter,
    source: p.source,
    excerpt: p.excerpt,
    post: p.raw,
  }))
})
</script>

<template>
  <ArticleList
    v-if="items.length"
    :items="items"
    title-serif
    show-source
    :show-badges="true"
  />
</template>
