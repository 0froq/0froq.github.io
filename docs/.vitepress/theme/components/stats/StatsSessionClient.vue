<script setup lang="ts">
/**
 * Global session client: heartbeats on every route.
 * Visits count when article reading progress crosses VISIT_THRESHOLD.
 * Reading progress UI lives on article pages (PagePresenceHint).
 */
import { useRoute } from 'vitepress'
import { computed } from 'vue'
import { usePagePresenceSession } from '~/composables/stats/usePagePresence'

const route = useRoute()
const pagePath = computed(() => route.path)
usePagePresenceSession(pagePath)
</script>

<template>
  <span
    class="sr-only"
    aria-hidden="true"
  />
</template>
