import { describe, expect, it } from 'vitest'
import type { LayerEntry } from '../app/utils/issueList'
import {
  dayTargets,
  journalWheel,
  wheelBoxesOverlap,
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

function assertSeparate(targets: WheelTarget[]) {
  expect(targets.length).toBeGreaterThan(1)
  expect(wheelBoxesOverlap(targets.map(item => item.box))).toBe(false)
  for (const target of targets) {
    expect(target.box.w).toBeGreaterThan(0.8)
    expect(target.box.h).toBeGreaterThan(0.12)
    expect(target.box.h).toBeLessThan(0.7)
  }
  for (let index = 1; index < targets.length; index += 1) {
    expect(targets[index]!.box.y).toBeGreaterThan(
      targets[index - 1]!.box.y + targets[index - 1]!.box.h,
    )
  }
}

describe('dayTargets', () => {
  it('keeps a rook-only day as one full-cell reading', () => {
    const targets = dayTargets([entry('/journal/rook-20261023', 'rook', '尺子')])
    expect(roles(targets)).toEqual(['rook'])
    expect(targets[0]?.box).toEqual({ x: 0, y: 0, w: 1, h: 1 })
    expect(wheelRole(targets[0]!.entry)).toBe('rook')
  })

  it('stacks a log and a night note as two closed tiles', () => {
    const targets = dayTargets([
      entry('/journal/journal-20260531', 'journal', '夜记', '2026-05-31'),
      entry('/journal/log-20260531', 'log', '日志', '2026-05-31'),
    ])
    expect(roles(targets)).toEqual(['log', 'journal'])
    expect(paths(targets)).toEqual(['/journal/log-20260531', '/journal/journal-20260531'])
    assertSeparate(targets)
  })

  it('gives rook its own tile beside a log or a night entry', () => {
    const withLog = dayTargets([
      entry('/journal/rook-20261021', 'rook', '轮到你了', '2026-10-21'),
      entry('/journal/log-20261021', 'log', '日志', '2026-10-21'),
    ])
    expect(roles(withLog)).toEqual(['log', 'rook'])
    assertSeparate(withLog)

    const withJournal = dayTargets([
      entry('/journal/journal-20261022', 'journal', '夜记', '2026-10-22'),
      entry('/journal/rook-20261022', 'rook', '手抄本', '2026-10-22'),
    ])
    expect(roles(withJournal)).toEqual(['journal', 'rook'])
    assertSeparate(withJournal)
  })

  it('stacks log, night note, and rook as three separate tiles', () => {
    const targets = dayTargets([
      entry('/journal/rook-20261020', 'rook', '随笔'),
      entry('/journal/journal-20261020', 'journal', '夜记'),
      entry('/journal/log-20261020', 'log', '日志'),
    ])
    expect(paths(targets)).toEqual([
      '/journal/log-20261020',
      '/journal/journal-20261020',
      '/journal/rook-20261020',
    ])
    expect(roles(targets)).toEqual(['log', 'journal', 'rook'])
    assertSeparate(targets)
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
    assertSeparate(forward)
    expect(forward[0]?.entry.path).not.toBe(forward[1]?.entry.path)
    expect(forward[0]?.box.y).not.toBe(forward[1]?.box.y)
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
      '/journal/journal-20261020',
      '/journal/rook-20261020',
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
