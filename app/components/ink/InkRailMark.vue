<script setup lang="ts">
import { inkRailMarkMetrics, inkRailMarkPath } from '~/utils/inkDraw'

const props = defineProps<{
  seed: string
  circled: boolean
  hovered?: boolean
}>()

const hostRef = shallowRef<SVGSVGElement | null>(null)
const lineRef = shallowRef<SVGPathElement | null>(null)
const loopRef = shallowRef<SVGPathElement | null>(null)
const boxW = shallowRef(48)
const boxH = shallowRef(28)
const em = shallowRef(28)
const italic = shallowRef(false)
const morph = shallowRef(props.circled ? 1 : 0)
const show = shallowRef(props.circled ? 1 : 0)
let coilRaf = 0
let ro: ResizeObserver | undefined

function prefersReducedMotion() {
  return import.meta.client
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function easeOut(u: number) {
  return 1 - (1 - u) ** 3
}

function measure() {
  const el = hostRef.value?.parentElement
  if (!el)
    return
  const cs = getComputedStyle(el)
  boxW.value = el.offsetWidth
  boxH.value = el.offsetHeight
  em.value = Number.parseFloat(cs.fontSize) || 16
  italic.value = /italic|oblique/.test(cs.fontStyle)
}

function windowDash(
  path: SVGPathElement,
  start: number,
  end: number,
  total: number,
) {
  const vis = Math.max(end - start, 0)
  if (vis < 0.4 || total < 1) {
    path.style.strokeDasharray = `0 ${Math.max(total, 1)}`
    path.style.strokeDashoffset = '0'
    return
  }
  path.style.strokeDasharray = `${vis} ${total}`
  path.style.strokeDashoffset = `${-start}`
}

function paintDash() {
  const line = lineRef.value
  const loop = loopRef.value
  if (!line || !loop || import.meta.server)
    return
  const lineLen = line.getTotalLength()
  const loopLen = loop.getTotalLength()
  const t = morph.value
  const s = show.value

  if (t <= 0.001) {
    windowDash(line, 0, lineLen * s, lineLen)
    windowDash(loop, 0, 0, loopLen)
    return
  }

  windowDash(line, lineLen * t, lineLen, lineLen)
  windowDash(loop, 0, loopLen * t, loopLen)
}

function goals() {
  if (props.circled)
    return { morph: 1, show: 1 }
  if (props.hovered)
    return { morph: 0, show: 1 }
  if (morph.value > 0.02)
    return { morph: 0, show: 1 }
  return { morph: 0, show: 0 }
}

function goTo(animate: boolean) {
  cancelAnimationFrame(coilRaf)
  const next = goals()
  if (!animate || prefersReducedMotion()) {
    morph.value = next.morph
    show.value = next.show
    const rest = goals()
    morph.value = rest.morph
    show.value = rest.show
    paintDash()
    return
  }
  const fromM = morph.value
  const fromS = show.value
  if (Math.abs(next.morph - fromM) < 0.004 && Math.abs(next.show - fromS) < 0.004) {
    morph.value = next.morph
    show.value = next.show
    paintDash()
    if (!props.circled && !props.hovered && next.show > 0.02 && next.morph < 0.02)
      goTo(true)
    return
  }
  const dist = Math.max(Math.abs(next.morph - fromM), Math.abs(next.show - fromS))
  const ms = 240 + dist * 720
  const started = performance.now()
  const tick = (now: number) => {
    const u = Math.min(1, (now - started) / ms)
    const e = easeOut(u)
    morph.value = fromM + (next.morph - fromM) * e
    show.value = fromS + (next.show - fromS) * e
    paintDash()
    if (u < 1) {
      coilRaf = requestAnimationFrame(tick)
      return
    }
    if (!props.circled && !props.hovered && morph.value < 0.02 && show.value > 0.02)
      goTo(true)
  }
  coilRaf = requestAnimationFrame(tick)
}

const metrics = computed(() => inkRailMarkMetrics(boxW.value, boxH.value, em.value))
const markPath = computed(() => inkRailMarkPath(
  props.seed,
  boxW.value,
  boxH.value,
  em.value,
  italic.value,
))
const strokeW = computed(() => Math.max(1.15, em.value * 0.055))

watch(() => markPath.value.dLine + markPath.value.dLoop, async () => {
  await nextTick()
  paintDash()
})

watch(
  [() => props.circled, () => props.hovered],
  () => goTo(true),
)

onMounted(async () => {
  measure()
  await nextTick()
  paintDash()
  goTo(false)
  ro = new ResizeObserver(measure)
  const parent = hostRef.value?.parentElement
  if (parent)
    ro.observe(parent)
})

onUnmounted(() => {
  cancelAnimationFrame(coilRaf)
  ro?.disconnect()
})
</script>

<template>
  <svg
    ref="hostRef"
    un-absolute
    un-overflow-visible
    un-pointer-events-none
    un-text-colored-ink
    aria-hidden="true"
    :viewBox="`0 0 ${metrics.width} ${metrics.height}`"
    :width="metrics.width"
    :height="metrics.height"
    :style="{
      left: `${-metrics.padX}px`,
      top: `${-metrics.padTop}px`,
    }"
  >
    <path
      ref="lineRef"
      :d="markPath.dLine"
      fill="none"
      stroke="currentColor"
      :stroke-width="strokeW"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      ref="loopRef"
      :d="markPath.dLoop"
      fill="none"
      stroke="currentColor"
      :stroke-width="strokeW"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>
