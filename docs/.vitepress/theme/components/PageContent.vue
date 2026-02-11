<script setup lang="ts">
import { useData, useRoute } from 'vitepress'
import ContentArticle from './ContentArticle.vue'
import ContentContact from './ContentContact.vue'
import ContentCorpusLayer from './ContentCorpusLayer.vue'
import ContentDashboardGuidance from './ContentDashboardGuidance.vue'
import ContentDashboardIntents from './ContentDashboardIntents.vue'
import ContentHome from './ContentHome.vue'
import ContentNav from './ContentNav.vue'
import ContentNotFound from './ContentNotFound.vue'
import ContentTags from './ContentTags.vue'

const { page, frontmatter } = useData()
const route = useRoute()

const homePaths = [
  '/',
  '/en/',
  '/corpus/',
  '/corpus/en/',
  '/posts/',
  '/posts/en/',
  '/dashboard/',
  '/dashboard/en/',
  '/tags/',
  '/tags/en/',
]
</script>

<template>
  <un-page-content
    un-min-h="[calc(100vh-15rem)]"
  >
    <ContentNav />
    <ContentHome v-if="homePaths.includes(route.path)" />
    <ContentCorpusLayer
      v-else-if="route.path.match(/^\/corpus\/[0-5]00_[a-z]+\/$/)"
    />
    <ContentDashboardIntents
      v-else-if="['/dashboard/intents/', '/dashboard/intents/en/'].includes(route.path)"
    />
    <ContentDashboardGuidance
      v-else-if="['/dashboard/guidance/', '/dashboard/guidance/en/'].includes(route.path)"
    />
    <ContentTags
      v-else-if="route.path.startsWith('/tags/')"
    />
    <ContentArticle
      v-else-if="!page.isNotFound"
    />
    <ContentContact
      v-else-if="route.path === '/contact/'"
    />
    <ContentNotFound v-else />
  </un-page-content>
</template>
