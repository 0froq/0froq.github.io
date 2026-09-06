<script setup lang="ts">
import { inkGlyphPath } from '~/utils/inkDraw'

const props = withDefaults(defineProps<{
  seed?: string
}>(), {
  seed: 'hash',
})

const d = computed(() => inkGlyphPath(props.seed, 'hash'))
</script>

<template>
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    un-inline-block
    un-shrink-0
    un-h="[0.95em]"
    un-w="[0.95em]"
    un-overflow-visible
    un-text-colored-ink
    un-translate-y="[0.06em]"
  >
    <path
      :d="d"
      fill="none"
      stroke="currentColor"
      stroke-width="1.75"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>
