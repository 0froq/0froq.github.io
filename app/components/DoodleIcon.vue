<script setup lang="ts">
/**
 * Doodle svg atom — renders a `@oreo-design/doodle-icons` glyph cropped to its
 * ink bbox (see doodleIcon in utils/doodle). No layout: put it wherever an icon
 * goes (IconLink slot, plain text line, sidebar).
 * <DoodleIcon name="file-text" size="1em" draw boil />
 */
const props = withDefaults(
  defineProps<{
    name: string
    size?: string
    draw?: boolean | 'true' | 'false' | ''
    boil?: boolean | 'true' | 'false' | ''
    drawDuration?: number
    drawDelay?: number
  }>(),
  {
    size: '1em',
    drawDuration: 0.32,
    drawDelay: 0,
  },
)

const drawing = computed(() => props.draw === true || props.draw === 'true' || props.draw === '')
const boiling = computed(() => props.boil === true || props.boil === 'true' || props.boil === '')

const icon = computed(() => doodleIcon(props.name))
const boilId = useId()
const seeds = Array.from({ length: DOODLE_BOIL.frames }, (_, i) => i + 1).join(';')
const step = computed(() => props.drawDuration * 0.65)

function drawStyle(index: number) {
  if (!drawing.value) return undefined
  return {
    animationDuration: `${props.drawDuration}s`,
    animationDelay: `${(props.drawDelay + index * step.value).toFixed(3)}s`,
  }
}
</script>

<template>
  <svg
    v-if="icon"
    class="doodle-icon"
    :class="{ 'is-draw': drawing }"
    :viewBox="icon.viewBox"
    :width="size"
    :height="size"
    fill="none"
    stroke="currentColor"
    :stroke-width="DOODLE_STROKE"
    stroke-linecap="round"
    stroke-linejoin="round"
    un-block
    un-flex-none
    un-self-center
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
      <path
        v-for="(d, i) in icon.paths"
        :key="i"
        :d="d"
        :pathLength="drawing ? 1 : undefined"
        :style="drawStyle(i)"
      />
    </g>
  </svg>
</template>

<style scoped>
.doodle-icon.is-draw path {
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
  .doodle-icon.is-draw path {
    animation: none;
  }

  .doodle-icon g {
    filter: none;
  }
}
</style>
