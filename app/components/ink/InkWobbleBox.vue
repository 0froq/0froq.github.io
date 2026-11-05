<script setup lang="ts">
import { inkWobbleBox } from '~/utils/inkDraw'

const props = withDefaults(
  defineProps<{
    seed: string
    slices?: WheelInkSlice[]
    mark?: boolean
  }>(),
  {
    slices: () => [],
    mark: false,
  },
)

const FILL_SCALE = 0.9

const clipId = computed(() => `ink-wobble-clip-${props.seed}`)
const path = computed(() => inkWobbleBox(props.seed, 1.25, 1.25, 18.75, 18.75, 0.55, 3))
const fillTransform = `translate(10 10) scale(${FILL_SCALE}) translate(-10 -10)`
const frameHot = computed(
  () =>
    props.slices.length === 1 &&
    !props.slices[0]?.points &&
    Boolean(props.slices[0]?.hot || props.slices[0]?.pinned),
)
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
      <clipPath
        v-for="(slice, index) in slices"
        :id="`${clipId}-${index}`"
        :key="`${seed}-${index}`"
        clipPathUnits="userSpaceOnUse"
      >
        <polygon
          v-if="slice.points"
          :points="slice.points"
        />
        <path
          v-else
          :d="path"
        />
      </clipPath>
    </defs>
    <g
      v-for="(slice, index) in slices"
      :key="`${seed}-draw-${index}`"
      :clip-path="`url(#${clipId})`"
    >
      <g :clip-path="`url(#${clipId}-${index})`">
        <path
          v-if="slice.role !== 'rook'"
          class="ink-wobble-fill"
          :class="[
            `ink-wobble-fill--${slice.role}`,
            { 'is-hot': slice.hot, 'is-pinned': slice.pinned, 'is-void': slice.voided },
          ]"
          :d="path"
          :transform="fillTransform"
        />
        <g
          v-else
          class="ink-wobble-hatch"
          :class="{ 'is-hot': slice.hot, 'is-pinned': slice.pinned }"
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
        <polygon
          v-if="slice.points && (slice.hot || slice.pinned)"
          class="ink-slice-hot"
          :points="slice.points"
        />
      </g>
    </g>
    <path
      class="ink-wobble-stroke"
      :class="{ 'is-hot': frameHot }"
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

.ink-wobble-stroke.is-hot {
  opacity: 0.9;
}

.ink-wobble-fill {
  fill: var(--cell-fill, var(--colored-ink));
  fill-opacity: 0.36;
  stroke: none;
  transition: fill-opacity 160ms var(--ease-out);
}

.ink-wobble-fill--log {
  fill: var(--cell-fill-log, var(--ink));
}

.ink-wobble-fill--journal {
  fill: var(--cell-fill-journal, var(--colored-ink));
}

.ink-wobble-fill.is-void {
  fill: var(--muted);
}

.ink-wobble-fill.is-hot,
.ink-wobble-fill.is-pinned {
  fill-opacity: 0.72;
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

.ink-wobble-hatch.is-hot,
.ink-wobble-hatch.is-pinned {
  opacity: 0.95;
  stroke-width: 0.7;
}

.ink-slice-hot {
  fill: none;
  stroke: var(--colored-ink);
  stroke-width: 1.15;
  vector-effect: non-scaling-stroke;
}

.ink-wobble-mark {
  fill: var(--colored-ink);
}
</style>
