<script setup lang="ts">
import { inkWobbleBox } from '~/utils/inkDraw'

const props = defineProps<{
  seed: string
  fill?: boolean
  hatch?: boolean
  mark?: boolean
}>()

const FILL_SCALE = 0.9

const clipId = computed(() => `ink-wobble-clip-${props.seed}`)
const path = computed(() => inkWobbleBox(props.seed, 1.25, 1.25, 18.75, 18.75, 0.55, 3))
const fillTransform = `translate(10 10) scale(${FILL_SCALE}) translate(-10 -10)`
</script>

<template>
  <svg
    class="ink-wobble-box"
    viewBox="0 0 20 20"
    preserveAspectRatio="none"
    aria-hidden="true"
  >
    <defs>
      <clipPath
        :id="clipId"
        clipPathUnits="userSpaceOnUse"
      >
        <path :d="path" />
      </clipPath>
    </defs>
    <path
      v-if="fill"
      class="ink-wobble-fill"
      :d="path"
      :transform="fillTransform"
    />
    <g
      v-if="hatch"
      class="ink-wobble-hatch"
      :clip-path="`url(#${clipId})`"
    >
      <line
        v-for="n in 9"
        :key="n"
        :x1="-2"
        :y1="n * 2.4 - 4"
        :x2="22"
        :y2="n * 2.4 + 4"
      />
    </g>
    <path
      class="ink-wobble-stroke"
      :d="path"
      fill="none"
      stroke="currentColor"
      stroke-width="1.25"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <circle
      v-if="mark"
      class="ink-wobble-mark"
      cx="10"
      cy="10"
      r="1.35"
    />
  </svg>
</template>

<style scoped>
.ink-wobble-box {
  position: absolute;
  z-index: 1;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
  pointer-events: none;
  color: var(--ink);
}

.ink-wobble-stroke {
  opacity: 0.42;
}

.ink-wobble-fill {
  fill: var(--cell-fill, var(--colored-ink));
  fill-opacity: 0.36;
  stroke: none;
  transition: fill-opacity 160ms var(--ease-out);
}

@media (prefers-reduced-motion: reduce) {
  .ink-wobble-fill {
    transition: none;
  }
}

.ink-wobble-hatch {
  stroke: currentColor;
  stroke-width: 0.45;
  opacity: 0.7;
}

.ink-wobble-mark {
  fill: var(--colored-ink);
}
</style>
