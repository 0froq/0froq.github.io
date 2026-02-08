<script setup lang="ts">
import { useRoute } from 'vitepress'
import HomeCorpus from './HomeCorpus.vue'
import HomeDashboard from './HomeDashboard.vue'
import HomeGlobal from './HomeGlobal.vue'
import HomePosts from './HomePosts.vue'
import HomeTags from './HomeTags.vue'

const route = useRoute()
</script>

<template>
  <HomeGlobal v-if="['/', '/en/'].includes(route.path)" />
  <HomeCorpus
    v-else-if="['/corpus/', '/corpus/en/'].includes(route.path)"
  />
  <HomePosts
    v-else-if="['/posts/', '/posts/en/'].includes(route.path)"
  />
  <HomeDashboard
    v-else-if="['/dashboard/', '/dashboard/en/'].includes(route.path)"
  />
  <HomeTags
    v-else-if="['/tags/', '/tags/en/'].includes(route.path)"
  />
</template>
