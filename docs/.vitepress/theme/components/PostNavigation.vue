<script setup lang="ts">
import type { Data } from '../src/posts.data'
import LinkUnderline from './LinkUnderline.vue'
import TooltipPostInfo from './TooltipPostInfo.vue'

defineProps<{
  prevPost: Data | null
  nextPost: Data | null
}>()
</script>

<template>
  <div un-py-20>
    <div
      v-for="(post, key) in { 前文: prevPost, 后文: nextPost }"
      :key="key"
      un-flex="~ row"
    >
      <div
        un-text="neutral-500 dark:neutral-400 base"
        un-mr-2
        un-whitespace-nowrap
      >
        {{ key }}
      </div>
      <LinkUnderline
        v-if="post"
        :href="post.url"
        :text="post.frontmatter.title"
        :tooltip="true"
        :tooltip-text="post.frontmatter.title"
        un-text="neutral-700 dark:neutral-300 hover:neutral-950 dark:hover:neutral-50"
        un-before="bg-emerald-600 dark:bg-emerald-600/80"
      >
        <template #tooltipAddons>
          <TooltipPostInfo :post="post" />
        </template>
      </LinkUnderline>
      <div
        v-else
        un-text-neutral-500
      >
        没了
      </div>
    </div>

    <!-- <div
        un-text="neutral-500 dark:neutral-400 base"
        un-mr-2
        un-whitespace-nowrap
      >
        前文
      </div>

      <LinkUnderline
        v-if="prevPost"
        :href="prevPost.url"
        :text="prevPost.frontmatter.title"
        :tooltip="true"
        :tooltip-text="prevPost.frontmatter.title"
        un-text="neutral-700 dark:neutral-300 hover:neutral-950 dark:hover:neutral-50"
        un-before="bg-emerald-600 dark:bg-emerald-600/80"
      >
        <template #tooltipAddons>
          <div
            un-flex="~ row"
            un-text="sm neutral-600 dark:neutral-400"
            un-justify-end
            un-gap-5
          >
            {{ `约${prevPost.readingTime.toString()}分钟` }}
          </div>
        </template>
      </LinkUnderline>
      <div v-else>
        没了
      </div>
    </div>
    <div un-flex="~ row">
      <div
        un-text="neutral-500 dark:neutral-400 base"
        un-mr-2
        un-whitespace-nowrap
      >
        后文
      </div>
      <LinkUnderline
        v-if="nextPost"
        :href="nextPost.url"
        :text="nextPost.frontmatter.title"
        :tooltip="true"
        :tooltip-text="nextPost.frontmatter.title"
        un-text="neutral-700 dark:neutral-300 hover:neutral-950 dark:hover:neutral-50"
        un-before="bg-emerald-600 dark:bg-emerald-600/80"
      >
        <template #tooltipAddons>
          <div
            un-flex="~ row"
            un-text="sm neutral-600 dark:neutral-400"
            un-justify-end
            un-gap-5
          >
            {{ `约${nextPost.readingTime.toString()}分钟` }}
          </div>
        </template>
      </LinkUnderline>
      <div v-else>
        没了
      </div> -->
  </div>
</template>
