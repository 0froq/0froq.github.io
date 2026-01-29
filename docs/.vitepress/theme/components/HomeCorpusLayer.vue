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
  <un-page-content
    un-min-h="[calc(100vh-15rem)]"
  >
    <LinkUnderline
      href="/corpus/"
      text="> cd ../"
      un-inline-block
      un-text-sm
      un-font-mono
      un-text="neutral-600 dark:neutral-400"
      un-before="h-px bg-neutral-950 dark:bg-neutral-50"
    />
    <div
      un-flex="~ row wrap"
      un-gap-2
    >
      <LinkUnderline
        v-for="({ label, url }) in [
          { label: 'Autopsia', url: '000_autopsia/' },
          { label: 'Ingesta', url: '100_ingesta/' },
          { label: 'Neoplasma', url: '200_neoplasma/' },
          { label: 'Putredo', url: '300_putredo/' },
          { label: 'Delirium', url: '400_delirium/' },
          { label: 'Vigil', url: '500_vigil/' },
        ]"
        :key="url"
        :href="`/corpus/${url}`"
        :text="label"
        un-inline-block
        un-text-sm
        un-text="neutral-600 dark:neutral-400"
        un-before="h-px bg-neutral-950 dark:bg-neutral-50"
        :data-current="path.endsWith(url) ? 'true' : ''"
      />
    </div>
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
  </un-page-content>
</template>

<style scoped>
[data-current='true'] {
  --uno: 'text-neutral-950 dark:text-neutral-50 font-semibold';
  --uno: 'before:(w-full bg-neutral-950 dark:bg-neutral-50)';
}
</style>
