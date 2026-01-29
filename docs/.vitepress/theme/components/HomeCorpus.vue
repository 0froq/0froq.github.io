<script lang="ts" setup>
import { useRoute } from 'vitepress'
import LinkUnderline from './LinkUnderline.vue'

const route = useRoute()
</script>

<template>
  <un-page-content>
    <LinkUnderline
      href="/"
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
          { label: 'Corpus', url: 'corpus/' },
          { label: 'Posts', url: 'posts/' },
          { label: 'Dashboard', url: 'dashboard/' },
        ]"
        :key="url"
        :href="`/${url}`"
        :text="label"
        un-inline-block
        un-text-sm
        un-text="neutral-600 dark:neutral-400"
        un-before="h-px bg-neutral-950 dark:bg-neutral-50"
        :data-current="route.path.endsWith(url) ? 'true' : ''"
      />
    </div>
    <Content
      class="markdown-rendered"
      un-text="base/10"
    />
  </un-page-content>
</template>

<style scoped>
[data-current='true'] {
  --uno: 'text-neutral-950 dark:text-neutral-50 font-semibold';
  --uno: 'before:(w-full bg-neutral-950 dark:bg-neutral-50)';
}
</style>
