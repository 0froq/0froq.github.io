<script lang="ts" setup>
import PageTitle from '@/ui/base/PageTitle.vue'
</script>

<template>
  <PageTitle
    title="Corpus"
    un-mb-8
    un-font="stylish"
  />
  <Content
    class="markdown-rendered"
    un-text="base/10"
  />
</template>

<style scoped>
[data-current='true'] {
  --uno: 'text-neutral-900 dark:text-neutral-100 font-semibold';
  --uno: 'before:(w-full bg-neutral-900 dark:bg-neutral-100)';
}
</style>
