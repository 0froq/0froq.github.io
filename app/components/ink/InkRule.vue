<script setup lang="ts">
import { inkRulePath } from '~/utils/inkDraw'

const props = withDefaults(defineProps<{
  seed: string
  width?: number
  pad?: number
}>(), {
  width: 120,
  pad: 4,
})

const d = computed(() => inkRulePath(props.seed, props.width, props.pad))
</script>

<template>
  <svg
    :viewBox="`0 0 ${width} 8`"
    aria-hidden="true"
    un-block
    un-h="[8px]"
    un-w-full
    un-overflow-visible
    un-text-colored-ink
  >
    <path
      :d="d"
      fill="none"
      stroke="currentColor"
      stroke-width="1.2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>
