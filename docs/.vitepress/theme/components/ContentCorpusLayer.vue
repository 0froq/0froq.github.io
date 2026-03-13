<script setup lang="ts">
import { useData, useRoute } from 'vitepress'
import { data as posts } from '../src/corpus.data.ts'
import LinkUnderline from './LinkUnderline.vue'
import TooltipPostInfo from './TooltipPostInfo.vue'
import QSeperator from './QSeperator.vue'

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
      un-items-center
      un-text-ellipsis
    >
      <div
        v-if="['void', 'draft'].includes(post.frontmatter.status)"
      >
        {{ post.frontmatter.status }}
      </div>
      <LinkUnderline
        :vanilla="true"
        :href="post.url"
        :text="post.title"
        :tooltip="true"
        :tooltip-text="post.frontmatter.title"
        un-w-fit
        un-max-w="50%"
        un-shrink-0
      >
        <template #tooltipAddons>
          <TooltipPostInfo :post="post" />
        </template>
      </LinkUnderline>
      <QSeperator
        type="dashed"
        un-shrink-1
      />
      <div
        un-text="neutral-500 dark:neutral-400 sm"
        un-whitespace-nowrap
      >
        {{ new Date(post.created).toLocaleDateString('en-UK', {
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
        }) }}
      </div>
      <div>
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
