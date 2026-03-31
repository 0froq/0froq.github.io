<script setup lang="ts">
import { useData, useRoute } from 'vitepress'
import ContentArticle from './ContentArticle.vue'
import ContentIndexGlobal from './ContentIndexGlobal.vue'
import ContentNotFound from './ContentNotFound.vue'
import Corpus from './corpus/Layout.vue'
import Dashboard from './dashboard/Layout.vue'
import Posts from './posts/Layout.vue'
import Tags from './tags/Layout.vue'

const { page } = useData()
const route = useRoute()
</script>

<template>
  <un-page-content
    un-min-h="[calc(100vh-15rem)]"
  >
    <ContentIndexGlobal v-if="['/', '/en/'].includes(route.path)" />

    <Corpus
      v-else-if="route.path.startsWith('/corpus/')"
    />

    <Posts
      v-else-if="route.path.startsWith('/posts/')"
    />

    <Dashboard
      v-else-if="route.path.startsWith('/dashboard/')"
    />

    <Tags
      v-else-if="route.path.startsWith('/tags/')"
    />

    <ContentArticle
      v-else-if="!page.isNotFound"
    />

    <ContentNotFound v-else />
  </un-page-content>
</template>
