<script setup lang="ts">
import { useRoute } from 'vitepress'
import { computed, ref } from 'vue'

defineProps<{
  pathSuffix?: string
}>()

const route = useRoute()
const layers = [
  'corpus',
  'posts',
  'dashboard',
]

const layerMap: Record<string, {
  name: string
  baseUrl?: string
}> = {
  corpus: {
    name: 'Corpus',
    baseUrl: '/corpus/',
  },
  posts: {
    name: 'Posts',
    baseUrl: '/posts/',
  },
  dashboard: {
    name: 'Dashboard',
    baseUrl: '/dashboard/',
  },
}

const hoveringLayer = ref<string | null>(null)

const currentLayer = computed(() => route.path.split('/')[1])

const layerIndicator = computed(() => {
  if (hoveringLayer.value) {
    return hoveringLayer.value
  }
  return currentLayer.value
})
</script>

<template>
  <div
    un-m-1
    un-h-6
    un-flex="~ row"
    un-items-start
    un-justify-start
    un-transition-colors
    un-duration-200
  >
    <div
      :data-hovering="hoveringLayer ? 'true' : ''"
      :data-layer="layerIndicator"
      :data-current="hoveringLayer === currentLayer ? 'true' : ''"
      class="label"
      un-rounded-md
      un-text-neutral-500
      un-transition-colors
      un-duration-200
      un-hover:transition-colors
      un-mr-2
      un-px-2
    >
      {{ layerMap[layerIndicator]?.name || '' }}
    </div>
    <div
      un-flex="~ row"
    >
      <template
        v-for="layer in layers"
        :key="layer"
      >
        <a
          :href="`${layerMap[layer].baseUrl}${pathSuffix}`"
          un-font-medium
          un-px-2
          un-py-1
          un-items-center
          un-transition-colors
          un-duration-200
          un-flex="~ row"
          :data-layer="layer"
          :data-current="layer === route.path.split('/')[1] ? 'true' : 'false'"
          @mouseover="hoveringLayer = layer"
          @mouseleave="hoveringLayer = null"
        >
          <div
            class="icon"
          />
        </a>
      </template>
    </div>
  </div>
</template>

<style scoped>
[data-layer] {
  --uno: 'opacity-50';
  --uno: 'transition-opacity duration-200';
}

[data-layer='corpus'] {
  --uno: 'text-rose-600 dark:text-rose-400';
  & > .icon {
    --uno: 'i-solar-dna-bold-duotone';
  }
  &.label {
    --uno: 'font-stylish';
    --uno: 'bg-rose-600/10 dark:bg-rose-400/10';
    /* --uno: 'border border-rose-600/20 dark:border-rose-400/20'; */
  }
}
[data-layer='posts'] {
  --uno: 'text-amber-600 dark:text-amber-400';
  & > .icon {
    --uno: 'i-solar-chat-line-bold-duotone';
  }
  &.label {
    --uno: 'font-script';
    --uno: 'bg-amber-600/10 dark:bg-amber-400/10';
    /* --uno: 'border border-amber-600/20 dark:border-amber-400/20'; */
  }
}
[data-layer='dashboard'] {
  --uno: 'text-purple-600 dark:text-purple-400';
  & > .icon {
    --uno: 'i-duo-dashboard';
  }
  &.label {
    --uno: 'font-mono';
    --uno: 'bg-purple-600/10 dark:bg-purple-400/10';
    /* --uno: 'border border-purple-600/20 dark:border-purple-400/20'; */
  }
}

[data-current='true'] {
  --uno: 'opacity-100 hover:opacity-100';
}
</style>
