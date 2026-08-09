<script setup lang="ts">
import { useRoute } from 'vitepress'
import { useI18n } from 'vue-i18n'
import PageTitle from '@/ui/base/PageTitle.vue'
import ContentNav from '@/ui/nav/ContentNav.vue'
import PaperEdgeSamples from '@/ui/paper/PaperEdgeSamples.vue'

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
      { label: 'Autopsia', url: '/corpus/000-autopsia/' },
      { label: 'Ingesta', url: '/corpus/100-ingesta/' },
      { label: 'Neoplasma', url: '/corpus/200-neoplasma/' },
      { label: 'Putredo', url: '/corpus/300-putredo/' },
      { label: 'Delirium', url: '/corpus/400-delirium/' },
      { label: 'Vigil', url: '/corpus/500-vigil/' },
    ] },
    { label: 'Posts', url: '/posts/', children: [
      { label: 'Log', url: '/posts/610-log/' },
      { label: 'Roadmap', url: '/posts/620-roadmap/' },
      { label: 'Collection', url: '/posts/630-collection/' },
    ] },
    { label: 'Dashboard', url: '/dashboard/', children: [
      { label: 'Visions', url: '/dashboard/visions/' },
      { label: 'Hints', url: '/dashboard/hints/' },
    ] },
    { label: 'Tags', url: '/tags/' },
  ],
]
</script>

<template>
  <ContentNav
    :items="navItems"
  />
  <PageTitle
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
