<script setup lang="ts">
import { useData, useRoute } from 'vitepress'
import HomeCorpus from './HomeCorpus.vue'
import HomeCorpusLayer from './HomeCorpusLayer.vue'
import HomeDashboard from './HomeDashboard.vue'
import HomeGlobal from './HomeGlobal.vue'
import HomePosts from './HomePosts.vue'
import PageContentNav from './PageContentNav.vue'
import PageContentNotFound from './PageContentNotFound.vue'
import PageContentPost from './PageContentPost.vue'
import PageContentTag from './PageContentTag.vue'
import PageDashboardGuidance from './PageDashboardGuidance.vue'
import PageDashboardIntents from './PageDashboardIntents.vue'

const { page, frontmatter } = useData()
const route = useRoute()
</script>

<template>
  <un-page-content>
    <PageContentNav />
  </un-page-content>
  <HomeGlobal v-if="['/', '/en/'].includes(route.path)" />
  <HomeCorpus
    v-else-if="['/corpus/', '/corpus/en/'].includes(route.path)"
  />
  <HomeCorpusLayer
    v-else-if="route.path.match(/^\/corpus\/[0-5]00_[a-z]+\/$/)"
  />
  <HomePosts
    v-else-if="['/posts/', '/posts/en/'].includes(route.path)"
  />
  <HomeDashboard
    v-else-if="['/dashboard/', '/dashboard/en/'].includes(route.path)"
  />
  <PageDashboardIntents
    v-else-if="['/dashboard/intents/', '/dashboard/intents/en/'].includes(route.path)"
  />
  <PageDashboardGuidance
    v-else-if="['/dashboard/guidance/', '/dashboard/guidance/en/'].includes(route.path)"
  />
  <PageContentTag
    v-else-if="frontmatter.tag"
  />
  <PageContentPost
    v-else-if="!page.isNotFound"
  />
  <PageContentNotFound v-else />
</template>
