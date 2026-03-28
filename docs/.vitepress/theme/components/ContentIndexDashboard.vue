<script setup lang="ts">
import { useRoute } from 'vitepress'
import { useI18n } from 'vue-i18n'
import { useRouteI18n } from '~/utils/useRouteI18n'
import ContentNav from './ContentNav.vue'
import DashboardBacklog from './DashboardBacklog.vue'
import DashboardDayTodo from './DashboardDayTodo.vue'
import DashboardWeek from './DashboardWeek.vue'
import LinkUnderline from './LinkUnderline.vue'
import ProgressBarHeader from './ProgressBarHeader.vue'

const { path } = useRoute()
const { t, locale } = useI18n({
  useScope: 'global',
  messages: {
    en: {
      exploreHistory: 'Explore the history',
      intents: 'I want to……',
      guidelines: 'Need to follow……',
    },
    zh: {
      exploreHistory: '看看往期',
      intents: '我想……',
      guidelines: '需要遵守……',
    },
  },
})

const { currentBasePath } = useRouteI18n(path, locale.value)

const navItems = [
  [{ label: 'Home', url: '/' }],
  [
    { label: 'Corpus', url: '/corpus/', children: [
      { label: 'Autopsia', url: '/corpus/000_autopsia/' },
      { label: 'Ingesta', url: '/corpus/100_ingesta/' },
      { label: 'Neoplasma', url: '/corpus/200_neoplasma/' },
      { label: 'Putredo', url: '/corpus/300_putredo/' },
      { label: 'Delirium', url: '/corpus/400_delirium/' },
      { label: 'Vigil', url: '/corpus/500_vigil/' },
    ] },
    { label: 'Posts', url: '/posts/' },
    { label: 'Dashboard', url: '/dashboard/', current: true },
    { label: 'Tags', url: '/tags/' },
  ],
]
</script>

<template>
  <ContentNav
    :items="navItems"
  />
  <ProgressBarHeader
    un-font="mono"
    title="Dashboard"
    description="A place to track my weekly progress and plan for the next week."
  />
  <DashboardDayTodo />
  <DashboardWeek />
  <DashboardBacklog />

  <div
    un-my-4
    un-flex="~ row wrap"
    un-gap-2
  >
    <LinkUnderline
      v-for="link in [
        {
          label: t('exploreHistory'),
          url: 'https://github.com/0froq/0froq.github.io/tree/main/docs/dashboard/weeks',
        },
        {
          label: t('intents'),
          url: `${currentBasePath}intents/${locale === 'zh' ? '' : `${locale}/`}`,
        },
        {
          label: t('guidelines'),
          url: `${currentBasePath}hints/${locale === 'zh' ? '' : `${locale}/`}`,
        },
      ]"
      :key="link.url"
      :href="link.url"
      :text="link.label"
      un-inline-block
      un-text-sm
      un-text="stone-600 dark:stone-400"
      un-before="h-px bg-stone-950 dark:bg-stone-50"
    />
  </div>
</template>

<style scoped>
[data-current='true'] {
  --uno: 'text-stone-950 dark:text-stone-50 font-semibold';
  --uno: 'before:(w-full bg-stone-950 dark:bg-stone-50)';
}
</style>
