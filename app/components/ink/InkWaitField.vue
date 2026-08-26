<script setup lang="ts">
import { inkWaitLayout } from '~/utils/inkDraw'

const props = withDefaults(defineProps<{
  seed: string
  count?: number
}>(), {
  count: 4,
})

const spots = computed(() => inkWaitLayout(props.seed, props.count))
</script>

<template>
  <div
    aria-hidden="true"
    un-pointer-events-none
    un-relative
    un-min-h-full
    un-overflow-visible
  >
    <InkBlob
      v-for="spot in spots"
      :key="spot.seed"
      :seed="spot.seed"
      un-absolute
      un-text-ink
      :style="{
        left: `${spot.left}%`,
        top: `${spot.top}%`,
        width: `${spot.width}em`,
        height: `${spot.height}em`,
        opacity: spot.opacity,
        rotate: `${spot.rot}deg`,
      }"
    />
  </div>
</template>
