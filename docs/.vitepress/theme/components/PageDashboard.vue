<script setup lang="ts">
import { useRoute } from 'vitepress'
import DashboardHint from './DashboardHint.vue'
import DashboardVision from './DashboardVision.vue'
import DashboardWeekQuadrant from './DashboardWeekQuadrant.vue'
import DashboardYear from './DashboardYear.vue'
import LinkUnderline from './LinkUnderline.vue'
import ProgressBarHeader from './ProgressBarHeader.vue'

const route = useRoute()
</script>

<template>
  <un-page-content
    v-if="['/dashboard/', '/dashboard/en/'].includes(route.path)"
    un-max-w-5xl
    un-mx-auto
  >
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
    <DashboardWeekQuadrant />

    <div
      un-flex="~ row"
      un-gap-4
    >
      <LinkUnderline
        href="https://github.com/0froq/0froq.github.io/tree/main/docs/dashboard/weeks"
        text="探索往期"
        un-block
        un-mt-4
        un-text-sm
        un-text="neutral-600 dark:neutral-400"
        un-before="h-px bg-teal-400 dark:bg-teal-600"
      />
      <LinkUnderline
        href="intents/"
        text="我想……"
        un-block
        un-mt-4
        un-text-sm
        un-text="neutral-600 dark:neutral-400"
        un-before="h-px bg-teal-400 dark:bg-teal-600"
      />
    </div>

    <!-- <section> -->
    <!--   <ProgressBarHeader -->
    <!--     id="yearly-and-vision-header" -->
    <!--     title="欲" -->
    <!--     un-mt-8 -->
    <!--   /> -->
    <!--   <DashboardYear /> -->
    <!--   <DashboardVision /> -->
    <!-- </section> -->
    <!-- <section> -->
    <!--   <ProgressBarHeader -->
    <!--     id="dashboard-hint-section-header" -->
    <!--     title="示" -->
    <!--     un-mt-8 -->
    <!--   /> -->
    <!--   <DashboardHint /> -->
    <!-- </section> -->
  </un-page-content>
  <un-page-content
    v-else-if="['/dashboard/intents/', '/dashboard/intents/en/'].includes(route.path)"
  >
    <section>
      <ProgressBarHeader
        id="yearly-and-vision-header"
        title="我想……"
      />
      <DashboardYear />
      <DashboardVision />
    </section>
  </un-page-content>
</template>

<style scoped>
[data-current='true'] {
  --uno: 'text-neutral-950 dark:text-neutral-50 font-semibold';
  --uno: 'before:(w-full bg-neutral-950 dark:bg-neutral-50)';
}
</style>
