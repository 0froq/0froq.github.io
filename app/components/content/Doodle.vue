<script setup lang="ts">
const props = withDefaults(defineProps<{
  name: string
  size?: string
  to?: string
  draw?: boolean | 'true' | 'false' | ''
  boil?: boolean | 'true' | 'false' | ''
  drawDuration?: number
  drawDelay?: number
}>(), {
  size: '1em',
  drawDuration: 0.32,
  drawDelay: 0,
})

const slots = useSlots()
const drawing = computed(() => props.draw === true || props.draw === 'true' || props.draw === '')
const boiling = computed(() => props.boil === true || props.boil === 'true' || props.boil === '')
const inked = computed(() => Boolean(props.to && slots.default))
const wrap = computed(() => props.to ? resolveComponent('NuxtLink') : 'span')

const paths = computed(() => doodlePaths(props.name))
const boilId = useId()
const seeds = Array.from({ length: DOODLE_BOIL.frames }, (_, i) => i + 1).join(';')
const step = computed(() => props.drawDuration * 0.65)

function drawStyle(index: number) {
  if (!drawing.value)
    return undefined
  return {
    animationDuration: `${props.drawDuration}s`,
    animationDelay: `${(props.drawDelay + index * step.value).toFixed(3)}s`,
  }
}
</script>

<template>
  <component
    :is="wrap"
    v-if="paths"
    v-bind="to ? { to } : {}"
    un-inline-flex
    un-items-center
    un-gap="[0.3em]"
    un-align-middle
    un-decoration-none
  >
    <svg
      class="doodle"
      :class="{ 'is-draw': drawing }"
      viewBox="0 0 48 48"
      :width="size"
      :height="size"
      fill="none"
      stroke="currentColor"
      :stroke-width="DOODLE_STROKE"
      stroke-linecap="round"
      stroke-linejoin="round"
      data-stream-atom
      un-block
      un-overflow-visible
      aria-hidden="true"
    >
      <defs v-if="boiling">
        <filter
          :id="boilId"
          x="-30%"
          y="-30%"
          width="160%"
          height="160%"
        >
          <feTurbulence
            type="fractalNoise"
            :baseFrequency="DOODLE_BOIL.frequency"
            :numOctaves="DOODLE_BOIL.octaves"
            seed="1"
            result="noise"
          >
            <animate
              attributeName="seed"
              :values="seeds"
              :dur="DOODLE_BOIL.duration"
              repeatCount="indefinite"
              calcMode="discrete"
            />
          </feTurbulence>
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            :scale="DOODLE_BOIL.amplitude"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
      <g :filter="boiling ? `url(#${boilId})` : undefined">
        <rect
          width="48"
          height="48"
          fill="none"
          stroke="none"
        />
        <path
          v-for="(d, i) in paths"
          :key="i"
          :d="d"
          :pathLength="drawing ? 1 : undefined"
          :style="drawStyle(i)"
        />
      </g>
    </svg>
    <span
      v-if="slots.default"
      :data-ink="inked ? 'underline' : undefined"
      :data-hover-ink="inked ? 'mark' : undefined"
    ><slot /></span>
  </component>
</template>

<style scoped>
.doodle.is-draw path {
  animation-name: doodle-draw;
  animation-timing-function: cubic-bezier(0.65, 0.05, 0.36, 1);
  animation-fill-mode: backwards;
}

@keyframes doodle-draw {
  from {
    stroke-dasharray: 1;
    stroke-dashoffset: 1;
  }
  to {
    stroke-dasharray: 1;
    stroke-dashoffset: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .doodle.is-draw path {
    animation: none;
  }

  .doodle g {
    filter: none;
  }
}
</style>
