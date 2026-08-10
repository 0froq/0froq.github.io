<script setup lang="ts">
/**
 * Global session client: heartbeats + visit counting on every route.
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
