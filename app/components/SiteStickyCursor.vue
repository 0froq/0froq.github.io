<script setup lang="ts">
import { inkCursorArrowParts } from '~/utils/inkDraw'

const RING = 0.18
const LEAVE_MS = 160
const ARROW_SEED = 'sticky-cursor'
const ARROW_HEAD_MS = 280
const ARROW_STEM_MS = 360

const parts = computed(() => inkCursorArrowParts(ARROW_SEED))
const stemEl = ref<SVGPathElement | null>(null)
const headEl = ref<SVGPathElement | null>(null)
const drawTimers: number[] = []
const drawAnims: Animation[] = []

const capable = shallowRef(false)
const visible = shallowRef(false)
const lag = shallowRef(true)
const aim = shallowRef<'idle' | 'hot' | 'native' | 'ink'>('idle')
const inkKind = shallowRef<'underline' | 'mark' | 'circle'>('underline')
const dotX = shallowRef(0)
const dotY = shallowRef(0)
const ringX = shallowRef(0)
const ringY = shallowRef(0)

let raf = 0
let leaveTimer = 0
let mx = 0
let my = 0
let rx = 0
let ry = 0
let primed = false
let lastX = 0
let lastY = 0
let travel = 0
let inkHost: HTMLElement | null = null

function root() {
  return import.meta.client ? document.documentElement : null
}

function stopLoop() {
  if (raf) {
    cancelAnimationFrame(raf)
    raf = 0
  }
}

function loop() {
  const k = lag.value ? RING : 1
  rx += (mx - rx) * k
  ry += (my - ry) * k
  ringX.value = rx
  ringY.value = ry
  raf = requestAnimationFrame(loop)
}

function setCapable(next: boolean) {
  capable.value = next
  const el = root()
  if (!el)
    return
  if (next) {
    el.setAttribute('data-sticky-cursor', '')
    paintStickyCursorCss(true)
  }
  else {
    el.removeAttribute('data-sticky-cursor')
    paintStickyCursorCss(false)
  }
  if (!next) {
    visible.value = false
    aim.value = 'idle'
    stopLoop()
    primed = false
  }
}

function syncPrefs() {
  lag.value = stickyCursorLag()
  setCapable(stickyCursorCapable())
}

function onPointerMove(event: PointerEvent) {
  if (!capable.value) {
    if (stickyCursorCapable(event.pointerType))
      setCapable(true)
    else
      return
  }
  if (leaveTimer) {
    window.clearTimeout(leaveTimer)
    leaveTimer = 0
  }
  mx = event.clientX
  my = event.clientY
  dotX.value = mx
  dotY.value = my
  if (!primed) {
    rx = mx
    ry = my
    ringX.value = mx
    ringY.value = my
    primed = true
    loop()
  }
  visible.value = true
  const hit = stickyCursorHit(event.clientX, event.clientY, event.target)
  aim.value = stickyCursorAim(hit)

  const nextHost = stickyCursorRailHost(hit)
  if (inkHost && inkHost !== nextHost)
    releaseStickyRailInk(inkHost)
  if (nextHost !== inkHost) {
    travel = 0
    lastX = event.clientX
    lastY = event.clientY
  }
  else {
    travel += Math.hypot(event.clientX - lastX, event.clientY - lastY)
    lastX = event.clientX
    lastY = event.clientY
  }
  inkHost = nextHost
  if (nextHost) {
    const kind = scrubStickyRailInk(nextHost, event.clientX, event.clientY, travel)
    if (kind)
      inkKind.value = kind
  }
}

function pathLen(el: SVGPathElement) {
  return Math.ceil(el.getTotalLength()) + 8
}

function hideStroke(el: SVGPathElement) {
  const len = pathLen(el)
  el.style.strokeDasharray = `${len}`
  el.style.strokeDashoffset = `${len}`
}

function revealStroke(el: SVGPathElement, ms: number) {
  const len = pathLen(el)
  el.style.strokeDasharray = `${len}`
  if (!lag.value || ms <= 0) {
    el.style.strokeDashoffset = '0'
    return
  }
  el.style.strokeDashoffset = `${len}`
  const anim = el.animate(
    [
      { strokeDashoffset: `${len}` },
      { strokeDashoffset: '0' },
    ],
    {
      duration: ms,
      easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
      fill: 'forwards',
    },
  )
  drawAnims.push(anim)
  anim.finished.then(() => {
    el.style.strokeDashoffset = '0'
  }).catch(() => {})
}

function clearDraw() {
  for (const id of drawTimers)
    window.clearTimeout(id)
  drawTimers.length = 0
  for (const anim of drawAnims)
    anim.cancel()
  drawAnims.length = 0
}

function armArrowDraw() {
  const stem = stemEl.value
  const head = headEl.value
  if (!stem || !head)
    return
  clearDraw()
  hideStroke(head)
  hideStroke(stem)
  if (!lag.value) {
    revealStroke(head, 0)
    revealStroke(stem, 0)
    return
  }
  drawTimers.push(window.setTimeout(revealStroke, 16, head, ARROW_HEAD_MS))
  drawTimers.push(window.setTimeout(revealStroke, 16 + ARROW_HEAD_MS, stem, ARROW_STEM_MS))
}

watch(aim, (next) => {
  if (next === 'hot')
    void nextTick(() => armArrowDraw())
  else
    clearDraw()
})

function onPointerOut(event: PointerEvent) {
  if (event.relatedTarget)
    return
  if (leaveTimer)
    window.clearTimeout(leaveTimer)
  leaveTimer = window.setTimeout(() => {
    visible.value = false
    aim.value = 'idle'
    if (inkHost) {
      releaseStickyRailInk(inkHost)
      inkHost = null
    }
  }, LEAVE_MS)
}

onMounted(() => {
  syncPrefs()
  const fine = window.matchMedia(STICKY_CURSOR_MQ)
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
  fine.addEventListener('change', syncPrefs)
  reduce.addEventListener('change', syncPrefs)
  window.addEventListener('pointermove', onPointerMove, { passive: true })
  document.addEventListener('pointerout', onPointerOut)
  onUnmounted(() => {
    fine.removeEventListener('change', syncPrefs)
    reduce.removeEventListener('change', syncPrefs)
    window.removeEventListener('pointermove', onPointerMove)
    document.removeEventListener('pointerout', onPointerOut)
    if (leaveTimer)
      window.clearTimeout(leaveTimer)
    clearDraw()
    stopLoop()
    if (inkHost) {
      releaseStickyRailInk(inkHost)
      inkHost = null
    }
    root()?.removeAttribute('data-sticky-cursor')
    paintStickyCursorCss(false)
  })
})
</script>

<template>
  <Teleport to="body">
    <span
      v-show="capable && visible && aim === 'idle'"
      class="sticky-cursor-dot"
      aria-hidden="true"
      :style="{ transform: `translate3d(${dotX}px, ${dotY}px, 0)` }"
    />
    <svg
      v-show="capable && visible && aim === 'hot'"
      class="sticky-cursor-arrow"
      viewBox="0 0 32 32"
      aria-hidden="true"
      :style="{ transform: `translate3d(${ringX}px, ${ringY}px, 0)` }"
    >
      <path
        ref="stemEl"
        class="sticky-cursor-arrow-stroke"
        :d="parts.stem"
        fill="none"
        stroke="currentColor"
        stroke-width="1.65"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        ref="headEl"
        class="sticky-cursor-arrow-stroke"
        :d="parts.head"
        fill="none"
        stroke="currentColor"
        stroke-width="1.65"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
    <span
      v-show="capable && visible && aim === 'ink'"
      class="sticky-cursor-nib"
      aria-hidden="true"
      :data-ink="inkKind"
      :style="{ transform: `translate3d(${ringX}px, ${ringY}px, 0)` }"
    />
  </Teleport>
</template>

<style scoped>
.sticky-cursor-dot,
.sticky-cursor-arrow,
.sticky-cursor-nib {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 400;
  pointer-events: none;
}

.sticky-cursor-dot,
.sticky-cursor-nib {
  border-radius: 50%;
}

.sticky-cursor-dot {
  width: 7px;
  height: 7px;
  margin: -3.5px 0 0 -3.5px;
  background: var(--ink);
}

.sticky-cursor-arrow {
  width: 26px;
  height: 26px;
  overflow: visible;
  color: var(--colored-ink);
}

.sticky-cursor-nib {
  width: 16px;
  height: 16px;
  margin: -8px 0 0 -8px;
  background: var(--colored-ink);
}

.sticky-cursor-nib[data-ink='mark'] {
  width: 28px;
  height: 28px;
  margin: -14px 0 0 -14px;
  opacity: 0.42;
}

.sticky-cursor-nib[data-ink='underline'] {
  width: 12px;
  height: 12px;
  margin: -6px 0 0 -6px;
}

.sticky-cursor-nib[data-ink='circle'] {
  width: 14px;
  height: 14px;
  margin: -7px 0 0 -7px;
}
</style>
