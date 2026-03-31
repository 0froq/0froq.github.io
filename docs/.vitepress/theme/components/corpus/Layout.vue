<script setup lang="ts">
import { useRoute } from 'vitepress'
import { useI18n } from 'vue-i18n'
import { useRouteI18n } from '~/utils/useRouteI18n'
import Article from './Article.vue'
import Home from './Home.vue'
import Layer from './Layer.vue'

const route = useRoute()
const { locale } = useI18n({
  useScope: 'global',
})
const { currentBasePath } = useRouteI18n(route.path, locale.value)

// Check if it's an article page (has file name with extension pattern)
// const isArticle = route.path.match(/\/[\w-]+\.html$/)
</script>

<template>
  <Home
    v-if="currentBasePath === '/corpus/'"
  />
  <Layer
    v-else-if="currentBasePath.match(/^\/corpus\/\d{3}_[a-z]+\/$/)"
  />
  <Article
    v-else
  />
</template>
