<script setup lang="ts">
import { inkCoilPath, inkDotCluster } from '~/utils/inkDraw'

const props = withDefaults(defineProps<{
  seed: string
  hollow?: boolean
  count?: number
}>(), {
  hollow: false,
  count: 3,
})

const COIL_MS = 380
const single = computed(() => props.count === 1)
const fill = shallowRef(props.hollow ? 0 : 1)
let coilRaf = 0

function prefersReducedMotion() {
  return import.meta.client
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function easeOut(u: number) {
  return 1 - (1 - u) ** 3
}

watch(() => props.hollow, (hollow) => {
  const next = hollow ? 0 : 1
  if (!import.meta.client || prefersReducedMotion()) {
    fill.value = next
    return
  }
  const from = fill.value
  const started = performance.now()
  cancelAnimationFrame(coilRaf)
  const tick = (now: number) => {
    const u = Math.min(1, (now - started) / COIL_MS)
    fill.value = from + (next - from) * easeOut(u)
    if (u < 1)
      coilRaf = requestAnimationFrame(tick)
  }
  coilRaf = requestAnimationFrame(tick)
})

onUnmounted(() => {
  cancelAnimationFrame(coilRaf)
})

const coil = computed(() => inkCoilPath(props.seed, fill.value))
const cluster = computed(() => inkDotCluster(props.seed, props.count))
const strokeW = computed(() => 0.95 + fill.value * 0.4)
</script>

<template>
  <svg
    :viewBox="single ? '0 0 16 16' : '0 0 32 8'"
    aria-hidden="true"
    un-inline
    un-shrink-0
    un-align-middle
    un-overflow-visible
    un-ml="data-[row]:[0.4em]"
    un-h="[0.78rem] data-[row]:[0.56em]"
    un-w="[0.78rem] data-[row]:[2.15em]"
    :data-row="single ? undefined : ''"
  >
    <path
      v-if="single"
      :d="coil"
      fill="none"
      stroke="currentColor"
      :stroke-width="strokeW"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      v-for="(d, index) in single ? [] : cluster"
      :key="index"
      :d="d"
      :fill="hollow ? 'none' : 'currentColor'"
      :stroke="hollow ? 'currentColor' : 'none'"
      :stroke-width="hollow ? 1.35 : undefined"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>
