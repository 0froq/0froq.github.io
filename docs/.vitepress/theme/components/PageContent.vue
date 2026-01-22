<script setup lang="ts">
import { useData, useRoute } from 'vitepress'
import HomeCorpus from './HomeCorpus.vue'
import HomeCorpusLayer from './HomeCorpusLayer.vue'
import HomeGlobal from './HomeGlobal.vue'
import HomePosts from './HomePosts.vue'
import PageContentNotFound from './PageContentNotFound.vue'
import PageContentPost from './PageContentPost.vue'
import PageContentTag from './PageContentTag.vue'
import PageDashboard from './PageDashboard.vue'

const { page, frontmatter } = useData()
const route = useRoute()
</script>

<template>
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
  <PageDashboard
    v-else-if="frontmatter.dashboard"
  />
  <PageContentTag
    v-else-if="frontmatter.tag"
  />
  <PageContentPost
    v-else-if="!page.isNotFound"
  />
  <PageContentNotFound v-else />
</template>
