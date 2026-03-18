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
    { label: 'Corpus', url: '/corpus/' },
    { label: 'Posts', url: '/posts/' },
    { label: 'Dashboard', url: '/dashboard/', tooltip: 'Description' },
    { label: 'Tags', url: '/tags/', tooltip: 'Description', children: [
      { label: 'Sub 1', url: '/cat/1' },
      { label: 'Sub 2', url: '/cat/2', current: true },
    ] },
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
