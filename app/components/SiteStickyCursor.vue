<script setup lang="ts">
const RING = 0.18
const LEAVE_MS = 120

const capable = shallowRef(false)
const visible = shallowRef(false)
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

const html = computed(() => {
  if (!import.meta.client)
    return null
  return document.documentElement
})

function stopLoop() {
  if (raf) {
    cancelAnimationFrame(raf)
    raf = 0
  }
}

function loop() {
  rx += (mx - rx) * RING
  ry += (my - ry) * RING
  ringX.value = rx
  ringY.value = ry
  raf = requestAnimationFrame(loop)
}

function setCapable(next: boolean) {
  capable.value = next
  const root = html.value
  if (!root)
    return
  if (next)
    root.setAttribute('data-sticky-cursor', '')
  else
    root.removeAttribute('data-sticky-cursor')
  if (!next) {
    visible.value = false
    aim.value = 'idle'
    stopLoop()
    primed = false
  }
}

function syncCapable() {
  setCapable(stickyCursorCapable())
}

function onPointerMove(event: PointerEvent) {
  if (!capable.value)
    return
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
  syncCapable()
  const fine = window.matchMedia(STICKY_CURSOR_MQ)
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
  fine.addEventListener('change', syncCapable)
  reduce.addEventListener('change', syncCapable)
  window.addEventListener('pointermove', onPointerMove, { passive: true })
  document.addEventListener('pointerout', onPointerOut)
  onUnmounted(() => {
    fine.removeEventListener('change', syncCapable)
    reduce.removeEventListener('change', syncCapable)
    window.removeEventListener('pointermove', onPointerMove)
    document.removeEventListener('pointerout', onPointerOut)
    if (leaveTimer)
      window.clearTimeout(leaveTimer)
    stopLoop()
    html.value?.removeAttribute('data-sticky-cursor')
  })
})
</script>

<template>
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
</template>

<style scoped>
.sticky-cursor-dot,
.sticky-cursor-ring {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 200;
  pointer-events: none;
  border-radius: 50%;
  mix-blend-mode: difference;
  will-change: transform;
}

.sticky-cursor-dot {
  width: 8px;
  height: 8px;
  margin: -4px 0 0 -4px;
  background: #fff;
}

.sticky-cursor-ring {
  width: 36px;
  height: 36px;
  margin: -18px 0 0 -18px;
  border: 1px solid #fff;
  transition:
    width 0.35s var(--ease-out),
    height 0.35s var(--ease-out),
    margin 0.35s var(--ease-out);
}

.sticky-cursor-ring[data-hot] {
  width: 72px;
  height: 72px;
  margin: -36px 0 0 -36px;
}
</style>
