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
/** Role last shown on a day, so a circle keeps its color while it wipes. */
const dayRole = new Map<string, WheelRole>()
watch(
  () => deck?.activeEntry.value ?? null,
  entry => {
    const day = entry?.created ? journalDayKey(entry.created) : null
    if (!day || !entry) return
    dayRole.set(day, wheelRole(entry))
  },
  { immediate: true },
)
const { pulse, reset } = useSiteChromeAway()
const scroller = ref<HTMLElement | null>(null)
const rowMap = new Map<string, HTMLElement>()
const ringMap = new Map<string, HTMLElement>()

function bindRow(id: string, el: unknown) {
  if (el instanceof HTMLElement) rowMap.set(id, el)
  else rowMap.delete(id)
}

function bindRing(day: string, el: unknown) {
  if (el instanceof HTMLElement) {
    ringMap.set(day, el)
    if (ringIsCurrent(day)) nextTick(() => paintRing(day))
  } else {
    ringMap.delete(day)
  }
}

const centerId = ref<string | null>(null)

const clock = ref(new Date())
const rows = computed(() => journalWheel(props.items, clock.value))
let dayTimer = 0
const centerRow = computed(() => {
  const row = rows.value.find(item => item.id === centerId.value)
  return row && !isJournalWheelFold(row) ? row : null
})
const currentYear = computed(() => centerRow.value?.year ?? null)
const yearDigits = computed(() => {
  const year = currentYear.value
  if (year == null) return []
  return String(year).padStart(4, '0').split('')
})
const yearRoll = ref<'fwd' | 'back'>('fwd')
watch(currentYear, (now, prev) => {
  if (now == null || prev == null || now === prev) return
  yearRoll.value = now > prev ? 'back' : 'fwd'
})

interface WheelPin {
  key: string
  rowId: string
  entry: LayerEntry
  role: WheelRole
}

const pinned = ref<WheelPin | null>(null)
const leaving = ref<WheelPin[]>([])
const hotPath = ref('')
const armedDay = ref<string | null>(null)
let pointerFocus = false
const coarse = ref(false)
if (import.meta.client) coarse.value = window.matchMedia('(pointer: coarse)').matches
const menu = ref({ left: 8, top: 8 })
const MOVE_PX = 8
/** Previous fan day, kept mounted until its circle finishes wiping. */
const fadingDay = ref<string | null>(null)
const LIVE_SPAN = 8

/** Clicked cell, but only while that entry is still the one in play. */
const heldPin = computed(() => {
  const pin = pinned.value
  const path = pin?.entry?.path
  if (!path) return null
  if (deck?.focusPath.value === path || deck?.activeEntry.value?.path === path) return pin
  return null
})

const liveMonths = computed(() => {
  const list = rows.value
  const ids = new Set<string>()
  if (!list.length) return ids
  const anchor = centerId.value ?? landingId() ?? list[0]!.id
  const index = Math.max(
    0,
    list.findIndex(row => row.id === anchor),
  )
  const from = Math.max(0, index - LIVE_SPAN)
  const to = Math.min(list.length - 1, index + LIVE_SPAN)
  for (let i = from; i <= to; i++) ids.add(list[i]!.id)
  const pinnedRow = heldPin.value?.rowId
  if (pinnedRow) ids.add(pinnedRow)
  for (const cell of leaving.value) ids.add(cell.rowId)
  return ids
})

function ringIsCurrent(day: string) {
  return fanDay.value === day || heldPin.value?.key === day
}

function hasLiveRing(ring: HTMLElement) {
  return [...ring.querySelectorAll<SVGSVGElement>(':scope > .rough-ink')].some(
    svg => svg.dataset.reveal !== 'exit' || svg.classList.contains('ink-boot'),
  )
}

function paintRing(day: string, retry = true) {
  if (!ringIsCurrent(day)) return
  const ring = ringMap.get(day)
  if (!ring || hasLiveRing(ring)) return
  const box = ring.getBoundingClientRect()
  if (box.width < 2 || box.height < 2) {
    if (retry) requestAnimationFrame(() => paintRing(day, false))
    return
  }
  drawRoughInk(ring)
}

function pinId(pin: WheelPin | null) {
  return pin?.entry.path ?? null
}

function showsRing(day: string) {
  return (
    heldPin.value?.key === day ||
    fadingDay.value === day ||
    leaving.value.some(cell => cell.key === day) ||
    fanDay.value === day
  )
}

function ringRole(day: string): WheelRole | null {
  if (fanDay.value === day) {
    const entry = deck?.activeEntry.value
    return entry ? wheelRole(entry) : null
  }
  const pin = heldPin.value
  if (pin?.key === day) return pin.role
  if (fadingDay.value === day || leaving.value.some(item => item.key === day))
    return dayRole.get(day) ?? null
  return null
}

function ringClass(day: string) {
  const role = ringRole(day)
  return {
    'is-log': role === 'log',
    'is-rook': role === 'rook',
  }
}

function isPinnedEntry(entry: LayerEntry) {
  return heldPin.value?.entry?.path === entry.path || deck?.activeEntry.value?.path === entry.path
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
    gridColumn: String(cell.col + 1),
    gridRow: String(row.gridRows - cell.weekIndex),
  }
}

let hoverPath = ''
let press = { x: 0, y: 0, top: 0, moved: false }

function onEnter(entry: LayerEntry) {
  hotPath.value = entry.path
  if (hoverPath === entry.path) return
  hoverPath = entry.path
  peek.hover(entry)
}

function onHitFocus(cell: JournalWheelCell, entry: LayerEntry, event: FocusEvent) {
  onEnter(entry)
  if (pointerFocus) return
  deck?.focusEntry(entry)
  if (!coarse.value || cell.targets.length < 2) return
  const el = event.currentTarget
  if (!(el instanceof HTMLElement)) return
  placeMenu(cell, el.closest('.journal-wheel__cell'))
}

function onLeave() {
  const active = document.activeElement
  if (active instanceof HTMLElement && active.closest('.journal-wheel__cell')?.contains(active)) {
    hoverPath = ''
    peek.leave()
    return
  }
  hotPath.value = ''
  hoverPath = ''
  peek.leave()
}

function onHitBlur(event: FocusEvent) {
  const next = event.relatedTarget
  const current = event.currentTarget
  if (!(current instanceof HTMLElement)) return
  const cell = current.closest('.journal-wheel__cell')
  if (next instanceof Node && cell?.contains(next)) return
  if (!armedDay.value) onLeave()
}

function dismissPeek() {
  peek.dismiss()
  closePin()
  armedDay.value = null
}

function dropLeaving(day: string) {
  leaving.value = leaving.value.filter(cell => cell.key !== day)
}

function pin(cell: JournalWheelCell, entry: LayerEntry) {
  if (pinId(pinned.value) === entry.path) return
  const prev = pinned.value
  const next: WheelPin = {
    key: cell.key,
    rowId: cell.rowId,
    entry,
    role: wheelRole(entry),
  }
  if (prev && prev.key !== cell.key)
    leaving.value = [...leaving.value.filter(item => item.key !== prev.key), prev]
  pinned.value = next
  deck?.focusEntry(entry)
  if (cell.rowId !== centerId.value) scrollIdIntoCenter(cell.rowId)
  else nextTick(() => paintRing(cell.key))
}

function closePin() {
  const prev = pinned.value
  if (!prev) return
  pinned.value = null
  if (fanDay.value === prev.key) return
  const wiping = fadingDay.value === prev.key || leaving.value.some(cell => cell.key === prev.key)
  if (!wiping) return
  leaving.value = [...leaving.value.filter(item => item.key !== prev.key), prev]
  const ring = ringMap.get(prev.key)
  const done = () => dropLeaving(prev.key)
  if (ring) void eraseRoughInk(ring).then(done)
  else window.setTimeout(done, 150)
}

function gestureMoved() {
  const root = scroller.value
  const movedPx = press.moved ? MOVE_PX + 1 : 0
  const scrollDelta = root ? root.scrollTop - press.top : 0
  return !wheelPressShouldOpen(movedPx, scrollDelta)
}

function onWindowSlide(event: PointerEvent) {
  const dx = event.clientX - press.x
  const dy = event.clientY - press.y
  if (dx * dx + dy * dy > MOVE_PX * MOVE_PX) press.moved = true
  const root = scroller.value
  if (root && Math.abs(root.scrollTop - press.top) > 3) press.moved = true
}

function onWindowEnd() {
  window.removeEventListener('pointermove', onWindowSlide)
  pointerFocus = false
}

function onHitDown(event: PointerEvent) {
  pointerFocus = true
  press = {
    x: event.clientX,
    y: event.clientY,
    top: scroller.value?.scrollTop ?? 0,
    moved: false,
  }
  window.addEventListener('pointermove', onWindowSlide)
  window.addEventListener('pointerup', onWindowEnd, { once: true })
  window.addEventListener('pointercancel', onWindowEnd, { once: true })
}

function onHitSlide(event: PointerEvent) {
  onWindowSlide(event)
}

function placeMenu(cell: JournalWheelCell, el: Element | null) {
  if (!(el instanceof HTMLElement)) return
  const rect = el.getBoundingClientRect()
  const width = 176
  const height = cell.targets.length * 44
  let left = rect.right + 10
  if (left + width > window.innerWidth - 8) left = Math.max(8, rect.left - width - 10)
  let top = rect.top - 4
  if (top + height > window.innerHeight - 12) top = Math.max(8, window.innerHeight - height - 12)
  menu.value = { left, top }
  armedDay.value = cell.key
}

function onCoarseArm(cell: JournalWheelCell, event: MouseEvent) {
  if (!coarse.value || cell.targets.length < 2 || armedDay.value === cell.key) return
  const dragged = event.detail > 0 && gestureMoved()
  press.moved = false
  if (dragged) return
  event.preventDefault()
  event.stopPropagation()
  placeMenu(cell, event.currentTarget instanceof Element ? event.currentTarget : null)
}

function onCell(cell: JournalWheelCell, entry: LayerEntry, event: MouseEvent) {
  const dragged = event.detail > 0 && gestureMoved()
  press.moved = false
  if (dragged) {
    event.preventDefault()
    event.stopPropagation()
    return
  }
  const result = peek.activate(entry, event)
  if (result === 'open' || result === 'pass') {
    armedDay.value = null
    return
  }
  void pin(cell, entry)
}

function wellMid(root: HTMLElement) {
  const padTop = Number.parseFloat(getComputedStyle(root).scrollPaddingTop) || 0
  const padBottom = Number.parseFloat(getComputedStyle(root).scrollPaddingBottom) || 0
  const rect = root.getBoundingClientRect()
  return rect.top + padTop + (root.clientHeight - padTop - padBottom) / 2
}

function measure() {
  const root = scroller.value
  if (!root) return
  const mid = wellMid(root)
  let bestId: string | null = null
  let bestDist = Infinity
  for (const row of rows.value) {
    if (isJournalWheelFold(row)) continue
    const el = rowMap.get(row.id)
    if (!el) continue
    const rect = el.getBoundingClientRect()
    const cy = rect.top + rect.height / 2
    const dist = Math.abs(cy - mid)
    if (dist < bestDist) {
      bestDist = dist
      bestId = row.id
    }
  }
  if (bestId !== centerId.value) centerId.value = bestId
  const activeIndex = rows.value.findIndex(row => row.id === bestId)
  if (activeIndex < 0) return
  for (const [index, row] of rows.value.entries()) {
    const node = rowMap.get(row.id)
    if (!node) continue
    const steps = Math.abs(index - activeIndex)
    const opacity = steps === 0 ? '1' : Math.max(0.16, 1 - steps * 0.28).toFixed(2)
    const away = Math.min(steps * 0.8, 2.4).toFixed(1)
    if (node.style.getPropertyValue('--scroll-opacity') !== opacity)
      node.style.setProperty('--scroll-opacity', opacity)
    if (node.style.getPropertyValue('--away') !== away) node.style.setProperty('--away', away)
  }
}

let primed = false
/** Month the current scroll gesture started on. Null between gestures. */
let gestureMonth: string | null = null
let gestureTimer: ReturnType<typeof setTimeout> | undefined
let lastCenterAt = 0

function paceCenter() {
  const now = performance.now()
  const root = scroller.value
  const fast = now - lastCenterAt < 180
  lastCenterAt = now
  if (!root) return
  if (fast) root.dataset.snap = ''
  else delete root.dataset.snap
}

function onScroll() {
  if (armedDay.value) armedDay.value = null
  gestureMonth ??= centerId.value
  if (primed) pulse()
  const prevCenter = centerId.value
  measure()
  if (centerId.value !== prevCenter) paceCenter()
  // A click can nudge this scroller without leaving the month. Rebuilding the
  // fan is for a month change, not for every scroll event.
  const monthChanged = centerId.value !== gestureMonth
  if (monthChanged || deck?.moving.value) deck?.bump()
  clearTimeout(gestureTimer)
  gestureTimer = setTimeout(() => {
    gestureMonth = null
    delete scroller.value?.dataset.snap
  }, 500)
}

watch(centerId, id => {
  deck?.setCenter(id)
})

watch(fanDay, (day, prev) => {
  if (prev && prev !== day) fadingDay.value = prev
})

watch(
  fanDay,
  async (day, prev) => {
    await nextTick()
    if (prev && prev !== day && !ringIsCurrent(prev)) {
      const old = ringMap.get(prev)
      const finish = () => {
        if (fadingDay.value === prev) fadingDay.value = null
        dropLeaving(prev)
        if (ringIsCurrent(prev)) paintRing(prev)
      }
      if (old) void eraseRoughInk(old).then(finish)
      else finish()
    }
    if (day) paintRing(day)
  },
  { flush: 'post' },
)

function scrollIdIntoCenter(id: string) {
  const root = scroller.value
  const el = rowMap.get(id)
  if (!root || !el) return
  const delta =
    el.getBoundingClientRect().top + el.getBoundingClientRect().height / 2 - wellMid(root)
  root.scrollTo({ top: root.scrollTop + delta, behavior: 'smooth' })
}

function monthRows(): JournalWheelMonth[] {
  return rows.value.filter((row): row is JournalWheelMonth => !isJournalWheelFold(row))
}

function landingId() {
  const months = monthRows()
  return (
    months.find(row => row.cells.some(cell => cell.today))?.id ??
    months.find(row => row.cells.some(cell => cell.targets.length))?.id ??
    months[0]?.id ??
    null
  )
}

function onKey(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    dismissPeek()
    return
  }
  if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
  const list = rows.value
  if (!list.length) return
  event.preventDefault()
  const current = centerId.value ?? list[0]!.id
  const index = list.findIndex(row => row.id === current)
  const dir = event.key === 'ArrowDown' ? 1 : -1
  let next = index
  while (next + dir >= 0 && next + dir < list.length) {
    next += dir
    if (!isJournalWheelFold(list[next]!)) break
  }
  if (isJournalWheelFold(list[next]!)) return
  scrollIdIntoCenter(list[next]!.id)
}

function onWinResize() {
  measure()
}

function cellClass(cell: JournalWheelCell) {
  const only = cell.targets.length === 1 ? cell.targets[0] : null
  return {
    ...cellMark(cell),
    'is-entry': cell.targets.some(item => item.role !== 'rook'),
    'is-split': cell.targets.length > 1,
    'is-rook': only?.role === 'rook',
    'has-rook': cell.targets.some(item => item.role === 'rook'),
    'is-armed': armedDay.value === cell.key,
    'is-pinned':
      heldPin.value?.key === cell.key ||
      fanDay.value === cell.key ||
      cell.targets.some(item => isPinnedEntry(item.entry)),
  }
}

function inkSlices(cell: JournalWheelCell): WheelInkSlice[] {
  return cell.targets.map(target => ({
    role: target.role,
    points: wheelPoints(target.polygon),
    hot: hotPath.value === target.entry.path,
    pinned: isPinnedEntry(target.entry),
    voided: target.entry.status === 'void',
  }))
}

function hitStyle(cell: JournalWheelCell, target: WheelTarget, index: number) {
  if (coarse.value && armedDay.value === cell.key && cell.targets.length > 1) {
    return {
      position: 'fixed' as const,
      left: `${menu.value.left}px`,
      top: `${menu.value.top + index * 44}px`,
      right: 'auto' as const,
      bottom: 'auto' as const,
      width: '11rem',
      height: '2.75rem',
      zIndex: 30,
      clipPath: 'none',
    }
  }
  const clip = wheelClip(target.polygon)
  return clip ? { clipPath: clip } : undefined
}

let coarseQuery: MediaQueryList | null = null

function syncCoarse() {
  coarse.value = coarseQuery?.matches ?? false
}

onMounted(() => {
  coarseQuery = window.matchMedia('(pointer: coarse)')
  syncCoarse()
  coarseQuery.addEventListener('change', syncCoarse)
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
    if (id) scrollIdIntoCenter(id)
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
  window.removeEventListener('resize', onWinResize)
  coarseQuery?.removeEventListener('change', syncCoarse)
  window.removeEventListener('pointermove', onWindowSlide)
})

watch(rows, () => {
  nextTick(() => {
    measure()
    const id = landingId()
    if (id) scrollIdIntoCenter(id)
  })
})

watch(
  () => peek.pinned.value,
  entry => {
    if (!entry) closePin()
  },
)
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
              >{{ digit }}</span
            >
          </Transition>
        </span>
      </span>
    </div>
    <div
      ref="scroller"
      class="journal-wheel"
      :data-coarse="coarse ? '' : undefined"
      un-h-full
      un-overflow-y-auto
      un-outline-none
      tabindex="0"
      role="listbox"
      aria-label="Journal months"
      :aria-activedescendant="centerId ? `journal-month-${centerId}` : undefined"
      @keydown="onKey"
      @click="dismissPeek"
    >
      <div class="journal-wheel__space" />
      <div
        class="journal-wheel__body"
        un-relative
      >
        <template
          v-for="row in rows"
          :key="row.id"
        >
          <div
            v-if="isJournalWheelFold(row)"
            :id="`journal-month-${row.id}`"
            :ref="el => bindRow(row.id, el)"
            class="journal-wheel__fold"
            un-flex
            un-items-center
            un-gap-x-3
            un-max-md:gap-x-2
            role="presentation"
            :aria-label="`${row.hidden} months hidden, ${row.fromLabel} to ${row.toLabel}`"
          >
            <span
              class="journal-wheel__slot"
              un-shrink-0
              un-w="[4.15ch]"
              aria-hidden="true"
            />
            <span
              class="journal-wheel__fold-mark"
              aria-hidden="true"
              ><span>···</span></span
            >
            <span
              class="journal-wheel__fold-rule"
              aria-hidden="true"
            >
              <span>{{ row.hidden }} mo</span>
            </span>
          </div>
          <div
            v-else
            :id="`journal-month-${row.id}`"
            :ref="el => bindRow(row.id, el)"
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
            :style="{ '--grid-rows': String(row.gridRows) }"
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
              >{{ row.label }}</span
            >
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
                    v-if="cell.targets.length"
                    class="journal-wheel__cell"
                    :class="cellClass(cell)"
                    :style="cellStyle(cell, row)"
                    :data-day="cell.key"
                    @click.stop="onCoarseArm(cell, $event)"
                    @pointerleave="onLeave"
                  >
                    <a
                      v-for="(target, index) in cell.targets"
                      :key="target.entry.path"
                      class="wheel-hit"
                      :class="{ 'is-pinned': isPinnedEntry(target.entry) }"
                      :style="hitStyle(cell, target, index)"
                      :href="target.entry.path"
                      :aria-label="wheelTargetName(target, cell.targets)"
                      :aria-current="isPinnedEntry(target.entry) ? 'true' : undefined"
                      :data-role="target.role"
                      @pointerdown="onHitDown"
                      @pointermove="onHitSlide"
                      @click.stop="onCell(cell, target.entry, $event)"
                      @pointerenter="onEnter(target.entry)"
                      @focus="onHitFocus(cell, target.entry, $event)"
                      @blur="onHitBlur"
                    >
                      <span class="wheel-hit__label">
                        <span
                          class="wheel-hit__swatch"
                          :data-role="target.role"
                          aria-hidden="true"
                        />
                        <span class="wheel-hit__name">{{
                          wheelShortLabel(target, cell.targets)
                        }}</span>
                      </span>
                    </a>
                    <InkWobbleBox
                      class="journal-wheel__sketch"
                      :seed="cell.key"
                      :slices="inkSlices(cell)"
                      :mark="cell.today"
                    />
                    <span
                      v-if="showsRing(cell.key)"
                      :ref="el => bindRing(cell.key, el)"
                      class="journal-wheel__ring"
                      :class="ringClass(cell.key)"
                      data-ink="circle"
                      :data-ink-seed="cell.key"
                      un-absolute
                      un-inset-0
                      un-pointer-events-none
                      aria-hidden="true"
                    />
                  </div>
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
                      :mark="cell.today"
                    />
                  </span>
                </template>
              </template>
            </div>
          </div>
        </template>
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
  /* Day rings draw past the cell. Size the inset from the cell so the
     rightmost column keeps its full circle. */
  padding-right: calc(var(--wheel-cell) * 0.7);
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
  z-index: 1;
  scroll-snap-align: center;
  transition:
    --scroll-opacity 180ms var(--ease-out),
    --away 180ms var(--ease-out);
}

.journal-wheel__row[aria-selected='true'] {
  z-index: 12;
}

.journal-wheel__fold {
  min-height: calc(var(--wheel-cell) * 1.6);
  font-family: 'LXGW Bright Code TC', ui-monospace, monospace;
  font-size: var(--wheel-type);
  opacity: var(--scroll-opacity, 0.12);
  transition: --scroll-opacity 180ms var(--ease-out);
}

.journal-wheel__fold-mark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3ch;
  flex-shrink: 0;
}

.journal-wheel__fold-mark span {
  color: var(--ink);
  letter-spacing: 0.18em;
  line-height: 1;
  font-size: calc(var(--wheel-cell) * 1.15);
}

.journal-wheel__fold-rule {
  display: flex;
  align-items: center;
  width: calc(var(--wheel-cell) * 7);
  flex-shrink: 0;
  color: var(--ink);
  font-size: calc(var(--wheel-cell) * 0.85);
  font-variant-numeric: tabular-nums;
}

.journal-wheel__fold-rule::before,
.journal-wheel__fold-rule::after {
  content: '';
  flex: 1;
  border-top: 1.5px dashed var(--ink);
}

.journal-wheel__fold-rule span {
  padding-inline: 0.45rem;
}

.journal-wheel[data-snap] .journal-wheel__row {
  transition: none;
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
  opacity: calc(var(--scroll-opacity, 0.12) * var(--cell-tone, 1));
}

.journal-wheel__cell :deep(.ink-wobble-stroke) {
  opacity: 0.42;
}

.journal-wheel__cell :deep(.ink-wobble-fill) {
  fill-opacity: calc(0.12 + var(--scroll-opacity, 0.12) * 0.24);
}

.journal-wheel__cell :deep(.ink-wobble-hatch) {
  opacity: calc(0.15 + var(--scroll-opacity, 0.12) * 0.4);
}

.journal-wheel__cell.is-split :deep(.ink-wobble-hatch) {
  opacity: 0.82;
}

.journal-wheel__cell :deep(.ink-wobble-hatch.is-hot),
.journal-wheel__cell :deep(.ink-wobble-hatch.is-pinned),
.journal-wheel__cell.is-rook:hover :deep(.ink-wobble-hatch),
.journal-wheel__cell.is-rook:focus-within :deep(.ink-wobble-hatch) {
  opacity: 0.95;
}

.journal-wheel__cell.is-rook:hover :deep(.ink-wobble-stroke),
.journal-wheel__cell.is-rook:focus-within :deep(.ink-wobble-stroke),
.journal-wheel__cell.is-rook.is-pinned :deep(.ink-wobble-stroke) {
  opacity: 0.85;
}

.journal-wheel__cell.is-empty {
  --cell-tone: 0.08;
  background: transparent;
  pointer-events: none;
}

.journal-wheel__cell.is-rook {
  --cell-tone: 0.72;
  cursor: pointer;
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
  --cell-tone: 0.8;
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

.wheel-hit {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: block;
  outline: none;
  background: transparent;
  color: var(--ink);
  text-decoration: none;
}

.wheel-hit__label,
.wheel-hit__name {
  display: none;
}

.wheel-hit:focus-visible {
  outline: none;
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
.journal-wheel__cell.is-entry:not(.is-split):focus-within :deep(.ink-wobble-fill),
.journal-wheel__cell.is-entry:not(.is-split).is-pinned :deep(.ink-wobble-fill),
.journal-wheel__cell :deep(.ink-wobble-fill.is-hot),
.journal-wheel__cell :deep(.ink-wobble-fill.is-pinned) {
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

.journal-wheel__ring.is-rook {
  color: var(--wry);
}

@media (pointer: coarse) {
  .journal-wheel__cell.is-split:not(.is-armed) .wheel-hit {
    pointer-events: none;
  }

  .journal-wheel__cell.is-armed .wheel-hit {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding-inline: 0.75rem;
    background: var(--paper);
    border: 1px solid var(--line);
    font-family: 'LXGW Bright Code TC', ui-monospace, monospace;
    font-size: 0.85rem;
  }

  .journal-wheel__cell.is-armed .wheel-hit.is-pinned,
  .journal-wheel__cell.is-armed .wheel-hit:focus-visible {
    border-color: var(--colored-ink);
    outline: 2px solid var(--colored-ink);
    outline-offset: 2px;
  }

  .journal-wheel__cell.is-armed .wheel-hit__label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-width: 0;
  }

  .journal-wheel__cell.is-armed .wheel-hit__name {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .wheel-hit__swatch {
    width: 0.7rem;
    height: 0.7rem;
    flex: none;
    border: 1px solid var(--ink);
  }

  .wheel-hit__swatch[data-role='log'] {
    background: var(--ink);
  }

  .wheel-hit__swatch[data-role='journal'] {
    background: var(--colored-ink);
  }

  .wheel-hit__swatch[data-role='rook'] {
    background: repeating-linear-gradient(135deg, transparent 0 2px, var(--ink) 2px 3px);
  }
}

.journal-wheel__cell :deep(.rough-ink[data-kind='circle'] > path) {
  fill: currentColor;
}

@media (prefers-reduced-motion: reduce) {
  .journal-wheel__month,
  .journal-wheel__grid,
  .journal-wheel__row,
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

<style>
@property --scroll-opacity {
  syntax: '<number>';
  inherits: true;
  initial-value: 0.12;
}

@property --away {
  syntax: '<number>';
  inherits: true;
  initial-value: 1;
}
</style>
