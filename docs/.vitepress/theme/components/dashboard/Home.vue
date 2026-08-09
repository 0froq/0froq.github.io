<script setup lang="ts">
import PageTitle from '@/ui/base/PageTitle.vue'
import Board from './Board.vue'
</script>

<template>
  <PageTitle
    un-font="mono"
    title="Dashboard"
  />
  <Board />
</template>

<style scoped>
[data-current='true'] {
  --uno: 'text-neutral-950 dark:text-neutral-50 font-semibold';
  --uno: 'before:(w-full bg-neutral-950 dark:bg-neutral-50)';
}
</style>
