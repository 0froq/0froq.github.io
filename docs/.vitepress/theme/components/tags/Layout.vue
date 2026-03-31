<script setup lang="ts">
import { useRoute } from 'vitepress'
import { useI18n } from 'vue-i18n'
import { useRouteI18n } from '~/utils/useRouteI18n'
import Detail from './Detail.vue'
import Home from './Home.vue'

const route = useRoute()
const { locale } = useI18n({
  useScope: 'global',
})
const { currentBasePath } = useRouteI18n(route.path, locale.value)
</script>

<template>
  <Home
    v-if="currentBasePath === '/tags/'"
  />
  <Detail
    v-else-if="currentBasePath.startsWith('/tags/')"
  />
</template>
