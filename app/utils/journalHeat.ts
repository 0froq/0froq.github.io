const DATE_KEY = /(\d{4})-(\d{2})-(\d{2})/

export const WHEEL_GRID_COLS = 7

export const HEAT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const

export const JOURNAL_DOODLES = [
  'star',
  'heart',
  'pin',
  'pencil',
  'bookmark',
  'quote',
  'flag',
  'notebook',
  'sticky-note',
  'leaf',
] as const

export type JournalDoodleName = typeof JOURNAL_DOODLES[number]

export function journalDayKey(created?: string): string | null {
  const match = created?.match(DATE_KEY)
  if (!match)
    return null
  return `${match[1]}-${match[2]}-${match[3]}`
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

export function journalEntriesByDay(items: LayerEntry[]): Map<string, LayerEntry[]> {
  const map = new Map<string, LayerEntry[]>()
  for (const item of items) {
    const key = journalDayKey(item.created)
    if (!key)
      continue
    const list = map.get(key)
    if (list)
      list.push(item)
    else
      map.set(key, [item])
  }
  return map
}

export function journalByDay(items: LayerEntry[]): Map<string, LayerEntry> {
  const map = new Map<string, LayerEntry>()
  for (const [key, list] of journalEntriesByDay(items)) {
    const first = list[0]
    if (first)
      map.set(key, first)
  }
  return map
}

function dayKinds(entries: LayerEntry[]): { journal: LayerEntry | null, log: LayerEntry | null } {
  let journal: LayerEntry | null = null
  let log: LayerEntry | null = null
  for (const entry of entries) {
    const kind = journalEntryKind(entry)
    if (kind === 'log' && !log)
      log = entry
    else if (kind === 'journal' && !journal)
      journal = entry
  }
  return { journal, log }
}

function civilStamp(year: number, month: number, day: number): number {
  return year * 10000 + (month + 1) * 100 + day
}

function todayStamp(now: Date): number {
  return civilStamp(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
}

export function utcDayKey(now = new Date()): string {
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`
}

function firstRecordMonth(byDay: Map<string, LayerEntry[]>): { year: number, month: number } | null {
  let year = Infinity
  let month = 11
  for (const key of byDay.keys()) {
    const y = Number(key.slice(0, 4))
    const m = Number(key.slice(5, 7)) - 1
    if (!Number.isFinite(y) || !Number.isFinite(m))
      continue
    if (y < year || (y === year && m < month)) {
      year = y
      month = m
    }
  }
  if (!Number.isFinite(year))
    return null
  return { year, month }
}

export function journalYearSpan(items: LayerEntry[], now = new Date()): number[] {
  const byDay = journalEntriesByDay(items)
  const first = firstRecordMonth(byDay)
  if (!first)
    return []
  const years: number[] = []
  for (let year = first.year; year <= now.getUTCFullYear(); year += 1)
    years.push(year)
  return years
}

function lastMonthForYear(year: number, now: Date): number {
  const nowYear = now.getUTCFullYear()
  if (year < nowYear)
    return 11
  if (year === nowYear)
    return now.getUTCMonth()
  return -1
}

export type JournalKind = 'journal' | 'log'

/** Frontmatter `kind` wins. Without it, a `log-` filename is a log and anything else is a journal entry. */
export function journalEntryKind(entry: LayerEntry): JournalKind {
  if (entry.kind === 'log' || entry.kind === 'journal')
    return entry.kind
  const stem = entry.path.split('/').pop() ?? ''
  return stem.startsWith('log') ? 'log' : 'journal'
}

export type JournalCellKind = JournalKind | 'split'

export interface JournalWheelCell {
  key: string
  day: number
  col: number
  weekIndex: number
  monthId: string
  rowId: string
  kind: JournalCellKind | null
  entry: LayerEntry | null
  journal: LayerEntry | null
  log: LayerEntry | null
  today: boolean
  future: boolean
}

export interface JournalWheelMonth {
  id: string
  year: number
  month: number
  label: string
  head: boolean
  gridRows: number
  cells: JournalWheelCell[]
}

const DAY_MS = 86400000

/** Monday-first weekday, 0–6 (UTC). */
function weekdayMon(year: number, month: number, day: number): number {
  return (new Date(Date.UTC(year, month, day)).getUTCDay() + 6) % 7
}

/** UTC timestamp of the Monday of the week containing this day. */
function mondayUtc(year: number, month: number, day: number): number {
  return Date.UTC(year, month, day) - weekdayMon(year, month, day) * DAY_MS
}

function monthIdOf(time: number): string {
  const d = new Date(time)
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}

export function journalWheel(items: LayerEntry[], now = new Date()): JournalWheelMonth[] {
  const byDay = journalEntriesByDay(items)
  const first = firstRecordMonth(byDay)
  if (!first)
    return []
  const years = journalYearSpan(items, now)
  if (!years.length)
    return []
  const start = civilStamp(first.year, first.month, 1)
  const today = todayStamp(now)
  const horizon = civilStamp(now.getUTCFullYear(), now.getUTCMonth(), daysInMonth(now.getUTCFullYear(), now.getUTCMonth()))
  interface Meta { id: string, year: number, month: number }
  const metas: Meta[] = []
  for (const year of years) {
    const begin = year === first.year ? first.month : 0
    const endMonth = lastMonthForYear(year, now)
    if (endMonth < 0 || begin > endMonth)
      continue
    for (let month = begin; month <= endMonth; month++)
      metas.push({ id: `${year}-${String(month + 1).padStart(2, '0')}`, year, month })
  }
  const metaIds = new Set(metas.map(m => m.id))

  // A week belongs to the month its Thursday falls in (ISO-style).
  // Boundary weeks whose owner month is not rendered fall back to the day's month.
  const weekSets = new Map<string, Set<number>>()
  for (const m of metas) {
    const span = daysInMonth(m.year, m.month)
    for (let day = 1; day <= span; day++) {
      const stamp = civilStamp(m.year, m.month, day)
      if (stamp < start || stamp > horizon)
        continue
      const mon = mondayUtc(m.year, m.month, day)
      const ownerId = monthIdOf(mon + 3 * DAY_MS)
      const target = metaIds.has(ownerId) ? ownerId : m.id
      let set = weekSets.get(target)
      if (!set) {
        set = new Set()
        weekSets.set(target, set)
      }
      set.add(mon)
    }
  }

  const rows: JournalWheelMonth[] = []
  for (const m of [...metas].reverse()) {
    const weeks = [...(weekSets.get(m.id) ?? [])].sort((a, b) => a - b)
    const n = weeks.length
    const cells: JournalWheelCell[] = []
    weeks.forEach((w, i) => {
      for (let col = 0; col < WHEEL_GRID_COLS; col++) {
        const time = w + col * DAY_MS
        const d = new Date(time)
        const year = d.getUTCFullYear()
        const month = d.getUTCMonth()
        const day = d.getUTCDate()
        const stamp = civilStamp(year, month, day)
        if (stamp < start || stamp > horizon)
          continue
        const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        const { journal, log } = dayKinds(byDay.get(key) ?? [])
        const split = Boolean(journal && log)
        const entry = journal ?? log
        const kind: JournalCellKind | null = split
          ? 'split'
          : log
            ? 'log'
            : journal
              ? 'journal'
              : null
        cells.push({
          key,
          day,
          col,
          weekIndex: i,
          monthId: monthIdOf(time),
          rowId: m.id,
          kind,
          entry,
          journal,
          log,
          today: stamp === today,
          future: stamp > today,
        })
      }
    })
    rows.push({
      id: m.id,
      year: m.year,
      month: m.month,
      label: HEAT_MONTHS[m.month]!,
      head: m.month === 11,
      gridRows: n,
      cells,
    })
  }
  return rows
}
