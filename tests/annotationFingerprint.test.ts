import type { AnnotationAnchor } from '~/types/annotation'
import { describe, expect, it } from 'vitest'
import { computeAnchor, findAnchorInDOM } from '~/utils/annotationFingerprint'

function makeContent(html: string): HTMLElement {
  const root = document.createElement('div')
  root.id = 'content'
  root.innerHTML = html
  document.body.appendChild(root)
  return root
}

describe('annotationFingerprint', () => {
  it('computeAnchor + findAnchorInDOM round-trip exact match', () => {
    const content = makeContent('<p>Hello world, this is a test paragraph.</p>')
    const p = content.querySelector('p')!
    const textNode = p.firstChild as Text

    const range = document.createRange()
    range.setStart(textNode, 6)
    range.setEnd(textNode, 11)

    const sel = window.getSelection()!
    sel.removeAllRanges()
    sel.addRange(range)

    const anchor = computeAnchor(sel)
    expect(anchor).not.toBeNull()
    expect(anchor!.selected).toBe('world')

    const match = findAnchorInDOM(content, anchor as AnnotationAnchor)
    expect(match.reason).toBe('exact')
    expect(match.range).not.toBeNull()
    expect(match.range!.toString()).toBe('world')

    content.remove()
  })

  it('returns selected-missing when selected text gone', () => {
    const content = makeContent('<p>Hello world</p>')
    const anchor: AnnotationAnchor = {
      selected: 'missing-token',
      prefix: 'Hello ',
      suffix: '',
      occurrence: 1,
    }
    const match = findAnchorInDOM(content, anchor)
    expect(match.reason).toBe('selected-missing')
    expect(match.range).toBeNull()
    content.remove()
  })

  it('approximate when prefix/suffix drift but selected remains', () => {
    const content = makeContent('<p>xx Hello world yy</p>')
    const anchor: AnnotationAnchor = {
      selected: 'world',
      prefix: 'AAA Hello ',
      suffix: ' BBB',
      occurrence: 1,
    }
    const match = findAnchorInDOM(content, anchor)
    expect(['approximate', 'ambiguous']).toContain(match.reason)
    content.remove()
  })
})
