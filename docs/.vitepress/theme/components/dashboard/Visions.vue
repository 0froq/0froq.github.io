<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import LinkUnderline from '@/LinkUnderline.vue'
import ProgressBarHeader from '@/ProgressBarHeader.vue'
import VisionsGlobal from './VisionsGlobal.vue'
import VisionsYear from './VisionsYear.vue'

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
    un-text="stone-600 dark:stone-400"
    un-before="h-px bg-stone-950 dark:bg-stone-50"
  />
  <ProgressBarHeader
    id="yearly-and-vision-header"
    :title="t('headerText')"
  />
  <VisionsYear />
  <VisionsGlobal />
</template>
