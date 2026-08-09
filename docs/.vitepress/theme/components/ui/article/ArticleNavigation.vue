<script setup lang="ts">
import type { PostsData } from '~/types'
import { useI18n } from 'vue-i18n'
import TooltipArticleInfo from '@/ui/article/TooltipArticleInfo.vue'
import LinkUnderline from '@/ui/base/LinkUnderline.vue'

defineProps<{
  prevPost: PostsData | null
  nextPost: PostsData | null
}>()

const { t } = useI18n({
  useScope: 'global',
  messages: {
    en: {
      prevPost: 'Prev',
      nextPost: 'Next',
      noPost: 'No more',
    },
    zh: {
      prevPost: '前文',
      nextPost: '后文',
      noPost: '没了',
    },
  },
})
</script>

<template>
  <div un-py-20>
    <div
      v-for="(post, key) in { prevPost, nextPost }"
      :key="key"
      un-flex="~ row"
      un-font-serif
    >
      <div
        un-text="neutral-400 dark:neutral-600 base"
        un-mr-2
        un-whitespace-nowrap
      >
        {{ t(key) }}
      </div>
      <LinkUnderline
        v-if="post"
        :href="post.url"
        :text="post.frontmatter.title"
        :tooltip-text="post.frontmatter.title"
        un-before="bg-neutral-900 dark:bg-neutral-100"
      >
        <template #tooltip>
          <TooltipArticleInfo :post="post" />
        </template>
      </LinkUnderline>
      <div
        v-else
        un-text-neutral-500
      >
        {{ t('noPost') }}
      </div>
    </div>
  </div>
</template>
