<script setup lang="ts">
import type { InkGlyphKind } from '~/utils/inkDraw'
import { inkGlyphPath } from '~/utils/inkDraw'

const props = defineProps<{
  seed: string
  kind: InkGlyphKind
  label: string
}>()

const d = computed(() => inkGlyphPath(props.seed, props.kind))
</script>

<template>
  <span
    class="ink-glyph"
    un-inline-flex
    un-shrink-0
    un-text-colored-ink
    role="img"
    :aria-label="label"
  >
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      un-block
      un-overflow-visible
      un-h="[1.5em]"
      un-w="[1.5em]"
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
  </span>
</template>
