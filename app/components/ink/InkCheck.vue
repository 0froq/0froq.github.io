<script setup lang="ts">
import { inkBoxPath, inkTickPath } from '~/utils/inkDraw'

const props = defineProps<{
  seed: string
}>()

const checked = defineModel<boolean>({ required: true })

const box = computed(() => inkBoxPath(props.seed))
const tick = computed(() => inkTickPath(props.seed))
</script>

<template>
  <span
    class="ink-check"
    :data-on="checked ? '' : undefined"
    un-relative
    un-inline-grid
    un-h="[1.05em]"
    un-w="[1.05em]"
    un-shrink-0
    un-place-items-center
    un-text="data-[on]:colored-ink"
    aria-hidden="true"
  >
    <svg
      viewBox="0 0 18 18"
      un-block
      un-h="[1.05em]"
      un-w="[1.05em]"
      un-overflow-visible
    >
      <path
        class="ink-check-box"
        :d="box"
        fill="none"
        stroke="currentColor"
        stroke-width="1.35"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        class="ink-check-tick"
        :d="tick"
        fill="none"
        stroke="currentColor"
        stroke-width="1.55"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </span>
</template>

<style scoped>
.ink-check-tick {
  stroke-dasharray: 22;
  stroke-dashoffset: 22;
  transition: stroke-dashoffset 340ms var(--ease-out);
}

.ink-check[data-on] .ink-check-tick {
  stroke-dashoffset: 0;
}

@media (prefers-reduced-motion: reduce) {
  .ink-check-tick {
    transition: none;
    stroke-dashoffset: 22;
  }

  .ink-check[data-on] .ink-check-tick {
    stroke-dashoffset: 0;
  }
}
</style>
