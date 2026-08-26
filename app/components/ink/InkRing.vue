<script setup lang="ts">
import { inkRingPath } from '~/utils/inkDraw'

const props = defineProps<{
  seed: string
  label: string
}>()

const d = computed(() => inkRingPath(props.seed))
</script>

<template>
  <button
    type="button"
    class="ink-ring"
    un-m-0
    un-inline-flex
    un-cursor-pointer
    un-items-center
    un-border-0
    un-bg-transparent
    un-p-0
    un-align-middle
    un-text="muted hover:colored-ink focus-visible:colored-ink"
    :aria-label="label"
  >
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      un-block
      un-h="[0.72em]"
      un-w="[0.72em]"
      un-overflow-visible
    >
      <path
        :d="d"
        fill="none"
        stroke="currentColor"
        stroke-width="1.35"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </button>
</template>
