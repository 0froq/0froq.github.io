<script setup lang="ts">
import { useData, useRoute } from 'vitepress'
import { BaseTransition, computed } from 'vue'
import HomeLayerExitus from './HomeLayerExitus.vue'
import HomeLayerDefault from './HomeLayerDefault.vue'

// const { page, frontmatter } = useData()
const route = useRoute()

const layer = computed(() => {
  return route.path.split('/')[1] || 'home'
})

console.warn(layer.value)
</script>

<template>
  <HomeLayerExitus v-if="layer === '600_exitus'" />
  <!-- Add more conditions for different layers as needed -->
  <HomeLayerDefault v-else />
</template>
