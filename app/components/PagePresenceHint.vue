<script setup lang="ts">
import { formatCompact } from '~/utils/formatStats'

const props = defineProps<{
  pagePath: string
}>()

const route = useRoute()
const stats = useSiteStats()

function normalize(path: string) {
  if (!path || path === '/')
    return '/'
  return path.replace(/\/$/, '') || '/'
}

const viewing = computed(() => {
  const target = normalize(props.pagePath)
  if (normalize(route.path) === target && stats.viewing.value != null)
    return Math.max(0, stats.viewing.value - 1)
  const row = stats.pages.value.find(item => normalize(item.pagePath) === target)
  return Math.max(0, (row?.viewing ?? 0) - (normalize(route.path) === target ? 1 : 0))
})

const reads = computed(() => {
  const target = normalize(props.pagePath)
  return stats.pageVisits.value.find(item => normalize(item.pagePath) === target)?.visits ?? null
})

const label = computed(() => {
  const bits: string[] = []
  if (viewing.value > 0)
    bits.push(viewing.value === 1 ? '1 other reading' : `${formatCompact(viewing.value)} others reading`)
  if (reads.value != null)
    bits.push(reads.value === 1 ? '1 read' : `${formatCompact(reads.value)} reads`)
  return bits
})
</script>

<template>
  <p
    v-if="label.length"
    un-m-0
    un-flex
    un-flex-wrap
    un-gap-x-2
    un-font-mono
    un-text="xs muted"
  >
    <template
      v-for="(part, i) in label"
      :key="part"
    >
      <span
        v-if="i > 0"
        un-opacity-40
        aria-hidden="true"
      >·</span>
      <span>{{ part }}</span>
    </template>
  </p>
</template>
