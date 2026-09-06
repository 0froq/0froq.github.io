import { describe, expect, it } from 'vitest'
import { stickyCursorAim } from '../app/utils/stickyCursor'

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
})
