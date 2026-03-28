<script setup lang="ts">
import { useData, useRoute } from 'vitepress'
import ContentArticle from './ContentArticle.vue'
import ContentContact from './ContentContact.vue'
import ContentCorpusLayer from './ContentCorpusLayer.vue'
import ContentIndexCorpus from './ContentIndexCorpus.vue'
import ContentIndexGlobal from './ContentIndexGlobal.vue'
import ContentIndexPosts from './ContentIndexPosts.vue'
import ContentIndexTags from './ContentIndexTags.vue'
import ContentNotFound from './ContentNotFound.vue'
import ContentTags from './ContentTags.vue'
import Dashboard from './dashboard/Layout.vue'

const { page } = useData()
const route = useRoute()

// v-else-if="route.path.match(/^\/corpus\/[0-5]00_[a-z]+\/$/)"
</script>

<template>
  <un-page-content
    un-min-h="[calc(100vh-15rem)]"
  >
    <!-- <ContentTopIndex v-if="page.frontmatter.index" /> -->
    <ContentIndexGlobal v-if="['/', '/en/'].includes(route.path)" />
    <ContentIndexCorpus
      v-else-if="['/corpus/', '/corpus/en/'].includes(route.path)"
    />
    <ContentIndexPosts
      v-else-if="['/posts/', '/posts/en/'].includes(route.path)"
    />
    <!-- <ContentIndexDashboard -->
    <!--   v-else-if="['/dashboard/', '/dashboard/en/'].includes(route.path)" -->
    <!-- /> -->
    <Dashboard
      v-else-if="route.path.startsWith('/dashboard/')"
    />
    <ContentIndexTags
      v-else-if="['/tags/', '/tags/en/'].includes(route.path)"
    />
    <ContentCorpusLayer
      v-else-if="route.path.startsWith('/corpus/') && page.frontmatter.locale"
    />
    <!-- <ContentDashboardIntents -->
    <!--   v-else-if="['/dashboard/intents/', '/dashboard/intents/en/'].includes(route.path)" -->
    <!-- /> -->
    <!-- <ContentDashboardHints -->
    <!--   v-else-if="['/dashboard/hints/', '/dashboard/hints/en/'].includes(route.path)" -->
    <!-- /> -->
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
