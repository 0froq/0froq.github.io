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
  --uno: 'text-stone-950 dark:text-stone-50 font-semibold';
  --uno: 'before:(w-full bg-stone-950 dark:bg-stone-50)';
}
</style>
