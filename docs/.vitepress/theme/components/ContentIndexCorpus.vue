<script lang="ts" setup>
import ProgressBarHeader from './ProgressBarHeader.vue'
</script>

<template>
  <ProgressBarHeader
    title="Corpus"
    un-mb-8
    un-font='stylish'
  />
  <Content
    class="markdown-rendered"
    un-text="base/10"
  />
</template>

<style scoped>
[data-current='true'] {
  --uno: 'text-neutral-950 dark:text-neutral-50 font-semibold';
  --uno: 'before:(w-full bg-neutral-950 dark:bg-neutral-50)';
}
</style>
