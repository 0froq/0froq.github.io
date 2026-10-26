import type { ComputedRef, InjectionKey, MaybeRefOrGetter, Ref } from 'vue'
import { toValue } from 'vue'
import { isRookEntry } from '~/utils/journalHeat'

const SETTLE_MS = 500

export interface JournalDeck {
  centerId: Ref<string | null>
  moving: Ref<boolean>
  monthItems: ComputedRef<LayerEntry[]>
  activeEntry: ComputedRef<LayerEntry | null>
  /** Entry chosen from the heatmap. Cleared once the fan reports a front. */
  focusPath: Ref<string | null>
  setCenter: (id: string | null) => void
  bump: () => void
  setActive: (entry: LayerEntry | null) => void
  focusEntry: (entry: LayerEntry) => void
}

const journalDeckKey: InjectionKey<JournalDeck> = Symbol('journal-deck')

export function provideJournalDeck(items: MaybeRefOrGetter<LayerEntry[]>) {
  const centerId = ref<string | null>(null)
  const moving = ref(false)
  const activePath = ref<string | null>(null)
  const focusPath = ref<string | null>(null)
  let timer: ReturnType<typeof setTimeout> | undefined
  let monthCache: LayerEntry[] = []
  let monthKey = ''

  const monthItems = computed(() => {
    const id = centerId.value
    if (!id) return []
    const next = toValue(items)
      .filter(item => journalDayKey(item.created)?.slice(0, 7) === id)
      .sort((a, b) => {
        const byDate = (a.created ?? '').localeCompare(b.created ?? '')
        if (byDate)
          return byDate
        return Number(isRookEntry(a)) - Number(isRookEntry(b))
      })
    const key = `${id}\0${next.map(item => item.path).join('\0')}`
    if (key === monthKey)
      return monthCache
    monthKey = key
    monthCache = next
    return next
  })

  const activeEntry = computed(() => {
    const list = monthItems.value
    if (!list.length) return null
    const hit = list.find(item => item.path === activePath.value)
    if (hit) return hit
    // A heatmap pick in another month must not wear each month the wheel passes.
    if (focusPath.value) return null
    return list.at(-1) ?? null
  })

  function setCenter(id: string | null) {
    centerId.value = id
  }

  function bump() {
    moving.value = true
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      moving.value = false
    }, SETTLE_MS)
  }

  function setActive(entry: LayerEntry | null) {
    activePath.value = entry?.path ?? null
    focusPath.value = null
  }

  function focusEntry(entry: LayerEntry) {
    activePath.value = entry.path
    focusPath.value = entry.path
  }

  const deck: JournalDeck = {
    centerId,
    moving,
    monthItems,
    activeEntry,
    focusPath,
    setCenter,
    bump,
    setActive,
    focusEntry,
  }
  provide(journalDeckKey, deck)
  onScopeDispose(() => {
    if (timer) clearTimeout(timer)
  })
  return deck
}

export function useJournalDeck() {
  return inject(journalDeckKey, null)
}
