import { describe, expect, it } from 'vitest'
import { inkCursorArrowParts } from '../app/utils/inkDraw'
import { stickyCursorAim, stickyRailInkAmount } from '../app/utils/stickyCursor'

describe('stickyCursorAim', () => {
  it('returns idle for empty targets', () => {
    expect(stickyCursorAim(null)).toBe('idle')
  })

  it('marks links and buttons hot', () => {
    const a = document.createElement('a')
    a.href = '/posts'
    document.body.append(a)
    expect(stickyCursorAim(a)).toBe('hot')
    a.remove()

    const btn = document.createElement('button')
    document.body.append(btn)
    expect(stickyCursorAim(btn)).toBe('hot')
    btn.remove()
  })

  it('keeps native cursor on fields and grab handles', () => {
    const input = document.createElement('input')
    document.body.append(input)
    expect(stickyCursorAim(input)).toBe('native')
    input.remove()

    const pin = document.createElement('div')
    pin.setAttribute('un-cursor', 'grab active:grabbing')
    document.body.append(pin)
    expect(stickyCursorAim(pin)).toBe('native')
    pin.remove()
  })

  it('lets native win over a wrapping link', () => {
    const a = document.createElement('a')
    a.href = '/'
    const field = document.createElement('textarea')
    a.append(field)
    document.body.append(a)
    expect(stickyCursorAim(field)).toBe('native')
    a.remove()
  })

  it('treats home rail links as ink, not hot', () => {
    const a = document.createElement('a')
    a.href = '/posts'
    a.setAttribute('data-rail-ink', '')
    document.body.append(a)
    expect(stickyCursorAim(a)).toBe('ink')
    a.remove()
  })
})

describe('inkCursorArrowParts', () => {
  it('returns a stable ink arrow for a given seed', () => {
    const a = inkCursorArrowParts('sticky-cursor')
    expect(a.head.startsWith('M')).toBe(true)
    expect(a.stem.startsWith('M')).toBe(true)
    expect(inkCursorArrowParts('sticky-cursor')).toEqual(a)
    expect(inkCursorArrowParts('other')).not.toEqual(a)
  })
})

describe('stickyRailInkAmount', () => {
  const box = { left: 0, top: 0, width: 100, height: 40 }

  it('maps underline and mark to horizontal progress', () => {
    expect(stickyRailInkAmount('underline', box, 0, 20, 0)).toBe(0)
    expect(stickyRailInkAmount('mark', box, 50, 20, 0)).toBe(0.5)
    expect(stickyRailInkAmount('underline', box, 100, 20, 0)).toBe(1)
  })

  it('maps circle to angle from the top, clockwise', () => {
    expect(stickyRailInkAmount('circle', box, 50, 0, 0)).toBe(0)
    expect(stickyRailInkAmount('circle', box, 100, 20, 0)).toBe(0.25)
  })
})
