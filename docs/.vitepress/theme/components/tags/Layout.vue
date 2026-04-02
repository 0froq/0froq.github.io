<script setup lang="ts">
import { useRoute } from 'vitepress'
import { useI18n } from 'vue-i18n'
import { useRouteI18n } from '~/utils/useRouteI18n'
import ContentNav from '../ui/nav/ContentNav.vue'
import Detail from './Detail.vue'
import Home from './Home.vue'

const route = useRoute()
const { locale } = useI18n({
  useScope: 'global',
})
const { currentBasePath } = useRouteI18n(route.path, locale.value)

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
    { label: 'Posts', url: '/posts/', children: [
      { label: 'Log', url: '/posts/610_log/' },
      { label: 'Roadmap', url: '/posts/620_roadmap/' },
      { label: 'Collection', url: '/posts/630_collection/' },
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
  <Home
    v-if="currentBasePath === '/tags/'"
  />
  <Detail
    v-else-if="currentBasePath.startsWith('/tags/')"
  />
</template>
