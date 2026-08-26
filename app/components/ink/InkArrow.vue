<script setup lang="ts">
import type { InkArrowDir } from '~/utils/inkDraw'
import { inkArrowPath } from '~/utils/inkDraw'

const props = withDefaults(defineProps<{
  seed: string
  dir?: InkArrowDir
  label: string
}>(), {
  dir: 'up',
})

const d = computed(() => inkArrowPath(props.seed, props.dir))
</script>

<template>
  <span
    class="ink-arrow"
    un-m-0
    un-inline-flex
    un-items-center
    un-p-0
    un-align-middle
    un-text="colored-ink"
    role="img"
    :aria-label="label"
  >
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      un-block
      un-h="[0.95em]"
      un-w="[0.95em]"
      un-overflow-visible
    >
      <path
        :d="d"
        fill="none"
        stroke="currentColor"
        stroke-width="1.45"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </span>
</template>
