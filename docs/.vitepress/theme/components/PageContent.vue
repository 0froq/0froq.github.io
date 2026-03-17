<script setup lang="ts">
import { useData, useRoute } from 'vitepress'
import ContentArticle from './ContentArticle.vue'
import ContentContact from './ContentContact.vue'
import ContentCorpusLayer from './ContentCorpusLayer.vue'
import ContentDashboardHints from './ContentDashboardHints.vue'
import ContentDashboardIntents from './ContentDashboardIntents.vue'
import ContentIndex from './ContentIndex.vue'
import ContentNav from './ContentNav.vue'
import ContentNotFound from './ContentNotFound.vue'
import ContentTags from './ContentTags.vue'

const { page } = useData()
const route = useRoute()

      // v-else-if="route.path.match(/^\/corpus\/[0-5]00_[a-z]+\/$/)"
</script>

<template>
  <un-page-content
    un-min-h="[calc(100vh-15rem)]"
  >
    <ContentNav />
    <ContentIndex v-if="page.frontmatter.index" />
    <ContentCorpusLayer
      v-else-if="route.path.startsWith('/corpus/') && page.frontmatter.locale"
    />
    <ContentDashboardIntents
      v-else-if="['/dashboard/intents/', '/dashboard/intents/en/'].includes(route.path)"
    />
    <ContentDashboardHints
      v-else-if="['/dashboard/hints/', '/dashboard/hints/en/'].includes(route.path)"
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
