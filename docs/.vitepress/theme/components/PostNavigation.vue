<script setup lang="ts">
import type { Data } from '../src/posts.data'
import { useI18n } from 'vue-i18n'
import LinkUnderline from './LinkUnderline.vue'
import TooltipPostInfo from './TooltipPostInfo.vue'

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
      noPost: 'No more'
    },
    zh: {
      prevPost: '前文',
      nextPost: '后文',
      noPost: '没了'
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
        un-text="stone-700 dark:stone-300 hover:stone-950 dark:hover:stone-50"
        un-before="bg-emerald-600 dark:bg-emerald-400"
      >
        <template #tooltipAddons>
          <TooltipPostInfo :post="post" />
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
