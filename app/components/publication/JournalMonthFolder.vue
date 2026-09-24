<script setup lang="ts">
/**
 * One month of peek cards as a fan.
 * The journal hub mounts it embedded; the lab page mounts it alone.
 */
import { usePreferredReducedMotion } from '@vueuse/core'

const props = defineProps<{
  items: LayerEntry[]
  month?: string
  embedded?: boolean
  /** Open on this entry when it is in the month. Absent means the newest. */
  focusPath?: string | null
}>()

const emit = defineEmits<{
  active: [entry: LayerEntry | null]
  inked: []
}>()

const reduceMotion = usePreferredReducedMotion()
const wide = useMin('lg')
const vertical = computed(() => !!props.embedded && wide.value)

const months = computed(() => {
  const ids = new Set<string>()
  for (const item of props.items) {
    const id = monthIdOf(item)
    if (id)
      ids.add(id)
  }
  return [...ids].sort()
})

const nowId = computed(() => {
  const now = new Date()
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`
})

const monthId = ref('')
const posed = ref(false)
const inked = ref(false)
const armed = ref(false)

watch(months, (list) => {
  if (props.month && list.includes(props.month)) {
    monthId.value = props.month
    return
  }
  if (monthId.value && list.includes(monthId.value))
    return
  monthId.value = list.includes(nowId.value)
    ? nowId.value
    : (list.at(-1) ?? '')
}, { immediate: true })

watch(() => props.month, (id) => {
  if (id)
    monthId.value = id
})

const sheets = computed(() => {
  const id = monthId.value
  if (!id)
    return []
  return props.items
    .filter(item => monthIdOf(item) === id)
    .slice()
    .sort((a, b) => (a.created ?? '').localeCompare(b.created ?? ''))
})

const nowEmpty = computed(() => !months.value.includes(nowId.value))
const monthLabel = computed(() => formatMonth(monthId.value))
const monthIndex = computed(() => months.value.indexOf(monthId.value))

const cursor = ref(0)
const scrubbing = ref(false)
/** Card is 16rem × 9rem. Collapsed pitch is half the old 34/319 so the tucked sheets overlap more. */
const CARD_REM = 16
const CARD_H_REM = CARD_REM * 9 / 16
const STEP_REM = CARD_REM * 17 / 319
/** Pitch + peel stays 286/319 of the width, so the active face stays as clear as before. */
const SHIFT_REM = CARD_REM * 286 / 319 - STEP_REM
/** Vertical peel leaves a short gap under the active face so the date line stays clear. */
const SHIFT_REM_V = CARD_H_REM + 0.8 - STEP_REM
const FAN_DEG = 2.4
const DRAG_GATE = 8
const SCROLL_PX = 190

const front = computed(() => {
  const list = sheets.value
  if (!list.length)
    return null
  const i = Math.round(Math.min(Math.max(cursor.value, 0), list.length - 1))
  return list[i]?.path ?? null
})

let scrubStop: ReturnType<typeof setTimeout> | undefined
let dealTimer: ReturnType<typeof setTimeout> | undefined
let dealToken = 0
let lastDrag = 0
let pointer: { id: number, x: number, y: number, moved: number, captured: boolean } | null = null

watch(monthId, () => {
  restCursor()
})

watch(sheets, async (list, prev) => {
  placeCursor(list, !prev)
  if (prev && sameSheetPaths(prev, list))
    return
  const token = ++dealToken
  clearTimeout(dealTimer)
  posed.value = false
  inked.value = false
  armed.value = false
  await nextTick()
  if (token !== dealToken || import.meta.server)
    return
  // Stacked and blank, fade the top face, arm the move, then open the fan.
  requestAnimationFrame(() => {
    if (token !== dealToken)
      return
    requestAnimationFrame(() => {
      if (token !== dealToken)
        return
      if (reduceMotion.value === 'reduce') {
        inked.value = true
        armed.value = true
        posed.value = true
        emit('inked')
        return
      }
      inked.value = true
      dealTimer = window.setTimeout(() => {
        if (token !== dealToken)
          return
        emit('inked')
        armed.value = true
        requestAnimationFrame(() => {
          if (token !== dealToken)
            return
          requestAnimationFrame(() => {
            if (token !== dealToken)
              return
            posed.value = true
          })
        })
      }, 420)
    })
  })
}, { immediate: true })

watch(front, (path) => {
  const entry = sheets.value.find(item => item.path === path) ?? null
  emit('active', entry)
}, { immediate: true })

watch(() => props.focusPath, (path) => {
  if (!path)
    return
  const index = sheets.value.findIndex(item => item.path === path)
  if (index >= 0)
    setCursor(index)
})

onUnmounted(() => {
  dealToken += 1
  clearTimeout(scrubStop)
  clearTimeout(dealTimer)
})

function monthIdOf(item: LayerEntry) {
  const key = journalDayKey(item.created)
  return key ? key.slice(0, 7) : null
}

function formatMonth(id: string) {
  if (!id)
    return ''
  const year = Number(id.slice(0, 4))
  const month = Number(id.slice(5, 7)) - 1
  const label = HEAT_MONTHS[month] ?? id
  return `${label} ${year}`
}

function stepMonth(delta: number) {
  const list = months.value
  const next = monthIndex.value + delta
  if (next < 0 || next >= list.length)
    return
  monthId.value = list[next]!
}

function cursorMax() {
  return Math.max(sheets.value.length - 1, 0)
}

function sameSheetPaths(a: LayerEntry[], b: LayerEntry[]) {
  return a.length === b.length && a.every((item, index) => item.path === b[index]?.path)
}

function focusedIndex(list: LayerEntry[]) {
  const path = props.focusPath
  if (!path)
    return -1
  return list.findIndex(item => item.path === path)
}

function placeCursor(list: LayerEntry[], forceEnd: boolean) {
  const max = Math.max(list.length - 1, 0)
  const focus = focusedIndex(list)
  if (focus >= 0)
    cursor.value = focus
  else if (forceEnd || cursor.value > max)
    cursor.value = max
}

function restCursor() {
  cursor.value = cursorMax()
}

function setCursor(next: number) {
  cursor.value = Math.min(cursorMax(), Math.max(0, next))
}

function snapCursor() {
  const max = cursorMax()
  const c = Math.min(max, Math.max(0, cursor.value))
  const base = Math.floor(c + 1e-9)
  if (base >= max) {
    cursor.value = max
    return
  }
  const t = c - base
  cursor.value = t < 0.5 ? base : base + 1
}

async function endScrub() {
  scrubbing.value = false
  await nextTick()
  snapCursor()
}

function markScrub() {
  scrubbing.value = true
  clearTimeout(scrubStop)
  scrubStop = setTimeout(() => {
    void endScrub()
  }, 160)
}

function nudge(deltaPx: number) {
  if (sheets.value.length <= 1)
    return
  setCursor(cursor.value + deltaPx / SCROLL_PX)
}

function wheelDelta(event: WheelEvent) {
  const line = event.deltaMode === 1 ? 16 : 1
  return (event.deltaY - event.deltaX) * line
}

function onWheel(event: WheelEvent) {
  event.preventDefault()
  markScrub()
  const delta = wheelDelta(event)
  nudge(vertical.value ? delta : -delta)
}

function onPointerDown(event: PointerEvent) {
  if (event.button !== 0)
    return
  lastDrag = 0
  pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, moved: 0, captured: false }
}

function onPointerMove(event: PointerEvent) {
  if (!pointer || event.pointerId !== pointer.id)
    return
  const dx = event.clientX - pointer.x
  const dy = event.clientY - pointer.y
  pointer.x = event.clientX
  pointer.y = event.clientY
  pointer.moved += Math.hypot(dx, dy)
  lastDrag = pointer.moved
  if (pointer.moved < DRAG_GATE)
    return
  if (!pointer.captured) {
    const stage = event.currentTarget
    if (stage instanceof HTMLElement)
      stage.setPointerCapture(event.pointerId)
    pointer.captured = true
  }
  markScrub()
  nudge(-dy + dx)
}

function onPointerUp(event: PointerEvent) {
  if (!pointer || event.pointerId !== pointer.id)
    return
  lastDrag = pointer.moved
  pointer = null
  if (lastDrag >= DRAG_GATE) {
    clearTimeout(scrubStop)
    void endScrub()
  }
}

function onSheetPick(entry: LayerEntry, event: MouseEvent) {
  if (lastDrag >= DRAG_GATE)
    return
  const target = event.target
  if (target instanceof Element && target.closest('[data-issue-peek-cta], [aria-label="Dismiss"]'))
    return
  if (entry.path === front.value)
    return
  event.preventDefault()
  event.stopPropagation()
  const index = sheets.value.findIndex(item => item.path === entry.path)
  if (index >= 0)
    setCursor(index)
}

function onKey(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    restCursor()
    return
  }
  if (event.key === 'ArrowLeft')
    stepMonth(-1)
  if (event.key === 'ArrowRight')
    stepMonth(1)
}

function cursorPivot() {
  const n = sheets.value.length
  if (!n)
    return 0
  return Math.min(Math.max(cursor.value, 0), n - 1)
}

function hash32(seed: string) {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function unit(h: number, slot: number) {
  return ((Math.imul(h ^ Math.imul(slot + 1, 0x9E3779B9), 0x85EBCA6B) >>> 11) & 0xFF) / 255
}

function signed(h: number, slot: number) {
  return unit(h, slot) * 2 - 1
}

function sheetAlong(index: number) {
  const n = sheets.value.length
  const span = Math.max(n - 1, 0) * STEP_REM
  const peel = Math.min(1, Math.max(0, index - cursor.value))
  const shift = vertical.value ? SHIFT_REM_V : SHIFT_REM
  return -span / 2 + index * STEP_REM + peel * shift
}

function sheetTr(index: number) {
  return (index - cursorPivot()) * FAN_DEG
}

function fanPose(index: number, entry: LayerEntry) {
  const h = hash32(entry.path)
  const amp = 0.4 + 0.6 * Math.min(1, Math.abs(index - cursorPivot()))
  const jx = signed(h, 0) * 0.034 * CARD_REM * amp
  const jy = signed(h, 1) * 0.048 * CARD_REM * amp
  const jr = signed(h, 2) * 4.4 * amp
  const along = sheetAlong(index)
  return {
    tx: vertical.value ? jx : along + jx,
    ty: vertical.value ? along + jy : jy,
    tr: sheetTr(index) + jr,
  }
}

function sheetStyle(index: number, entry: LayerEntry) {
  const pose = posed.value ? fanPose(index, entry) : { tx: 0, ty: 0, tr: 0 }
  return {
    transform: `translate(-50%, -50%) translate(${pose.tx}rem, ${pose.ty}rem) rotate(${pose.tr}deg)`,
    zIndex: String(index),
  }
}
</script>

<template>
  <div
    class="month-folder"
    :data-embedded="embedded ? '' : undefined"
    :data-vertical="vertical ? '' : undefined"
    :data-inked="inked ? '' : undefined"
    :data-armed="armed ? '' : undefined"
    :data-posed="posed ? '' : undefined"
    :data-scrub="scrubbing ? '' : undefined"
    :data-reduce="reduceMotion === 'reduce' ? '' : undefined"
    un-relative
    un-flex
    un-min-h-0
    un-w-full
    un-flex-col
    un-items-center
    un-gap-6
  >
    <div
      v-if="!embedded"
      un-flex
      un-items-baseline
      un-gap-3
      un-font-mono
      un-text="xs muted"
    >
      <button
        type="button"
        un-reach-hit
        un-m-0
        un-border-0
        un-bg-transparent
        un-p-1
        un-font-inherit
        un-text="muted hover:ink"
        un-cursor-pointer
        :disabled="monthIndex <= 0"
        aria-label="Previous month"
        @click="stepMonth(-1)"
      >
        ←
      </button>
      <p
        un-m-0
        un-min-w-28
        un-text-center
        un-tabular-nums
      >
        {{ monthLabel || 'no month' }}
        <span
          v-if="sheets.length"
          un-ml-2
          un-opacity-70
        >{{ sheets.length }}</span>
      </p>
      <button
        type="button"
        un-reach-hit
        un-m-0
        un-border-0
        un-bg-transparent
        un-p-1
        un-font-inherit
        un-text="muted hover:ink"
        un-cursor-pointer
        :disabled="monthIndex < 0 || monthIndex >= months.length - 1"
        aria-label="Next month"
        @click="stepMonth(1)"
      >
        →
      </button>
    </div>

    <p
      v-if="nowEmpty && !embedded"
      un-m-0
      un-font-mono
      un-text="xs muted"
    >
      {{ formatMonth(nowId) }} has no sheets. Showing the latest month.
    </p>

    <div
      class="month-folder__stage"
      un-relative
      un-w-full
      tabindex="0"
      :aria-label="`${monthLabel} fan`"
      @keydown="onKey"
      @wheel.prevent="onWheel"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
    >
      <p
        v-if="!sheets.length"
        un-relative
        un-z-3
        un-m-0
        un-font-serif
        un-text="muted"
        un-italic
      >
        No sheets in this month.
      </p>

      <IssuePeekCard
        v-for="(entry, index) in sheets"
        :key="entry.path"
        class="month-folder__sheet"
        :data-front="front === entry.path ? '' : undefined"
        :style="sheetStyle(index, entry)"
        :entry="entry"
        :flip="front === entry.path"
        :tilt="front === entry.path"
        @click.capture="onSheetPick(entry, $event)"
        @click.stop
      />
    </div>
  </div>
</template>

<style scoped>
.month-folder[data-embedded] {
  width: 100%;
  height: 100%;
  min-height: 28rem;
}

.month-folder__stage {
  width: 100%;
  max-width: 50.625rem;
  min-height: 28rem;
  outline: none;
  overflow: visible;
  overscroll-behavior: contain;
  touch-action: none;
}

.month-folder[data-embedded] .month-folder__stage {
  max-width: none;
  height: 100%;
}

.month-folder__sheet {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 16rem;
  max-width: none;
  margin: 0;
  font-size: 1rem;
  transform-origin: 50% 100%;
  opacity: 0;
  transition: transform var(--land-ms, 920ms) var(--ease-out);
}

.month-folder[data-inked] .month-folder__sheet[data-front] {
  opacity: 1;
}

.month-folder[data-posed] .month-folder__sheet {
  opacity: 1;
}

.month-folder[data-vertical] .month-folder__sheet {
  transform-origin: 50% 50%;
}

.month-folder__sheet :deep(.issue-peek-face) {
  background: var(--paper);
  backdrop-filter: none;
}

.month-folder:not([data-inked]) .month-folder__sheet,
.month-folder[data-inked]:not([data-armed]):not([data-posed]) .month-folder__sheet {
  transition: none;
}

.month-folder[data-inked]:not([data-armed]):not([data-posed]) .month-folder__sheet[data-front] {
  transition: opacity 420ms var(--ease-out);
}

.month-folder[data-scrub] .month-folder__sheet {
  transition: transform 80ms linear;
}

.month-folder[data-reduce] .month-folder__sheet {
  transition: none;
}

@media (prefers-reduced-motion: reduce) {
  .month-folder__sheet {
    transition: none;
  }
}
</style>
