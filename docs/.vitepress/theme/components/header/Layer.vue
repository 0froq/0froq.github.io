<script setup lang="ts">
import { useRoute } from 'vitepress'
import { ref } from 'vue'

defineProps<{
  pathSuffix?: string
}>()

const route = useRoute()
const layers = [
  'corpus',
  'posts',
  'dashboard',
  'tags',
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
  tags: {
    name: 'Tags',
    baseUrl: '/tags/',
  },
}

const hoveringLayer = ref<string | null>(null)
</script>

<template>
  <div
    un-m-1
    un-hidden
    un-sm="flex"
    un-items-start
    un-justify-start
    un-transition-colors
    un-duration-200
  >
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
  --uno: 'transition duration-200';
  --uno: 'hover:opacity-80 hover:translate-y--0.5 hover:scale-105';
}

[data-layer='corpus'] {
  --uno: 'text-rose-600 dark:text-rose-400';
  & > .icon {
    --uno: 'i-solar-dna-bold-duotone';
  }
  &.label {
    --uno: 'font-stylish';
    --uno: 'bg-rose-600/10 dark:bg-rose-400/10';
  }
}
[data-layer='posts'] {
  --uno: 'text-emerald-600 dark:text-emerald-400';
  & > .icon {
    --uno: 'i-solar-documents-bold-duotone';
  }
  &.label {
    --uno: 'font-script';
    --uno: 'bg-emerald-600/10 dark:bg-emerald-400/10';
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
  }
}

[data-layer='tags'] {
  --uno: 'text-sky-600 dark:text-sky-400';
  & > .icon {
    --uno: 'i-solar-hashtag-chat-bold-duotone';
  }
  &.label {
    --uno: 'font-mono';
    --uno: 'bg-sky-600/10 dark:bg-sky-400/10';
  }
}

[data-current='true'] {
  --uno: 'opacity-100 hover:opacity-100';
}
</style>
