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
      { label: 'Autopsia', url: '/corpus/000-autopsia/' },
      { label: 'Ingesta', url: '/corpus/100-ingesta/' },
      { label: 'Neoplasma', url: '/corpus/200-neoplasma/' },
      { label: 'Putredo', url: '/corpus/300-putredo/' },
      { label: 'Delirium', url: '/corpus/400-delirium/' },
      { label: 'Vigil', url: '/corpus/500-vigil/' },
    ] },
    { label: 'Posts', url: '/posts/' },
    { label: 'Dashboard', url: '/dashboard/', children: [
      { label: 'Visions', url: '/dashboard/visions/' },
      { label: 'Hints', url: '/dashboard/hints/' },
    ] },
    { label: 'Tags', url: '/tags/' },
  ],
  [
    { label: 'Log', url: '/posts/610-log/' },
    { label: 'Roadmap', url: '/posts/620-roadmap/' },
    { label: 'Collection', url: '/posts/630-collection/' },
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
    v-else-if="currentBasePath.match(/^\/posts\/\d{3}-[a-z]+\/$/)"
  />
  <Article
    v-else
  />
</template>
