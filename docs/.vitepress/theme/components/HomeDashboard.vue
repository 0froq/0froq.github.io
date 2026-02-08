<script setup lang="ts">
import DashboardBacklog from './DashboardBacklog.vue'
import DashboardWeekQuadrant from './DashboardWeekQuadrant.vue'
import LinkUnderline from './LinkUnderline.vue'
</script>

<template>
  <DashboardWeekQuadrant />
  <DashboardBacklog />

  <div
    un-flex="~ row wrap"
    un-gap-2
  >
    <LinkUnderline
      v-for="link in [
        {
          label: '看看往期',
          url: 'https://github.com/0froq/0froq.github.io/tree/main/docs/dashboard/weeks',
        },
        {
          label: '我想……',
          url: 'intents/',
        },
        {
          label: '需要遵守……',
          url: 'guidance/',
        },
      ]"
      :key="link.url"
      :href="link.url"
      :text="link.label"
      un-inline-block
      un-text-sm
      un-text="neutral-600 dark:neutral-400"
      un-before="h-px bg-neutral-950 dark:bg-neutral-50"
    />
  </div>
</template>

<style scoped>
[data-current='true'] {
  --uno: 'text-neutral-950 dark:text-neutral-50 font-semibold';
  --uno: 'before:(w-full bg-neutral-950 dark:bg-neutral-50)';
}
</style>
