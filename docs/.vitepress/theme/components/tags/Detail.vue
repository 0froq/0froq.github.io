<script setup lang="ts">
import { useData } from 'vitepress'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import ArticleList from '@/ui/article/ArticleList.vue'
import PageTitle from '@/ui/base/PageTitle.vue'
import TagDisplay from '@/ui/tag/TagDisplay.vue'
import { data as corpus } from '~/src/corpus.data'
import { data as posts } from '~/src/posts.data'

const { t } = useI18n({
  useScope: 'global',
  messages: {
    en: {
      inThis: 'In This',
      inExtended: 'In Extended',
    },
    zh: {
      inThis: '在此',
      inExtended: '在更深处',
    },
  },
})
const { params } = useData()

const articles = [
  ...corpus.map(item => ({ ...item, source: 'corpus' as const })),
  ...posts.map(item => ({ ...item, source: 'posts' as const })),
].sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())

const postsInCurrentTag = computed(() => {
  return articles.filter(post =>
    post.tags.includes(params.value?.tag),
  )
})

const postsInExtendedTags = computed(() => {
  return articles.filter(post =>
    post.tagsExtended?.some(tag => tag === params.value?.tag && !post.tags.includes(params.value?.tag)),
  )
})

function toListItems(list: typeof articles) {
  return list.map(post => ({
    url: post.url,
    title: post.title,
    created: post.created,
    frontmatter: post.frontmatter,
    source: post.source,
    post,
  }))
}

const currentItems = computed(() => toListItems(postsInCurrentTag.value))
const extendedItems = computed(() => toListItems(postsInExtendedTags.value))
</script>

<template>
  <TagDisplay />
  <Content />

  <template v-if="currentItems.length > 0">
    <PageTitle
      :title="t('inThis')"
      un-mb-8
      un-mt-8
    />
    <ArticleList
      :items="currentItems"
      show-source
    />
  </template>

  <template v-if="extendedItems.length > 0">
    <PageTitle
      :title="t('inExtended')"
      un-mb-8
      un-mt-8
    />
    <ArticleList
      :items="extendedItems"
      show-source
    />
  </template>
</template>
