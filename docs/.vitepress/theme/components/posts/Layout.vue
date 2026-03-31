<script setup lang="ts">
import { useRoute } from 'vitepress'
import { useI18n } from 'vue-i18n'
import { useRouteI18n } from '~/utils/useRouteI18n'
import Article from './Article.vue'
import Home from './Home.vue'

const route = useRoute()
const { locale } = useI18n({
  useScope: 'global',
})
const { currentBasePath } = useRouteI18n(route.path, locale.value)

// Check if it's an article page (not the index page)
const isArticle = !route.path.match(/^\/posts\/\??(en\/)?$/)
</script>

<template>
  <Article v-if="isArticle" />
  <Home v-else />
</template>
