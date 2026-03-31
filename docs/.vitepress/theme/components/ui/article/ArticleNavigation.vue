<script setup lang="ts">
import type { Data } from '~/src/posts.data'
import { useI18n } from 'vue-i18n'
import TooltipArticleInfo from '@/ui/article/TooltipArticleInfo.vue'
import LinkUnderline from '@/ui/base/LinkUnderline.vue'

defineProps<{
  prevPost: Data | null
  nextPost: Data | null
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
    >
      <div
        un-text="stone-500 dark:stone-400 base"
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
        un-before="bg-stone-950 dark:bg-stone-50"
      >
        <template #tooltipAddons>
          <TooltipArticleInfo :post="post" />
        </template>
      </LinkUnderline>
      <div
        v-else
        un-text-stone-500
      >
        {{ t('noPost') }}
      </div>
    </div>
  </div>
</template>
