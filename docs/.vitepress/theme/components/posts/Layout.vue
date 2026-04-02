<script setup lang="ts">
import type { NavItem } from '@/ui/nav/ContentNav.vue'
import ContentNav from '@/ui/nav/ContentNav.vue'
import { useRouteI18n } from '~/utils/useRouteI18n'
import Article from './Article.vue'
import Home from './Home.vue'
import Layer from './Layer.vue'

const navItems: NavItem[][] = [
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
    { label: 'Dashboard', url: '/dashboard/', children: [
      { label: 'Visions', url: '/dashboard/visions/' },
      { label: 'Hints', url: '/dashboard/hints/' },
    ] },
    { label: 'Tags', url: '/tags/' },
  ],
  [
    { label: 'Log', url: '/posts/610_log/' },
    { label: 'Roadmap', url: '/posts/620_roadmap/' },
    { label: 'Collection', url: '/posts/630_collection/' },
  ],
]

const { currentBasePath } = useRouteI18n()
</script>

<template>
  <ContentNav
    :items="navItems"
  />
  <Home
    v-if="currentBasePath === '/posts/'"
  />
  <Layer
    v-else-if="currentBasePath.match(/^\/posts\/\d{3}_[a-z]+\/$/)"
  />
  <Article
    v-else
  />
</template>
