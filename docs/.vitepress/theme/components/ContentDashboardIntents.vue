<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import DashboardVision from './DashboardVision.vue'
import DashboardYear from './DashboardYear.vue'
import ProgressBarHeader from './ProgressBarHeader.vue'

const { t } = useI18n({
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
  <section>
    <ProgressBarHeader
      id="yearly-and-vision-header"
      :title="t('headerText')"
    />
    <DashboardYear />
    <DashboardVision />
  </section>
</template>
