<script setup lang="ts">
import { useRoute } from 'vitepress'
import { useI18n } from 'vue-i18n'
import ProgressBarHeader from './ProgressBarHeader.vue'

const route = useRoute()
const { t } = useI18n({
  useScope: 'global',
  messages: {
    en: {
      greeting: 'Greetings!',
    },
    zh: {
      greeting: '您好！',
    },
  },
})
</script>

<template>
  <ProgressBarHeader
    :key="$i18n.locale"
    :title="t('greeting')"
    un-mb-8
  />
  <Content
    :key="route.path"
    un-text="base/10"
    class="markdown-rendered"
  />
</template>
