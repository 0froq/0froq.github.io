<script setup lang="ts">
const STORAGE = 'froq-desk-pin'

const pos = reactive({ x: 12, y: 8 })
const dragging = ref(false)
let grab = { x: 0, y: 0 }

onMounted(() => {
  try {
    const raw = localStorage.getItem(STORAGE)
    if (!raw)
      return
    const parsed = JSON.parse(raw) as { x: number, y: number }
    if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
      pos.x = parsed.x
      pos.y = parsed.y
    }
  }
  catch {
    // ignore
  }
})

function persist() {
  localStorage.setItem(STORAGE, JSON.stringify({ x: pos.x, y: pos.y }))
}

function onPointerDown(event: PointerEvent) {
  dragging.value = true
  grab = { x: event.clientX - pos.x, y: event.clientY - pos.y }
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
}

function onPointerMove(event: PointerEvent) {
  if (!dragging.value)
    return
  pos.x = event.clientX - grab.x
  pos.y = event.clientY - grab.y
}

function onPointerUp() {
  if (!dragging.value)
    return
  dragging.value = false
  persist()
}
</script>

<template>
  <button
    type="button"
    class="desk-pin"
    un-absolute
    un-z-2
    un-m-0
    un-cursor-grab
    un-border-0
    un-bg-transparent
    un-p-0
    un-font-mono
    un-text="11px colored-ink"
    :style="{ transform: `translate(${pos.x}px, ${pos.y}px)` }"
    aria-label="Drag me around the desk"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
  >
    <InkRing
      seed="desk-pin"
      label="pin"
    />
    <span un-ml-1>pin</span>
  </button>
</template>

<style scoped>
.desk-pin {
  left: 0;
  top: 0;
  touch-action: none;
}
.desk-pin:active {
  cursor: grabbing;
}
</style>
