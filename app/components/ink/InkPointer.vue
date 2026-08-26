<script setup lang="ts">
import type { InkArrowDir } from '~/utils/inkDraw'
import { inkPointerPath } from '~/utils/inkDraw'

const props = withDefaults(defineProps<{
  seed: string
  dir?: InkArrowDir
}>(), {
  dir: 'down',
})

const d = computed(() => inkPointerPath(props.seed, props.dir))
const tall = computed(() => props.dir === 'up' || props.dir === 'down')
</script>

<template>
  <svg
    class="ink-pointer"
    viewBox="0 0 96 96"
    aria-hidden="true"
    un-block
    un-overflow-visible
    un-text-colored-ink
    :class="tall ? 'is-tall' : 'is-wide'"
  >
    <path
      :d="d"
      fill="none"
      stroke="currentColor"
      stroke-width="1.7"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>

<style scoped>
.ink-pointer.is-tall {
  width: 2.35em;
  height: 4.2em;
}
.ink-pointer.is-wide {
  width: 4.2em;
  height: 2.35em;
}
</style>
