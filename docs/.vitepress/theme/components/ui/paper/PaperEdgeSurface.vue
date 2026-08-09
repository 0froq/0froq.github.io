<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, useAttrs, useTemplateRef } from 'vue'
import { paperEdgeFromId } from '~/composables/usePaperEdge'
import { observePaperEdgeSvgSize } from '~/composables/syncPaperEdgeSvgSize'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<{
  edgeId: string
  showTape?: boolean
}>(), {
  showTape: true,
})

const attrs = useAttrs()
const edge = computed(() => paperEdgeFromId(props.edgeId))
const svgRef = useTemplateRef<SVGSVGElement>('svgRef')
const rectRef = useTemplateRef<SVGRectElement>('rectRef')

const fillBind = computed(() =>
  attrs['un-fill'] ? { 'un-fill': attrs['un-fill'] } : {},
)
const strokeBind = computed(() =>
  attrs['un-stroke'] ? { 'un-stroke': attrs['un-stroke'] } : {},
)

let stopObserve: (() => void) | undefined

onMounted(() => {
  const svg = svgRef.value
  const rect = rectRef.value
  const host = svg?.parentElement
  if (svg && host)
    stopObserve = observePaperEdgeSvgSize(svg, host, rect)
})

onBeforeUnmount(() => stopObserve?.())
</script>

<template>
  <svg
    ref="svgRef"
    class="paper-edge-svg"
    viewBox="0 0 280 160"
    preserveAspectRatio="xMidYMid meet"
    aria-hidden="true"
  >
    <defs>
      <filter
        :id="edge.filterId"
        x="-10%"
        y="-10%"
        width="120%"
        height="120%"
        color-interpolation-filters="sRGB"
      >
        <feTurbulence
          type="fractalNoise"
          :baseFrequency="edge.frequency"
          :numOctaves="edge.octaves"
          :seed="edge.seed"
          result="noise"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="noise"
          :scale="edge.scale"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </defs>
    <!--
      viewBox 由 ResizeObserver 同步为宿主像素，1 user unit = 1 CSS px，
      左右描边不会再被非等比拉伸拉粗。
    -->
    <rect
      ref="rectRef"
      class="paper-edge-fill"
      x="0"
      y="0"
      width="280"
      height="160"
      rx="2"
      ry="2"
      un-fill="neutral-100/90 dark:neutral-900/90"
      un-stroke="neutral-200 dark:neutral-700"
      stroke-width="1"
      vector-effect="non-scaling-stroke"
      v-bind="{ ...fillBind, ...strokeBind }"
      :filter="`url(#${edge.filterId})`"
    />
  </svg>
  <span
    v-if="showTape"
    class="paper-edge-tape"
    :style="{
      '--tape-offset': edge.tapeOffset,
      '--tape-tilt': edge.tapeTilt,
    }"
  />
</template>

<style scoped>
.paper-edge-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  pointer-events: none;
  z-index: 0;
  --uno: 'drop-shadow-sm dark:drop-shadow';
}

.paper-edge-fill {
  transition: stroke 0.2s ease;
}

.paper-edge-tape {
  position: absolute;
  top: -7px;
  left: calc(50% + var(--tape-offset, 0px));
  z-index: 2;
  width: 56px;
  height: 15px;
  border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
  pointer-events: none;
  --uno: 'bg-neutral-600/35 dark:bg-neutral-500/70';
  transform: translateX(-50%) rotate(var(--tape-tilt, 0deg));
  --uno: 'backdrop-blur-sm dark:backdrop-blur';
}
</style>
