<script setup lang="ts">
const RING = 0.18
const LEAVE_MS = 160

const capable = shallowRef(false)
const visible = shallowRef(false)
const lag = shallowRef(true)
const aim = shallowRef<'idle' | 'hot' | 'native'>('idle')
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
  aim.value = stickyCursorAim(event.target)
}

function onPointerOut(event: PointerEvent) {
  if (event.relatedTarget)
    return
  if (leaveTimer)
    window.clearTimeout(leaveTimer)
  leaveTimer = window.setTimeout(() => {
    visible.value = false
    aim.value = 'idle'
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
    stopLoop()
    root()?.removeAttribute('data-sticky-cursor')
    paintStickyCursorCss(false)
  })
})
</script>

<template>
  <Teleport to="body">
    <span
      v-show="capable && visible && aim !== 'native'"
      class="sticky-cursor-dot"
      aria-hidden="true"
      :style="{ transform: `translate3d(${dotX}px, ${dotY}px, 0)` }"
    />
    <span
      v-show="capable && visible && aim !== 'native'"
      class="sticky-cursor-ring"
      aria-hidden="true"
      :data-hot="aim === 'hot' ? '' : undefined"
      :style="{ transform: `translate3d(${ringX}px, ${ringY}px, 0)` }"
    />
  </Teleport>
</template>

<style scoped>
.sticky-cursor-dot,
.sticky-cursor-ring {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 400;
  pointer-events: none;
  border-radius: 50%;
}

.sticky-cursor-dot {
  width: 7px;
  height: 7px;
  margin: -3.5px 0 0 -3.5px;
  background: var(--ink);
}

.sticky-cursor-ring {
  width: 28px;
  height: 28px;
  margin: -14px 0 0 -14px;
  border: 1.5px solid var(--ink);
  background: color-mix(in srgb, var(--ink) 10%, transparent);
  transition:
    width 0.28s var(--ease-out),
    height 0.28s var(--ease-out),
    margin 0.28s var(--ease-out),
    background 0.28s var(--ease-out);
}

.sticky-cursor-ring[data-hot] {
  width: 52px;
  height: 52px;
  margin: -26px 0 0 -26px;
  background: color-mix(in srgb, var(--colored-ink) 16%, transparent);
  border-color: var(--colored-ink);
}

@media (prefers-reduced-motion: reduce) {
  .sticky-cursor-ring {
    transition: none;
  }
}
</style>
