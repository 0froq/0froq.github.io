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
  --uno: 'text-stone-950 dark:text-stone-50 font-semibold';
  --uno: 'before:(w-full bg-stone-950 dark:bg-stone-50)';
}
</style>
