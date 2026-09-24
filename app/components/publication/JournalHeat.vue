<script setup lang="ts">
import { drawRoughInk, eraseRoughInk } from '~/utils/roughInk'

const props = defineProps<{
  items: LayerEntry[]
}>()

const peek = usePublicationPeek()
const deck = useJournalDeck()
const fanDay = computed(() => {
  const created = deck?.activeEntry.value?.created
  return created ? journalDayKey(created) : null
})
/** Kind last shown on a day, so a circle keeps its color while it wipes. */
const dayIsLog = new Map<string, boolean>()
watch(
  () => deck?.activeEntry.value ?? null,
  (entry) => {
    const day = entry?.created ? journalDayKey(entry.created) : null
    if (!day || !entry)
      return
    dayIsLog.set(day, journalEntryKind(entry) === 'log')
  },
  { immediate: true },
)
const { pulse, reset } = useSiteChromeAway()
const scroller = ref<HTMLElement | null>(null)
const rowMap = new Map<string, HTMLElement>()
const ringMap = new Map<string, HTMLElement>()

function bindRow(id: string, el: unknown) {
  if (el instanceof HTMLElement)
    rowMap.set(id, el)
  else
    rowMap.delete(id)
}

function bindRing(day: string, el: unknown) {
  if (el instanceof HTMLElement) {
    ringMap.set(day, el)
    if (ringIsCurrent(day))
      nextTick(() => paintRing(day))
  }
  else {
    ringMap.delete(day)
  }
}

const centerId = ref<string | null>(null)
const away = reactive<Record<string, number>>({})
const weekOpacity = reactive<Record<string, number>>({})

const clock = ref(new Date())
const rows = computed(() => journalWheel(props.items, clock.value))
let dayTimer = 0
const centerRow = computed(() => rows.value.find(row => row.id === centerId.value) ?? null)
const currentYear = computed(() => centerRow.value?.year ?? null)
const yearDigits = computed(() => {
  const year = currentYear.value
  if (year == null)
    return []
  return String(year).padStart(4, '0').split('')
})
const yearRoll = ref<'fwd' | 'back'>('fwd')
watch(currentYear, (now, prev) => {
  if (now == null || prev == null || now === prev)
    return
  yearRoll.value = now > prev ? 'back' : 'fwd'
})

const pinned = ref<JournalWheelCell | null>(null)
const leaving = ref<JournalWheelCell[]>([])
/** Previous fan day, kept mounted until its circle finishes wiping. */
const fadingDay = ref<string | null>(null)
const LIVE_SPAN = 8

/** Clicked cell, but only while that entry is still the one in play. */
const heldPin = computed(() => {
  const pin = pinned.value
  const path = pin?.entry?.path
  if (!path)
    return null
  if (deck?.focusPath.value === path || deck?.activeEntry.value?.path === path)
    return pin
  return null
})

const liveMonths = computed(() => {
  const list = rows.value
  const ids = new Set<string>()
  if (!list.length)
    return ids
  const anchor = centerId.value ?? landingId() ?? list[0]!.id
  const index = Math.max(0, list.findIndex(row => row.id === anchor))
  const from = Math.max(0, index - LIVE_SPAN)
  const to = Math.min(list.length - 1, index + LIVE_SPAN)
  for (let i = from; i <= to; i++)
    ids.add(list[i]!.id)
  const pinnedRow = heldPin.value?.rowId
  if (pinnedRow)
    ids.add(pinnedRow)
  for (const cell of leaving.value)
    ids.add(cell.rowId)
  return ids
})

function ringIsCurrent(day: string) {
  return fanDay.value === day || heldPin.value?.key === day
}

function hasLiveRing(ring: HTMLElement) {
  return [...ring.querySelectorAll<SVGSVGElement>(':scope > .rough-ink')].some(svg =>
    svg.dataset.reveal !== 'exit' || svg.classList.contains('ink-boot'),
  )
}

function paintRing(day: string, retry = true) {
  if (!ringIsCurrent(day))
    return
  const ring = ringMap.get(day)
  if (!ring || hasLiveRing(ring))
    return
  const box = ring.getBoundingClientRect()
  if (box.width < 2 || box.height < 2) {
    if (retry)
      requestAnimationFrame(() => paintRing(day, false))
    return
  }
  drawRoughInk(ring)
}

function pinId(cell: JournalWheelCell | null) {
  return cell?.entry?.path ?? null
}

function showsRing(day: string) {
  return heldPin.value?.key === day
    || fadingDay.value === day
    || leaving.value.some(cell => cell.key === day)
    || fanDay.value === day
}

function ringIsLog(day: string) {
  if (fanDay.value === day) {
    const entry = deck?.activeEntry.value
    return !!entry && journalEntryKind(entry) === 'log'
  }
  const pin = heldPin.value
  if (pin?.key === day)
    return pin.kind === 'log'
  if (fadingDay.value === day || leaving.value.some(cell => cell.key === day))
    return dayIsLog.get(day) ?? false
  return false
}

function isPinnedEntry(entry: LayerEntry) {
  return heldPin.value?.entry?.path === entry.path
    || deck?.activeEntry.value?.path === entry.path
}

function cellFillClass(kind: JournalKind, entry: LayerEntry) {
  return [
    `wheel-cell--${kind}`,
    {
      'is-void': entry.status === 'void',
      'is-pinned': isPinnedEntry(entry),
    },
  ]
}

function cellMark(cell: JournalWheelCell) {
  return {
    'is-in-focus': cell.monthId === centerId.value,
    'is-fan-active': fanDay.value === cell.key,
    'is-today': cell.today,
    'is-future': cell.future,
  }
}

function cellStyle(cell: JournalWheelCell, row: JournalWheelMonth) {
  return {
    'gridColumn': String(cell.col + 1),
    'gridRow': String(row.gridRows - cell.weekIndex),
    '--scroll-opacity': String(weekOpacity[`${cell.rowId}:${cell.weekIndex}`] ?? 0.12),
  }
}

let splitHover: HTMLElement | null = null
let hoverPath = ''

function onEnter(entry: LayerEntry) {
  if (hoverPath === entry.path)
    return
  hoverPath = entry.path
  peek.hover(entry)
}

function clearSplitHover() {
  if (!splitHover)
    return
  delete splitHover.dataset.hover
  splitHover = null
}

function onLeave() {
  clearSplitHover()
  hoverPath = ''
  peek.leave()
}

function dismissPeek() {
  peek.dismiss()
  closePin()
}

function dropLeaving(day: string) {
  leaving.value = leaving.value.filter(cell => cell.key !== day)
}

function pin(cell: JournalWheelCell, entry: LayerEntry) {
  if (pinId(pinned.value) === entry.path)
    return
  const prev = pinned.value
  const next: JournalWheelCell = {
    ...cell,
    entry,
    kind: journalEntryKind(entry),
  }
  if (prev && prev.key !== cell.key)
    leaving.value = [...leaving.value.filter(item => item.key !== prev.key), prev]
  pinned.value = next
  deck?.focusEntry(entry)
  if (cell.rowId !== centerId.value)
    scrollIdIntoCenter(cell.rowId)
  else
    nextTick(() => paintRing(cell.key))
}

function closePin() {
  const prev = pinned.value
  if (!prev)
    return
  pinned.value = null
  if (fanDay.value === prev.key)
    return
  const wiping = fadingDay.value === prev.key
    || leaving.value.some(cell => cell.key === prev.key)
  if (!wiping)
    return
  leaving.value = [...leaving.value.filter(item => item.key !== prev.key), prev]
  const ring = ringMap.get(prev.key)
  const done = () => dropLeaving(prev.key)
  if (ring)
    void eraseRoughInk(ring).then(done)
  else
    window.setTimeout(done, 150)
}

function onCell(cell: JournalWheelCell, entry: LayerEntry, event: MouseEvent) {
  const result = peek.activate(entry, event)
  if (result === 'open' || result === 'pass')
    return
  void pin(cell, entry)
}

function splitEntry(cell: JournalWheelCell, event: MouseEvent) {
  const log = cell.log
  const journal = cell.journal
  if (!log || !journal)
    return cell.entry
  const root = event.currentTarget
  if (!(root instanceof HTMLElement))
    return log
  const rect = root.getBoundingClientRect()
  const x = (event.clientX - rect.left) / Math.max(rect.width, 1)
  const y = (event.clientY - rect.top) / Math.max(rect.height, 1)
  return x + y < 1 ? log : journal
}

function onSplitCell(cell: JournalWheelCell, event: MouseEvent) {
  const entry = splitEntry(cell, event)
  if (!entry)
    return
  onCell(cell, entry, event)
}

function onSplitMove(cell: JournalWheelCell, event: MouseEvent) {
  const entry = splitEntry(cell, event)
  if (!entry)
    return
  const root = event.currentTarget
  if (root instanceof HTMLElement) {
    const kind = journalEntryKind(entry)
    if (splitHover && splitHover !== root)
      delete splitHover.dataset.hover
    splitHover = root
    if (root.dataset.hover !== kind)
      root.dataset.hover = kind
  }
  onEnter(entry)
}

function wellMid(root: HTMLElement) {
  const padTop = Number.parseFloat(getComputedStyle(root).scrollPaddingTop) || 0
  const padBottom = Number.parseFloat(getComputedStyle(root).scrollPaddingBottom) || 0
  const rect = root.getBoundingClientRect()
  return rect.top + padTop + (root.clientHeight - padTop - padBottom) / 2
}

function measure() {
  const root = scroller.value
  if (!root)
    return
  const mid = wellMid(root)
  let bestId: string | null = null
  let bestDist = Infinity
  for (const row of rows.value) {
    const el = rowMap.get(row.id)
    if (!el)
      continue
    const rect = el.getBoundingClientRect()
    const cy = rect.top + rect.height / 2
    const dist = Math.abs(cy - mid)
    away[row.id] = Math.min(dist / Math.max(rect.height, 1), 4)
    const weekHeight = rect.height / row.gridRows
    for (let weekIndex = 0; weekIndex < row.gridRows; weekIndex++) {
      const weekCenter = rect.top + (row.gridRows - weekIndex - 0.5) * weekHeight
      const weekDist = Math.abs(weekCenter - mid)
      weekOpacity[`${row.id}:${weekIndex}`] = Math.max(0.12, 1 - weekDist / (root.clientHeight * 0.55))
    }
    if (dist < bestDist) {
      bestDist = dist
      bestId = row.id
    }
  }
  centerId.value = bestId
}

let glowCells = new Set<HTMLElement>()
let pointer: { x: number, y: number } | null = null
let glowFrame = 0
let glowLayoutDirty = true
const glowGrids: {
  el: HTMLElement
  radius: number
  cells: { el: HTMLElement, dx: number, dy: number }[]
}[] = []

function invalidateGlowLayout() {
  glowLayoutDirty = true
}

function ensureGlowLayout() {
  if (!glowLayoutDirty)
    return
  glowLayoutDirty = false
  glowGrids.length = 0
  const root = scroller.value
  if (!root)
    return
  for (const grid of root.querySelectorAll<HTMLElement>('.journal-wheel__grid')) {
    const cells = grid.querySelectorAll<HTMLElement>(':scope > .journal-wheel__cell')
    const first = cells[0]
    if (!first)
      continue
    const gridRect = grid.getBoundingClientRect()
    const cellRect = first.getBoundingClientRect()
    const packed: { el: HTMLElement, dx: number, dy: number }[] = []
    for (const cell of cells) {
      if (cell.classList.contains('is-future'))
        continue
      const rect = cell.getBoundingClientRect()
      packed.push({
        el: cell,
        dx: rect.left - gridRect.left + rect.width / 2,
        dy: rect.top - gridRect.top + rect.height / 2,
      })
    }
    glowGrids.push({
      el: grid,
      radius: Math.max(cellRect.width, cellRect.height) * 4,
      cells: packed,
    })
  }
}

function clearPointerGlow() {
  if (glowFrame)
    cancelAnimationFrame(glowFrame)
  for (const cell of glowCells)
    cell.style.removeProperty('--pointer-opacity')
  glowCells = new Set()
  pointer = null
  glowFrame = 0
}

function updatePointerGlow() {
  if (!pointer)
    return
  ensureGlowLayout()
  const nextCells = new Set<HTMLElement>()
  for (const grid of glowGrids) {
    const gridRect = grid.el.getBoundingClientRect()
    if (
      pointer.x < gridRect.left - grid.radius
      || pointer.x > gridRect.right + grid.radius
      || pointer.y < gridRect.top - grid.radius
      || pointer.y > gridRect.bottom + grid.radius
    ) {
      continue
    }
    for (const cell of grid.cells) {
      const distance = Math.hypot(
        pointer.x - (gridRect.left + cell.dx),
        pointer.y - (gridRect.top + cell.dy),
      )
      const opacity = Math.max(0, 1 - distance / grid.radius) ** 1.2
      if (opacity < 0.03)
        continue
      nextCells.add(cell.el)
      cell.el.style.setProperty('--pointer-opacity', String(opacity))
    }
  }
  for (const cell of glowCells) {
    if (!nextCells.has(cell))
      cell.style.removeProperty('--pointer-opacity')
  }
  glowCells = nextCells
}

function schedulePointerGlow() {
  if (glowFrame)
    return
  glowFrame = requestAnimationFrame(() => {
    glowFrame = 0
    updatePointerGlow()
  })
}

function onPointerMove(event: PointerEvent) {
  pointer = { x: event.clientX, y: event.clientY }
  schedulePointerGlow()
}

let primed = false
/** Month the current scroll gesture started on. Null between gestures. */
let gestureMonth: string | null = null
let gestureTimer: ReturnType<typeof setTimeout> | undefined

function onScroll() {
  gestureMonth ??= centerId.value
  if (primed)
    pulse()
  measure()
  // A click can nudge this scroller without leaving the month. Rebuilding the
  // fan is for a month change, not for every scroll event.
  const monthChanged = centerId.value !== gestureMonth
  if (monthChanged || deck?.moving.value)
    deck?.bump()
  clearTimeout(gestureTimer)
  gestureTimer = setTimeout(() => {
    gestureMonth = null
  }, 500)
  schedulePointerGlow()
}

watch(centerId, (id) => {
  deck?.setCenter(id)
})

watch(fanDay, (day, prev) => {
  if (prev && prev !== day)
    fadingDay.value = prev
})

watch(fanDay, async (day, prev) => {
  await nextTick()
  if (prev && prev !== day && !ringIsCurrent(prev)) {
    const old = ringMap.get(prev)
    const finish = () => {
      if (fadingDay.value === prev)
        fadingDay.value = null
      dropLeaving(prev)
      if (ringIsCurrent(prev))
        paintRing(prev)
    }
    if (old)
      void eraseRoughInk(old).then(finish)
    else
      finish()
  }
  if (day)
    paintRing(day)
}, { flush: 'post' })

function scrollIdIntoCenter(id: string) {
  const root = scroller.value
  const el = rowMap.get(id)
  if (!root || !el)
    return
  const delta = (el.getBoundingClientRect().top + el.getBoundingClientRect().height / 2) - wellMid(root)
  root.scrollTo({ top: root.scrollTop + delta, behavior: 'smooth' })
}

function landingId() {
  return rows.value.find(row => row.cells.some(cell => cell.today))?.id
    ?? rows.value.find(row => row.cells.some(cell => cell.entry))?.id
    ?? rows.value[0]?.id
    ?? null
}

function onKey(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    dismissPeek()
    return
  }
  if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp')
    return
  const list = rows.value
  if (!list.length)
    return
  event.preventDefault()
  const current = centerId.value ?? list[0]!.id
  const index = list.findIndex(row => row.id === current)
  const next = event.key === 'ArrowDown'
    ? Math.min(list.length - 1, index + 1)
    : Math.max(0, index - 1)
  scrollIdIntoCenter(list[next]!.id)
}

function onWinResize() {
  invalidateGlowLayout()
  measure()
}

onMounted(() => {
  const root = scroller.value
  root?.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onWinResize)
  let day = utcDayKey(clock.value)
  dayTimer = window.setInterval(() => {
    const next = utcDayKey()
    if (next !== day) {
      day = next
      clock.value = new Date()
    }
  }, 60_000)
  nextTick(() => {
    measure()
    const id = landingId()
    if (id)
      scrollIdIntoCenter(id)
    requestAnimationFrame(() => {
      primed = true
    })
  })
})

onUnmounted(() => {
  primed = false
  gestureMonth = null
  clearTimeout(gestureTimer)
  reset()
  window.clearInterval(dayTimer)
  scroller.value?.removeEventListener('scroll', onScroll)
  clearPointerGlow()
  window.removeEventListener('resize', onWinResize)
  if (glowFrame)
    cancelAnimationFrame(glowFrame)
})

watch(rows, () => {
  invalidateGlowLayout()
  nextTick(() => {
    measure()
    const id = landingId()
    if (id)
      scrollIdIntoCenter(id)
  })
})

watch(liveMonths, () => {
  invalidateGlowLayout()
}, { flush: 'post' })

watch(() => peek.pinned.value, (entry) => {
  if (!entry)
    closePin()
})
</script>

<template>
  <div
    v-if="!rows.length"
    un-font-serif
    un-text="muted"
    un-italic
  >
    Nothing visible here yet.
  </div>

  <div
    v-else
    class="journal-wheel-frame"
    un-relative
    un-h-full
    un-min-h-0
    un-w-full
    un-min-w-0
    un-md:w-max
    un-md:max-w-full
  >
    <div
      class="journal-wheel__years"
      un-absolute
      un-left-0
      un-z-2
      un-flex
      un-items-center
      un-justify-end
      un-pointer-events-none
      un-w="[4.15ch]"
      aria-hidden="true"
    >
      <span
        class="journal-wheel__year"
        un-flex
        un-items-center
        un-tabular-nums
        un-tracking-0
        un-text="ink"
        un-leading-none
      >
        <span
          v-for="(digit, index) in yearDigits"
          :key="index"
          class="journal-wheel__digit"
          un-relative
          un-block
          un-overflow-hidden
          un-w="[1ch]"
          un-h="[1em]"
        >
          <Transition :name="yearRoll === 'back' ? 'year-back' : 'year-fwd'">
            <span
              :key="digit"
              class="journal-wheel__glyph"
              un-block
              un-text-center
              un-w="[1ch]"
              un-leading-none
            >{{ digit }}</span>
          </Transition>
        </span>
      </span>
    </div>
    <div
      ref="scroller"
      class="journal-wheel"
      un-h-full
      un-overflow-y-auto
      un-outline-none
      tabindex="0"
      role="listbox"
      aria-label="Journal months"
      :aria-activedescendant="centerId ? `journal-month-${centerId}` : undefined"
      @keydown="onKey"
      @click="dismissPeek"
      @pointermove="onPointerMove"
      @pointerleave="clearPointerGlow"
    >
      <div class="journal-wheel__space" />
      <div
        class="journal-wheel__body"
        un-relative
      >
        <div
          v-for="row in rows"
          :id="`journal-month-${row.id}`"
          :key="row.id"
          :ref="(el) => bindRow(row.id, el)"
          class="journal-wheel__row"
          un-relative
          un-flex
          un-items-center
          un-gap-x-3
          un-max-md:gap-x-2
          un-overflow-visible
          un-text-line
          role="option"
          :aria-selected="row.id === centerId"
          :aria-label="`${row.label} ${row.year}`"
          :style="{ '--away': String(away[row.id] ?? 1), '--grid-rows': String(row.gridRows) }"
        >
          <span
            class="journal-wheel__slot"
            un-shrink-0
            un-w="[4.15ch]"
            aria-hidden="true"
          />
          <span
            class="journal-wheel__month"
            un-relative
            un-z-1
            un-flex
            un-items-center
            un-shrink-0
            un-overflow-visible
            un-uppercase
            un-tabular-nums
            un-tracking-0
            un-w="[3ch]"
          >{{ row.label }}</span>
          <div
            class="journal-wheel__grid"
            un-relative
            un-shrink-0
          >
            <template v-if="liveMonths.has(row.id)">
              <template
                v-for="cell in row.cells"
                :key="cell.key"
              >
                <div
                  v-if="cell.kind === 'split' && cell.log && cell.journal"
                  class="journal-wheel__cell is-entry is-split"
                  :class="{
                    ...cellMark(cell),
                    'is-pinned': heldPin?.key === cell.key || fanDay === cell.key,
                    'is-fan-active': fanDay === cell.key,
                  }"
                  :style="cellStyle(cell, row)"
                  @click.stop="onSplitCell(cell, $event)"
                  @pointermove="onSplitMove(cell, $event)"
                  @pointerleave="onLeave"
                >
                  <a
                    class="wheel-tri wheel-tri--log"
                    :class="cellFillClass('log', cell.log)"
                    :href="cell.log.path"
                    :aria-label="cell.log.title"
                    @click.stop="onCell(cell, cell.log, $event)"
                    @focus="onEnter(cell.log)"
                    @blur="onLeave"
                  />
                  <a
                    class="wheel-tri wheel-tri--journal"
                    :class="cellFillClass('journal', cell.journal)"
                    :href="cell.journal.path"
                    :aria-label="cell.journal.title"
                    @click.stop="onCell(cell, cell.journal, $event)"
                    @focus="onEnter(cell.journal)"
                    @blur="onLeave"
                  />
                  <InkWobbleBox
                    class="journal-wheel__sketch"
                    :seed="cell.key"
                    fill
                    split
                    :hatch="cell.today"
                  />
                  <span
                    v-if="showsRing(cell.key)"
                    :ref="(el) => bindRing(cell.key, el)"
                    class="journal-wheel__ring"
                    :class="{ 'is-log': ringIsLog(cell.key) }"
                    data-ink="circle"
                    :data-ink-seed="cell.key"
                    un-absolute
                    un-inset-0
                    un-pointer-events-none
                    aria-hidden="true"
                  />
                </div>
                <a
                  v-else-if="cell.entry && cell.kind && cell.kind !== 'split'"
                  class="journal-wheel__cell is-entry"
                  :class="[
                    ...cellFillClass(cell.kind, cell.entry),
                    cellMark(cell),
                  ]"
                  :style="cellStyle(cell, row)"
                  :href="cell.entry.path"
                  :aria-label="cell.entry.title"
                  @click.stop="onCell(cell, cell.entry, $event)"
                  @pointerenter="onEnter(cell.entry)"
                  @pointerleave="onLeave"
                  @focus="onEnter(cell.entry)"
                  @blur="onLeave"
                >
                  <InkWobbleBox
                    class="journal-wheel__sketch"
                    :seed="cell.key"
                    fill
                    :hatch="cell.today"
                  />
                  <span
                    v-if="showsRing(cell.key)"
                    :ref="(el) => bindRing(cell.key, el)"
                    class="journal-wheel__ring"
                    :class="{ 'is-log': ringIsLog(cell.key) }"
                    data-ink="circle"
                    :data-ink-seed="cell.key"
                    un-absolute
                    un-inset-0
                    un-pointer-events-none
                    aria-hidden="true"
                  />
                </a>
                <span
                  v-else
                  class="journal-wheel__cell is-empty"
                  :class="cellMark(cell)"
                  :style="cellStyle(cell, row)"
                  aria-hidden="true"
                >
                  <InkWobbleBox
                    class="journal-wheel__sketch"
                    :seed="cell.key"
                    :hatch="cell.today"
                  />
                </span>
              </template>
            </template>
          </div>
        </div>
      </div>
      <div class="journal-wheel__space" />
    </div>
  </div>
</template>

<style scoped>
.journal-wheel-frame {
  --wheel-cell: clamp(0.82rem, 3.6cqi, 2.05rem);
  --wheel-type: calc(var(--wheel-cell) * 3.85);
  --wheel-row: var(--wheel-type);
  --wheel-pad-top: var(--hub-pad-top, var(--site-chrome));
  --wheel-pad-bottom: var(--hub-pad-bottom, var(--site-footer));
  overflow-x: hidden;
  isolation: isolate;
  contain: paint;
  --uno: 'lg:[--wheel-cell:clamp(0.82rem,calc((100cqi-24rem-1rem)*0.04),2.05rem)]';
}

.journal-wheel__years,
.journal-wheel__row,
.journal-wheel__month {
  font-family: 'LXGW Bright Code TC', ui-monospace, monospace;
  font-size: var(--wheel-type);
  font-weight: 400;
}

.journal-wheel__row {
  min-height: calc(var(--grid-rows, 5) * var(--wheel-cell));
}

.journal-wheel__month {
  height: calc(var(--grid-rows, 5) * var(--wheel-cell));
  line-height: 1;
}

.journal-wheel__grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: repeat(var(--grid-rows, 5), 1fr);
  width: calc(var(--wheel-cell) * 7);
  height: calc(var(--grid-rows, 5) * var(--wheel-cell));
}

.year-fwd-enter-active,
.year-fwd-leave-active,
.year-back-enter-active,
.year-back-leave-active {
  position: absolute;
  top: 0;
  left: 0;
  width: 1ch;
  transition: transform 320ms var(--ease-out);
}

.year-fwd-enter-from {
  transform: translateY(110%);
}

.year-fwd-leave-to {
  transform: translateY(-110%);
}

.year-back-enter-from {
  transform: translateY(-110%);
}

.year-back-leave-to {
  transform: translateY(110%);
}

.journal-wheel__years {
  top: var(--wheel-pad-top);
  bottom: var(--wheel-pad-bottom);
}

.journal-wheel {
  overscroll-behavior: contain;
  scroll-snap-type: y mandatory;
  scroll-padding-top: var(--wheel-pad-top);
  scroll-padding-bottom: var(--wheel-pad-bottom);
  scrollbar-width: none;
  box-sizing: border-box;
  padding-right: 0.5rem;
  overflow-x: hidden;
}

.journal-wheel::-webkit-scrollbar {
  display: none;
}

.journal-wheel__space:first-child {
  height: calc((var(--wheel-pad-top) + 100% - var(--wheel-pad-bottom)) / 2 - var(--wheel-row) / 2);
  pointer-events: none;
}

.journal-wheel__space:last-child {
  height: calc((var(--wheel-pad-bottom) + 100% - var(--wheel-pad-top)) / 2 - var(--wheel-row) / 2);
  pointer-events: none;
}

.journal-wheel__row {
  z-index: calc(8 - min(var(--away, 1), 7));
  scroll-snap-align: center;
}

.journal-wheel__row[aria-selected='true'] {
  z-index: 12;
}

.journal-wheel__month {
  color: color-mix(
    in srgb,
    var(--ink) calc((0.08 + (1 - min(var(--away, 1), 2.4) / 2.4) * 0.92) * 100%),
    transparent
  );
  transform-origin: left center;
  transition: color 180ms var(--ease-out);
}

.journal-wheel__row[aria-selected='true'] .journal-wheel__month {
  color: var(--ink);
}

.journal-wheel__grid {
  opacity: 1;
}

.journal-wheel__cell {
  display: block;
  position: relative;
  overflow: visible;
  margin: 9%;
  border-radius: 1px;
  outline: none;
  font-size: var(--wheel-cell);
  color: var(--ink);
  opacity: max(calc(var(--scroll-opacity) * var(--cell-tone, 1)), calc(var(--pointer-opacity, 0) * 0.78));
}

.journal-wheel__cell :deep(.ink-wobble-stroke) {
  opacity: calc(0.42 + var(--pointer-opacity, 0) * 0.5);
}

.journal-wheel__cell.is-empty {
  --cell-tone: 0.08;
  background: transparent;
  pointer-events: none;
}

.journal-wheel__cell.is-empty.is-in-focus {
  --cell-tone: 0.28;
}

.journal-wheel__cell.is-future {
  pointer-events: none;
}

.journal-wheel__cell.is-empty.is-future,
.journal-wheel__cell.is-empty.is-in-focus.is-future {
  background: transparent;
  border: 0;
  --cell-tone: 0;
}

.journal-wheel__cell.is-entry.is-future {
  --cell-tone: 0.2;
}

.journal-wheel__cell.is-today {
  z-index: 3;
}

.journal-wheel__cell.is-empty.is-today {
  --cell-tone: 0.80;
  background-color: transparent;
}

.journal-wheel__cell.is-entry {
  --cell-fill: var(--colored-ink);
  background: transparent;
}

.journal-wheel__cell.is-split {
  --cell-fill-log: var(--ink);
  --cell-fill-journal: var(--colored-ink);
  background: transparent;
  cursor: pointer;
}

.wheel-tri {
  position: absolute;
  inset: 0;
  display: block;
  outline: none;
  pointer-events: none;
  background: transparent;
}

.wheel-tri--log {
  clip-path: polygon(0 0, 100% 0, 0 100%);
}

.wheel-tri--journal {
  clip-path: polygon(100% 0, 100% 100%, 0 100%);
}

.journal-wheel__cell.wheel-cell--log {
  --cell-fill: var(--ink);
  color: var(--ink);
  background: transparent;
}

.journal-wheel__cell.is-void {
  --cell-fill: var(--muted);
  color: var(--muted);
  background: transparent;
}

.journal-wheel__cell.is-entry:not(.is-split):hover :deep(.ink-wobble-fill),
.journal-wheel__cell.is-entry:not(.is-split):focus-visible :deep(.ink-wobble-fill),
.journal-wheel__cell.is-entry:not(.is-split).is-pinned :deep(.ink-wobble-fill) {
  fill-opacity: 0.72;
}

.journal-wheel__cell.is-split:has(.wheel-tri--journal.is-pinned) :deep(.ink-wobble-fill--journal),
.journal-wheel__cell.is-split[data-hover='journal'] :deep(.ink-wobble-fill--journal),
.journal-wheel__cell.is-split:has(.wheel-tri--journal:focus-visible) :deep(.ink-wobble-fill--journal) {
  fill-opacity: 0.72;
}

.journal-wheel__cell.is-split:has(.wheel-tri--log.is-pinned) :deep(.ink-wobble-fill--log),
.journal-wheel__cell.is-split[data-hover='log'] :deep(.ink-wobble-fill--log),
.journal-wheel__cell.is-split:has(.wheel-tri--log:focus-visible) :deep(.ink-wobble-fill--log) {
  fill-opacity: 0.72;
}

.journal-wheel__cell.is-pinned {
  z-index: 2;
}

.journal-wheel__ring {
  color: var(--colored-ink);
}

.journal-wheel__ring.is-log {
  color: var(--ink);
}

.journal-wheel__cell :deep(.rough-ink[data-kind='circle'] > path) {
  fill: currentColor;
}

@media (prefers-reduced-motion: reduce) {
  .journal-wheel__month,
  .journal-wheel__grid,
  .journal-wheel__cell,
  .year-fwd-enter-active,
  .year-fwd-leave-active,
  .year-back-enter-active,
  .year-back-leave-active {
    transition: none;
    animation: none;
  }
}
</style>
