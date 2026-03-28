<script setup lang="ts">
import { useRoute } from 'vitepress'
import { useI18n } from 'vue-i18n'
import { useRouteI18n } from '~/utils/useRouteI18n'
import Hints from './Hints.vue'
import Home from './Home.vue'
import Visions from './Visions.vue'

const route = useRoute()
const { locale } = useI18n({
  useScope: 'global',
})
const { currentBasePath } = useRouteI18n(route.path, locale.value)
</script>

<template>
  <Home
    v-if="currentBasePath === '/dashboard/'"
  />
  <Visions
    v-else-if="currentBasePath.endsWith('/visions/')"
  />
  <Hints
    v-else-if="currentBasePath.endsWith('/hints/')"
  />
</template>
