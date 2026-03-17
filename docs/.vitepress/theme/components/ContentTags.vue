<script setup lang="ts">
import { useData } from 'vitepress'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { data as corpus } from '../src/corpus.data'
import { data as posts } from '../src/posts.data'
import LinkUnderline from './LinkUnderline.vue'
import ProgressBarHeader from './ProgressBarHeader.vue'
import TagDisplay from './TagDisplay.vue'
import TooltipPostInfo from './TooltipPostInfo.vue'

const { t, d } = useI18n({
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

// Combine corpus and posts data
// Add a 'source' field to distinguish between corpus and posts
const articles = [
  ...corpus.map(item => ({ ...item, source: 'corpus' })),
  ...posts.map(item => ({ ...item, source: 'posts' })),
]

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
</script>

<template>
  <TagDisplay />
  <Content />
  <div
    v-for="_posts in [
      {
        label: t('inThis'),
        posts: postsInCurrentTag,
      },
      {
        label: t('inExtended'),
        posts: postsInExtendedTags,
      },
    ]"
    :key="_posts.label"
    un-mt-8
  >
    <ProgressBarHeader
      :title="_posts.label"
      un-mb-8
    />
    <div
      v-for="post in _posts.posts"
      :key="post.url"
      un-gap-2
      un-flex="~ row"
      un-items-baseline
      un-text-ellipsis
    >
      <span
        v-if="post.source === 'corpus'"
        un-text="rose-600 dark:rose-400"
        un-font-mono
        un-px-1
      >C
      </span>
      <span
        v-else
        un-text="emerald-600 dark:emerald-400"
        un-font-mono
        un-px-1
      >P
      </span>
      <LinkUnderline
        :vanilla="true"
        :href="post.url"
        :text="post.title"
        :tooltip-text="post.frontmatter.title"
        un-min-w-0
      >
        <template #tooltipAddons>
          <TooltipPostInfo :post="post" />
        </template>
      </LinkUnderline>
      <div
        un-text="neutral-500 dark:neutral-400 xs"
        un-whitespace-nowrap
      >
        {{ d(new Date(post.created), 'short') }}
      </div>
    </div>
  </div>
</template>
