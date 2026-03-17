<script setup lang="ts">
import { useRoute } from 'vitepress'
import IndexCorpus from './IndexCorpus.vue'
import IndexDashboard from './IndexDashboard.vue'
import IndexGlobal from './IndexGlobal.vue'
import IndexPosts from './IndexPosts.vue'
import IndexTags from './IndexTags.vue'

const route = useRoute()
</script>

<template>
  <IndexGlobal v-if="['/', '/en/'].includes(route.path)" />
  <IndexCorpus
    v-else-if="['/corpus/', '/corpus/en/'].includes(route.path)"
  />
  <IndexPosts
    v-else-if="['/posts/', '/posts/en/'].includes(route.path)"
  />
  <IndexDashboard
    v-else-if="['/dashboard/', '/dashboard/en/'].includes(route.path)"
  />
  <IndexTags
    v-else-if="['/tags/', '/tags/en/'].includes(route.path)"
  />
</template>
