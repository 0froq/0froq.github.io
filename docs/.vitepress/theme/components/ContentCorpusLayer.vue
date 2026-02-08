<script setup lang="ts">
import { useData, useRoute } from 'vitepress'
import { data as posts } from '../src/corpus.data.ts'
import LinkUnderline from './LinkUnderline.vue'
import TooltipPostInfo from './TooltipPostInfo.vue'

const { path } = useRoute()

const thisPosts = posts.filter((post) => {
  return post.layer === path.split('/')[2] && !post.frontmatter.home
})
</script>

<template>
  <div
    un-mt-8
  >
    <div
      v-for="post in thisPosts"
      :key="post.url"
      un-gap-2
      un-flex="~ row"
      un-items-baseline
      un-text-ellipsis
    >
      <LinkUnderline
        :vanilla="true"
        :href="post.url"
        :text="post.title"
        :tooltip="true"
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
        {{ new Date(post.created).toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }) }}
      </div>
    </div>
  </div>
</template>

<style scoped>
[data-current='true'] {
  --uno: 'text-neutral-950 dark:text-neutral-50 font-semibold';
  --uno: 'before:(w-full bg-neutral-950 dark:bg-neutral-50)';
}
</style>
