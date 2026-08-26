export const STREAM_INTERVAL_MS = 18
export const STREAM_BREAK_MS = 280

const STREAM_SKIP_SELECTOR = [
  'script',
  'style',
  'svg',
  'code',
  'pre',
  'kbd',
  'button',
  'textarea',
  'input',
  'rt',
  'rp',
  'canvas',
  'noscript',
].join(',')

const STREAM_BLOCK_TAGS = new Set([
  'P',
  'H1',
  'H2',
  'H3',
  'H4',
  'H5',
  'H6',
  'LI',
  'DT',
  'DD',
  'BLOCKQUOTE',
  'PRE',
  'DIV',
  'SECTION',
  'ARTICLE',
  'HEADER',
  'FOOTER',
  'FIGCAPTION',
  'TR',
  'ADDRESS',
])

export function charsOf(value: string) {
  return Array.from(value)
}

export function prefersReducedStream() {
  return import.meta.client
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function isStreamBreakChar(ch: string | undefined) {
  return ch === '\n' || ch === '\r'
}

/** Delay before revealing `nextIndex`. Newlines and marked block starts wait longer. */
export function streamDelayMs(
  nextIndex: number,
  glyph: (index: number) => string | undefined,
  marked?: (index: number) => boolean,
  interval = STREAM_INTERVAL_MS,
  breakMs = STREAM_BREAK_MS,
) {
  if (marked?.(nextIndex) || isStreamBreakChar(glyph(nextIndex - 1)))
    return breakMs
  return interval
}

/** Wrap visible glyphs in `.stream-ch` spans. Whitespace-only nodes stay put. */
export function wrapStreamChars(root: HTMLElement): HTMLElement[] {
  const chars: HTMLElement[] = []
  let pendingBreak = false

  function appendGlyph(frag: DocumentFragment, ch: string) {
    const span = document.createElement('span')
    span.className = 'stream-ch'
    span.textContent = ch
    if (pendingBreak) {
      span.dataset.break = ''
      pendingBreak = false
    }
    frag.appendChild(span)
    chars.push(span)
  }

  function wrapText(node: Text) {
    const parent = node.parentElement
    if (!parent || parent.closest('.stream-ch, .stream-caret'))
      return
    if (parent.closest(STREAM_SKIP_SELECTOR))
      return
    if (!(node.nodeValue ?? '').trim())
      return
    const frag = document.createDocumentFragment()
    const raw = charsOf(node.nodeValue ?? '')
    for (let i = 0; i < raw.length; i++) {
      const ch = raw[i]!
      if (ch === '\r' && raw[i + 1] === '\n')
        continue
      if (isStreamBreakChar(ch)) {
        const prev = chars.at(-1)?.textContent ?? ''
        if (prev && !/\s/.test(prev))
          appendGlyph(frag, ' ')
        pendingBreak = true
        continue
      }
      appendGlyph(frag, ch)
    }
    if (frag.childNodes.length)
      node.parentNode?.replaceChild(frag, node)
  }

  function walk(node: Node) {
    if (node.nodeType === Node.TEXT_NODE) {
      wrapText(node as Text)
      return
    }
    if (node.nodeType !== Node.ELEMENT_NODE)
      return
    const el = node as HTMLElement
    if (el.closest('.stream-ch, .stream-caret'))
      return
    if (el.matches(STREAM_SKIP_SELECTOR))
      return
    if (el.tagName === 'BR') {
      pendingBreak = true
      return
    }
    if (el !== root && STREAM_BLOCK_TAGS.has(el.tagName) && chars.length > 0)
      pendingBreak = true
    for (const child of [...el.childNodes])
      walk(child)
  }

  walk(root)
  return chars
}
