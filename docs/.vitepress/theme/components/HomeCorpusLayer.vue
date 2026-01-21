<script setup lang="ts">
import { useData, useRoute } from 'vitepress'
import { data as posts } from '../src/corpus.data.ts'
import LinkUnderline from './LinkUnderline.vue'
import TooltipPostInfo from './TooltipPostInfo.vue'

const thisPosts = posts.filter((post) => {
  return post.layer === useRoute().path.split('/')[2] && !post.frontmatter.home
})
</script>

<template>
  <un-page-content
    un-min-h-100vh
  >
    <div
      v-for="post in thisPosts"
      :key="post.url"
      un-gap-2
      un-flex="~ row"
      un-items-baseline
    >
      <LinkUnderline
        :vanilla="true"
        :href="post.url"
        :text="post.title"
        :tooltip="true"
        :tooltip-text="post.frontmatter.title"
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
  </un-page-content>
</template>
