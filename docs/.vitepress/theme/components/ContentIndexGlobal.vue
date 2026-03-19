<script setup lang="ts">
import { useRoute } from 'vitepress'
import { useI18n } from 'vue-i18n'
import ContentNav from './ContentNav.vue'
import ProgressBarHeader from './ProgressBarHeader.vue'

const route = useRoute()
useI18n({
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

const navItems = [
  [{ label: 'Home', url: '/', current: true }],
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
    { label: 'Dashboard', url: '/dashboard/' },
    { label: 'Tags', url: '/tags/' },
  ],
]
</script>

<template>
  <ContentNav
    :items="navItems"
  />
  <ProgressBarHeader
    :key="$i18n.locale"
    :title="$t('greeting')"
    un-mb-8
  />
  <Content
    :key="route.path"
    un-text="base/10"
    class="markdown-rendered"
  />
</template>
