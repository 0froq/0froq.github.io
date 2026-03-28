<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import LinkUnderline from '@/LinkUnderline.vue'
import ProgressBarHeader from '@/ProgressBarHeader.vue'
import HintsFence from './HintsFence.vue'

const { t, locale } = useI18n({
  useScope: 'global',
  messages: {
    en: {
      headerText: 'Need to follow……',
    },
    zh: {
      headerText: '需要遵守……',
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
    un-text="stone-600 dark:stone-400"
    un-before="h-px bg-stone-950 dark:bg-stone-50"
  />
  <ProgressBarHeader
    id="hints-header"
    :title="t('headerText')"
  />
  <HintsFence />
</template>

