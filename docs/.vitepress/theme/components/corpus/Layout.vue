<script setup lang="ts">
import type { NavItem } from '../ui/nav/ContentNav.vue'
import { useRoute } from 'vitepress'
import { useI18n } from 'vue-i18n'
import { useRouteI18n } from '~/utils/useRouteI18n'
import ContentNav from '../ui/nav/ContentNav.vue'
import Article from './Article.vue'
import Home from './Home.vue'
import Layer from './Layer.vue'

const route = useRoute()
const { locale } = useI18n({
  useScope: 'global',
})
const { currentBasePath } = useRouteI18n(route.path, locale.value)

const navItems: NavItem[][] = [
  [{ label: 'Home', url: '/' }],
  [
    { label: 'Corpus', url: '/corpus/' },
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
  [
    { label: 'Autopsia', url: '/corpus/000-autopsia/' },
    { label: 'Ingesta', url: '/corpus/100-ingesta/' },
    { label: 'Neoplasma', url: '/corpus/200-neoplasma/' },
    { label: 'Putredo', url: '/corpus/300-putredo/' },
    { label: 'Delirium', url: '/corpus/400-delirium/' },
    { label: 'Vigil', url: '/corpus/500-vigil/' },
  ],
]
</script>

<template>
  <ContentNav
    :items="navItems"
  />
  <Home
    v-if="currentBasePath === '/corpus/'"
  />
  <Layer
    v-else-if="currentBasePath.match(/^\/corpus\/\d{3}-[a-z]+\/$/)"
  />
  <Article
    v-else
  />
</template>
