<script setup lang="ts">
const props = defineProps<{
  src?: string
  alt?: string
  title?: string
  width?: string | number
  height?: string | number
}>()

const route = useRoute()

const resolved = computed(() => {
  const src = props.src || ''
  if (!src || /^(https?:)?\/\//i.test(src) || src.startsWith('data:') || src.startsWith('/'))
    return src
  const dir = route.path.replace(/\/$/, '').replace(/\/[^/]+$/, '')
  return `/_files${dir}/${src}`
})

const caption = computed(() => props.title || '')
</script>

<template>
  <figure class="prose-figure">
    <img
      :src="resolved"
      :alt="alt || caption"
      :title="title"
      :width="width"
      :height="height"
      loading="lazy"
      decoding="async"
    >
    <figcaption
      v-if="caption"
      class="prose-caption"
    >
      {{ caption }}
    </figcaption>
  </figure>
</template>
