import { describe, expect, it } from 'vitest'
import type { LayerEntry } from '../app/utils/issueList'
import {
  dayTargets,
  journalWheel,
  wheelPressShouldOpen,
  wheelRole,
  type WheelRole,
  type WheelTarget,
} from '../app/utils/journalHeat'

function entry(path: string, kind: string, title = path, created = '2026-10-20'): LayerEntry {
  return { path, title, created, kind }
}

function roles(targets: WheelTarget[]): WheelRole[] {
  return targets.map(item => item.role)
}

function paths(targets: WheelTarget[]): string[] {
  return targets.map(item => item.entry.path)
}

function contains(point: [number, number], polygon: [number, number][] | null): boolean {
  if (!polygon) return true
  const [x, y] = point
  let hit = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
    const xi = polygon[i]![0]
    const yi = polygon[i]![1]
    const xj = polygon[j]![0]
    const yj = polygon[j]![1]
    const crosses = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi + 0) + xi
    if (crosses) hit = !hit
  }
  return hit
}

function assertPartition(targets: WheelTarget[]) {
  expect(targets.length).toBeGreaterThan(1)
  const step = 0.05
  let owned = 0
  let shared = 0
  const counts = Array.from({ length: targets.length }, () => 0)
  for (let y = step / 2; y < 1; y += step) {
    for (let x = step / 2; x < 1; x += step) {
      const hits = targets
        .map((item, index) => (contains([x, y], item.polygon) ? index : -1))
        .filter(index => index >= 0)
      if (hits.length === 1) {
        owned += 1
        counts[hits[0]!] += 1
      } else if (hits.length > 1) shared += 1
    }
  }
  expect(owned).toBeGreaterThan(200)
  expect(shared).toBeLessThan(owned * 0.08)
  for (const count of counts) expect(count).toBeGreaterThan(40)
}

describe('dayTargets', () => {
  it('keeps a rook-only day as one full-cell reading', () => {
    const targets = dayTargets([entry('/journal/rook-20261023', 'rook', '尺子')])
    expect(roles(targets)).toEqual(['rook'])
    expect(targets[0]?.polygon).toBeNull()
    expect(wheelRole(targets[0]!.entry)).toBe('rook')
  })

  it('keeps the log and journal halves when there is no rook', () => {
    const targets = dayTargets([
      entry('/journal/journal-20260531', 'journal', '夜记', '2026-05-31'),
      entry('/journal/log-20260531', 'log', '日志', '2026-05-31'),
    ])
    expect(roles(targets)).toEqual(['log', 'journal'])
    expect(paths(targets)).toEqual(['/journal/log-20260531', '/journal/journal-20260531'])
    assertPartition(targets)
    expect(contains([0.1, 0.1], targets[0]!.polygon)).toBe(true)
    expect(contains([0.9, 0.9], targets[1]!.polygon)).toBe(true)
  })

  it('gives rook its own slice beside a log or a night entry', () => {
    const withLog = dayTargets([
      entry('/journal/rook-20261021', 'rook', '轮到你了', '2026-10-21'),
      entry('/journal/log-20261021', 'log', '日志', '2026-10-21'),
    ])
    expect(roles(withLog)).toEqual(['log', 'rook'])
    expect(contains([0.9, 0.9], withLog.find(item => item.role === 'log')!.polygon)).toBe(false)
    expect(contains([0.1, 0.1], withLog.find(item => item.role === 'log')!.polygon)).toBe(true)
    assertPartition(withLog)

    const withJournal = dayTargets([
      entry('/journal/journal-20261022', 'journal', '夜记', '2026-10-22'),
      entry('/journal/rook-20261022', 'rook', '手抄本', '2026-10-22'),
    ])
    expect(roles(withJournal)).toEqual(['rook', 'journal'])
    expect(contains([0.9, 0.9], withJournal.find(item => item.role === 'journal')!.polygon)).toBe(
      true,
    )
    assertPartition(withJournal)
  })

  it('splits one day into log, rook, and journal without dropping any', () => {
    const targets = dayTargets([
      entry('/journal/rook-20261020', 'rook', '随笔'),
      entry('/journal/journal-20261020', 'journal', '夜记'),
      entry('/journal/log-20261020', 'log', '日志'),
    ])
    expect(paths(targets)).toEqual([
      '/journal/log-20261020',
      '/journal/rook-20261020',
      '/journal/journal-20261020',
    ])
    expect(roles(targets)).toEqual(['log', 'rook', 'journal'])
    assertPartition(targets)
    expect(contains([0.08, 0.08], targets[0]!.polygon)).toBe(true)
    expect(contains([0.92, 0.92], targets[2]!.polygon)).toBe(true)
    expect(contains([0.5, 0.5], targets[1]!.polygon)).toBe(true)
  })

  it('keeps every same-day reading instead of the first of its kind', () => {
    const forward = dayTargets([
      entry('/journal/log-b', 'log', '后记'),
      entry('/journal/log-a', 'log', '前记'),
      entry('/journal/rook-b', 'rook', '乙'),
      entry('/journal/rook-a', 'rook', '甲'),
    ])
    const backward = dayTargets([...forward].reverse().map(item => item.entry))
    expect(paths(forward)).toEqual(paths(backward))
    expect(paths(forward)).toEqual([
      '/journal/log-a',
      '/journal/log-b',
      '/journal/rook-a',
      '/journal/rook-b',
    ])
    assertPartition(forward)
  })

  it('treats a rook filename as rook even when kind is missing', () => {
    const targets = dayTargets([entry('/journal/rook-20261024', '', '听仙乐')])
    expect(targets[0]?.role).toBe('rook')
  })
})

describe('journalWheel', () => {
  const now = new Date('2026-11-05T12:00:00Z')

  function cellOn(items: LayerEntry[], day: string) {
    const rows = journalWheel(items, now)
    for (const row of rows) {
      if ('fold' in row) continue
      const cell = row.cells.find(item => item.key === day)
      if (cell) return cell
    }
    return null
  }

  it('exposes mixed, rook-only, and plain days on the wheel', () => {
    const mixed = cellOn(
      [
        entry('/journal/log-20261020', 'log', '日志'),
        entry('/journal/journal-20261020', 'journal', '夜记'),
        entry('/journal/rook-20261020', 'rook', '随笔'),
        entry('/journal/rook-20261023', 'rook', '尺子', '2026-10-23'),
        entry('/journal/journal-20260531', 'journal', '旧夜', '2026-05-31'),
      ],
      '2026-10-20',
    )
    expect(paths(mixed?.targets ?? [])).toEqual([
      '/journal/log-20261020',
      '/journal/rook-20261020',
      '/journal/journal-20261020',
    ])
    const rookOnly = cellOn(
      [entry('/journal/rook-20261023', 'rook', '尺子', '2026-10-23')],
      '2026-10-23',
    )
    expect(rookOnly?.targets).toHaveLength(1)
    expect(rookOnly?.targets[0]?.role).toBe('rook')
    expect(rookOnly?.entry).toBeNull()
    const plain = cellOn(
      [entry('/journal/journal-20260531', 'journal', '旧夜', '2026-05-31')],
      '2026-05-31',
    )
    expect(plain?.targets).toHaveLength(1)
    expect(plain?.targets[0]?.role).toBe('journal')
    expect(plain?.rook).toBeNull()
  })
})

describe('wheelPressShouldOpen', () => {
  it('ignores a drag or a scroll and keeps a still tap', () => {
    expect(wheelPressShouldOpen(0, 0)).toBe(true)
    expect(wheelPressShouldOpen(8, 3)).toBe(true)
    expect(wheelPressShouldOpen(9, 0)).toBe(false)
    expect(wheelPressShouldOpen(0, 4)).toBe(false)
    expect(wheelPressShouldOpen(0, -4)).toBe(false)
  })
})
