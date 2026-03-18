<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import DashboardVision from './DashboardVision.vue'
import DashboardYear from './DashboardYear.vue'
import ProgressBarHeader from './ProgressBarHeader.vue'
import LinkUnderline from './LinkUnderline.vue'

const { t, locale } = useI18n({
  useScope: 'global',
  messages: {
    en: {
      headerText: 'I want to……',
    },
    zh: {
      headerText: '我想……',
    },
  },
})
</script>

<template>
  <LinkUnderline
    :href="`/dashboard/${locale === 'zh' ? '' : `${locale}/`}`"
    text="Dashboard"
    un-inline-block
    un-text-sm
    un-w-fit
    un-text="neutral-600 dark:neutral-400"
    un-before="h-px bg-neutral-950 dark:bg-neutral-50"
  />
  <ProgressBarHeader
    id="yearly-and-vision-header"
    :title="t('headerText')"
  />
  <DashboardYear />
  <DashboardVision />
</template>
