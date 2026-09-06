import type { Options } from 'roughjs/bin/core'
import rough from 'roughjs'
import { hashSeed, inkRng } from '~/utils/inkDraw'

export type InkKind = 'underline' | 'mark' | 'strike' | 'circle'

interface LineBox {
  x: number
  y: number
  w: number
  h: number
}

const NS = 'http://www.w3.org/2000/svg'
const SVG_CLASS = 'rough-ink'
const ITALIC_RE = /italic|oblique/
const KINDS: readonly InkKind[] = ['underline', 'mark', 'strike', 'circle']
const PAD: Record<InkKind, readonly [number, number]> = {
  circle: [0.55, 0.55],
  mark: [0.55, 0.72],
  underline: [0.42, 0.42],
  strike: [0.16, 0.14],
}

export const INK_SELECTOR = [
  '[data-ink]',
  '[data-hover-ink]',
  ':is(.prose, [un-prose], .scrap-md) :is(u, mark, s, del)',
].join(',')

function parseKind(value: string | undefined): InkKind | undefined {
  return KINDS.find(kind => kind === value)
}

function liveInkOf(el: HTMLElement): InkKind | undefined {
  const fromData = parseKind(el.dataset.ink)
  if (fromData)
    return fromData
  switch (el.tagName) {
    case 'MARK':
      return 'mark'
    case 'S':
    case 'DEL':
      return 'strike'
    case 'U':
      return 'underline'
  }
}

function hoverInkOf(el: HTMLElement): InkKind | undefined {
  return parseKind(el.dataset.hoverInk)
}

function inksOf(el: HTMLElement): { live?: InkKind, hover?: InkKind, kinds: InkKind[] } {
  const live = liveInkOf(el)
  const hover = hoverInkOf(el)
  if (hover && live && hover !== live)
    return { live, hover, kinds: [hover, live] }
  if (hover && !live)
    return { hover, kinds: [hover] }
  if (live)
    return { live, hover, kinds: [live] }
  return { kinds: [] }
}

function canPaint(el: HTMLElement): boolean {
  if (!el.isConnected)
    return false
  if (el.tagName === 'A') {
    const href = el.getAttribute('href') || ''
    if (href.startsWith('#') && el.closest('h1, h2, h3, h4, h5, h6'))
      return false
    if (!(el.textContent || '').trim())
      return false
  }
  return true
}

function catmullCurves(pts: Array<[number, number]>): string {
  if (pts.length < 2)
    return ''
  if (pts.length === 2) {
    return `L${pts[1]![0].toFixed(2)} ${pts[1]![1].toFixed(2)}`
  }

  let d = ''
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i === 0 ? 0 : i - 1]!
    const p1 = pts[i]!
    const p2 = pts[i + 1]!
    const p3 = pts[i + 2] ?? p2
    const c1x = p1[0] + (p2[0] - p0[0]) / 6
    const c1y = p1[1] + (p2[1] - p0[1]) / 6
    const c2x = p2[0] - (p3[0] - p1[0]) / 6
    const c2y = p2[1] - (p3[1] - p1[1]) / 6
    d += ` C${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`
  }
  return d
}

function catmullRom(pts: Array<[number, number]>): string {
  if (pts.length < 2)
    return ''
  return `M${pts[0]![0].toFixed(2)} ${pts[0]![1].toFixed(2)}${catmullCurves(pts)}`
}

function catmullRomClosed(pts: Array<[number, number]>): string {
  if (pts.length < 3)
    return catmullRom(pts)
  const n = pts.length
  let d = `M${pts[0]![0].toFixed(2)} ${pts[0]![1].toFixed(2)}`
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n]!
    const p1 = pts[i]!
    const p2 = pts[(i + 1) % n]!
    const p3 = pts[(i + 2) % n]!
    const c1x = p1[0] + (p2[0] - p0[0]) / 6
    const c1y = p1[1] + (p2[1] - p0[1]) / 6
    const c2x = p2[0] - (p3[0] - p1[0]) / 6
    const c2y = p2[1] - (p3[1] - p1[1]) / 6
    d += ` C${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`
  }
  return `${d}Z`
}

function tangentAt(pts: Array<[number, number]>, i: number): [number, number] {
  const a = pts[Math.max(0, i - 1)]!
  const b = pts[Math.min(pts.length - 1, i + 1)]!
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const len = Math.hypot(dx, dy) || 1
  return [dx / len, dy / len]
}

function normalAt(pts: Array<[number, number]>, i: number): [number, number] {
  const [tx, ty] = tangentAt(pts, i)
  return [-ty, tx]
}

let metricsCanvas: HTMLCanvasElement | undefined

interface FontBoxes {
  fontAscent: number
  fontDescent: number
  capAscent: number
}

function fontBoxes(el: HTMLElement): FontBoxes {
  metricsCanvas ??= document.createElement('canvas')
  const ctx = metricsCanvas.getContext('2d')
  if (!ctx) {
    const em = Number.parseFloat(getComputedStyle(el).fontSize) || 16
    return { fontAscent: em * 0.8, fontDescent: em * 0.2, capAscent: em * 0.7 }
  }
  ctx.font = getComputedStyle(el).font
  const cap = ctx.measureText('H')
  const fontAscent = cap.fontBoundingBoxAscent || cap.actualBoundingBoxAscent || 0
  const fontDescent = cap.fontBoundingBoxDescent || cap.actualBoundingBoxDescent || 0
  const capAscent = cap.actualBoundingBoxAscent || fontAscent
  return { fontAscent, fontDescent, capAscent }
}

function inkMidY(yLine: number, lineH: number, boxes: FontBoxes, capFrac: number): number {
  const content = boxes.fontAscent + boxes.fontDescent
  const baseline = yLine + (lineH - content) / 2 + boxes.fontAscent
  return baseline - boxes.capAscent * capFrac
}

function inkBoxMidY(yLine: number, lineH: number, boxes: FontBoxes): number {
  const content = boxes.fontAscent + boxes.fontDescent
  const top = yLine + (lineH - content) / 2
  return top + content / 2
}

function inkBoxHeight(_lineH: number, boxes: FontBoxes, em: number): number {
  const glyph = boxes.fontAscent + boxes.fontDescent
  return Math.max(glyph, em) * 1.16
}

function markerSwipe(
  x: number,
  yMid: number,
  w: number,
  em: number,
  seed: number,
  italic: boolean,
): Array<[number, number]> {
  const rng = inkRng(seed)
  const skew = italic ? em * 0.12 : 0
  const x0 = x + skew
  const x1 = x + w + skew
  const span = Math.max(2, x1 - x0)
  const bow = em * (0.012 + rng() * 0.01)
  const n = Math.max(6, Math.round(span / 22))
  const pts: Array<[number, number]> = []
  for (let i = 0; i <= n; i++) {
    const t = i / n
    const xx = x0 + span * t
    const yy = yMid + Math.sin(t * Math.PI) * bow
    pts.push([xx, yy])
  }
  return pts
}

function underlineScribble(
  x: number,
  y: number,
  w: number,
  em: number,
  seed: number,
  italic: boolean,
): Array<[number, number]> {
  const rng = inkRng(seed)
  const skew = italic ? em * 0.08 : 0
  // Keep the stroke inside the text box. Large end overshoot drew under
  // adjacent punctuation (e.g. 、) after prose links.
  const pad = em * 0.02
  const x0 = x + skew + pad
  const x1 = x + skew + Math.max(pad * 2, w - pad)
  const p1 = rng() * Math.PI * 2
  const p2 = rng() * Math.PI * 2
  const n = Math.max(10, Math.round(w / 14))
  const passY = [
    em * (0.03 + rng() * 0.02),
    em * (-0.026 - rng() * 0.02),
    em * (0.012 + rng() * 0.016),
    em * (-0.038 - rng() * 0.018),
  ]
  const pts: Array<[number, number]> = []

  const at = (u: number, yOff: number, phase: number): [number, number] => ([
    x0 + (x1 - x0) * u,
    y + yOff
    + em * 0.018 * Math.sin(u * Math.PI * 2 + p1 + phase)
    + em * 0.008 * Math.sin(u * Math.PI * 5 + p2),
  ])

  for (let pass = 0; pass < 4; pass++) {
    const forward = pass % 2 === 0
    const yOff = passY[pass]!
    const phase = pass * 0.85
    for (let i = pass === 0 ? 0 : 1; i <= n; i++) {
      const u = forward ? i / n : 1 - i / n
      pts.push(at(u, yOff, phase))
    }
    if (pass < 3) {
      const edgeX = forward ? x1 : x0
      const tuck = em * (0.012 + rng() * 0.01)
      const yA = pts.at(-1)![1]
      const yB = y + passY[pass + 1]!
      const midX = forward ? edgeX - tuck : edgeX + tuck
      pts.push([midX, yA + (yB - yA) * 0.22])
      pts.push([edgeX, (yA + yB) / 2])
      pts.push([midX, yA + (yB - yA) * 0.78])
    }
  }

  return pts
}

let inkMaskSeq = 0

function appendMaskedFill(
  svg: SVGSVGElement,
  fillD: string,
  pts: Array<[number, number]>,
  width: number,
  lineCap: 'butt' | 'round' = 'butt',
): void {
  if (!fillD || pts.length < 2)
    return

  const extra = width * 0.7
  const t0 = tangentAt(pts, 0)
  const t1 = tangentAt(pts, pts.length - 1)
  const a = pts[0]!
  const b = pts.at(-1)!
  const revealD = catmullRom([
    [a[0] - t0[0] * extra, a[1] - t0[1] * extra],
    ...pts,
    [b[0] + t1[0] * extra, b[1] + t1[1] * extra],
  ])

  let defs = svg.querySelector('defs')
  if (!defs) {
    defs = document.createElementNS(NS, 'defs')
    svg.insertBefore(defs, svg.firstChild)
  }

  const maskId = `ink-mask-${++inkMaskSeq}`
  const mask = document.createElementNS(NS, 'mask')
  mask.setAttribute('id', maskId)
  mask.setAttribute('maskUnits', 'userSpaceOnUse')

  const reveal = document.createElementNS(NS, 'path')
  reveal.setAttribute('d', revealD)
  reveal.setAttribute('fill', 'none')
  reveal.setAttribute('stroke', '#fff')
  reveal.setAttribute('stroke-width', String(width * 1.55))
  reveal.setAttribute('stroke-linecap', lineCap)
  reveal.setAttribute('stroke-linejoin', lineCap === 'round' ? 'round' : 'miter')
  mask.appendChild(reveal)
  defs.appendChild(mask)
  const hide = Math.ceil(reveal.getTotalLength()) + 16
  reveal.style.setProperty('--ink-len', `${hide}`)
  reveal.classList.add('ink-reveal')

  const path = document.createElementNS(NS, 'path')
  path.setAttribute('d', fillD)
  path.setAttribute('fill', 'var(--colored-ink)')
  path.setAttribute('stroke', 'none')
  path.setAttribute('mask', `url(#${maskId})`)
  svg.appendChild(path)
}

function polylineLen(pts: Array<[number, number]>): number {
  let n = 0
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1]!
    const b = pts[i]!
    n += Math.hypot(b[0] - a[0], b[1] - a[1])
  }
  return n
}

function penTaper(t: number, edge: number): number {
  if (edge <= 0)
    return 1
  if (t < edge)
    return (t / edge) ** 1.35
  if (t > 1 - edge)
    return ((1 - t) / edge) ** 1.35
  return 1
}

function variableRibbon(
  pts: Array<[number, number]>,
  widthAt: (t: number) => number,
): string {
  if (pts.length < 2)
    return ''
  const last = pts.length - 1
  const top: Array<[number, number]> = []
  const bot: Array<[number, number]> = []
  for (let i = 0; i <= last; i++) {
    const t = i / last
    const h = Math.max(0.12, widthAt(t) / 2)
    const [nx, ny] = normalAt(pts, i)
    const p = pts[i]!
    top.push([p[0] + nx * h, p[1] + ny * h])
    bot.push([p[0] - nx * h, p[1] - ny * h])
  }
  return catmullRomClosed([
    pts[0]!,
    ...top.slice(1, -1),
    pts[last]!,
    ...bot.slice(1, -1).reverse(),
  ])
}

function circlePoints(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  seed: number,
): Array<[number, number]> {
  const rng = inkRng(seed)
  const start = ((Math.imul(seed, 0x9E3779B1) >>> 0) / 4294967296) * Math.PI * 2
  const sweep = Math.PI * 2 * (0.86 + rng() * 0.32)
  const p1 = rng() * Math.PI * 2
  const p2 = rng() * Math.PI * 2
  const p3 = rng() * Math.PI * 2
  const n = 36
  const pts: Array<[number, number]> = []
  for (let i = 0; i <= n; i++) {
    const t = i / n
    const a = start + sweep * t
    const wob = 1
      + 0.045 * Math.sin(a * 2 + p1)
      + 0.02 * Math.sin(a * 5 + p2)
      + 0.028 * Math.sin(a * 1.37 + p3)
    pts.push([cx + Math.cos(a) * rx * wob, cy + Math.sin(a) * ry * wob])
  }
  return pts
}

function strokeOptions(seed: number, em: number): Options {
  return {
    roughness: 1.15,
    bowing: 1.6,
    stroke: 'var(--colored-ink)',
    strokeWidth: Math.max(1.1, em * 0.052),
    seed,
    disableMultiStroke: true,
  }
}

function ensureSvg(el: HTMLElement, kind: InkKind): SVGSVGElement {
  let svg = el.querySelector<SVGSVGElement>(`:scope > .${SVG_CLASS}[data-kind="${kind}"]`)
  if (!svg) {
    svg = document.createElementNS(NS, 'svg')
    svg.setAttribute('class', SVG_CLASS)
    svg.setAttribute('aria-hidden', 'true')
    svg.dataset.kind = kind
    el.appendChild(svg)
  }
  return svg
}

function pruneSvgs(el: HTMLElement, keep: readonly InkKind[]) {
  for (const svg of [...el.querySelectorAll<SVGSVGElement>(`:scope > .${SVG_CLASS}`)]) {
    if (svg.dataset.reveal === 'exit' || svg.dataset.reveal === 'enter')
      continue
    const kind = parseKind(svg.dataset.kind)
    if (!kind || !keep.includes(kind))
      svg.remove()
  }
}

function appendMarkStroke(
  svg: SVGSVGElement,
  pts: Array<[number, number]>,
  width: number,
  animate: boolean,
): void {
  if (pts.length < 2)
    return
  const d = catmullRom(pts)
  if (!d)
    return
  const path = document.createElementNS(NS, 'path')
  path.setAttribute('class', 'mark-ink')
  path.setAttribute('d', d)
  path.setAttribute('fill', 'none')
  path.setAttribute('stroke', 'var(--colored-ink)')
  path.setAttribute('stroke-width', String(width))
  path.setAttribute('stroke-linecap', 'butt')
  path.setAttribute('stroke-linejoin', 'miter')
  if (animate) {
    const hide = Math.ceil(polylineLen(pts)) + 16
    path.style.setProperty('--ink-len', `${hide}`)
    path.classList.add('ink-reveal')
  }
  svg.appendChild(path)
}

function mergeClientRects(rects: Iterable<{ x: number, y: number, w?: number, width?: number, h?: number, height?: number, left?: number, top?: number }>): LineBox[] {
  const lines: LineBox[] = []
  for (const rect of rects) {
    const x = rect.w == null ? (rect.left ?? rect.x) : rect.x
    const y = rect.h == null ? (rect.top ?? rect.y) : rect.y
    const w = rect.w ?? rect.width ?? 0
    const h = rect.h ?? rect.height ?? 0
    if (w < 2 || h < 2)
      continue
    const same = lines.find(line => Math.abs(line.y - y) < 4)
    if (same) {
      const tall = Math.max(same.h, h)
      const short = Math.min(same.h, h)
      if (short > 0 && tall / short > 1.45) {
        lines.push({ x, y, w, h })
      }
      else {
        const right = Math.max(same.x + same.w, x + w)
        same.x = Math.min(same.x, x)
        same.w = right - same.x
        same.h = Math.max(same.h, h)
      }
    }
    else {
      lines.push({ x, y, w, h })
    }
  }
  return lines
}

function isRubyAnnotation(node: Node): boolean {
  const el = node.nodeType === Node.ELEMENT_NODE
    ? node as Element
    : node.parentElement
  return Boolean(el?.closest('rt, rp, rtc'))
}

function selectionLineBoxes(range: Range): LineBox[] {
  const root = range.commonAncestorContainer
  if (root.nodeType === Node.TEXT_NODE) {
    if (isRubyAnnotation(root))
      return []
    return mergeClientRects([...range.getClientRects()])
  }

  const raw: LineBox[] = []
  const piece = document.createRange()
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  let node = walker.nextNode()
  while (node) {
    const text = node as Text
    if (!text.data || !range.intersectsNode(text) || isRubyAnnotation(text)) {
      node = walker.nextNode()
      continue
    }
    const start = range.startContainer === text ? range.startOffset : 0
    const end = range.endContainer === text ? range.endOffset : text.data.length
    if (start >= end) {
      node = walker.nextNode()
      continue
    }
    piece.setStart(text, start)
    piece.setEnd(text, end)
    for (const rect of piece.getClientRects()) {
      if (rect.width >= 2 && rect.height >= 2)
        raw.push({ x: rect.left, y: rect.top, w: rect.width, h: rect.height })
    }
    node = walker.nextNode()
  }
  piece.detach()
  return mergeClientRects(raw)
}

function textLineBoxes(el: HTMLElement): LineBox[] {
  const raw: LineBox[] = []
  const piece = document.createRange()
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
  let node = walker.nextNode()
  while (node) {
    const text = node as Text
    if (!text.data || isRubyAnnotation(text)) {
      node = walker.nextNode()
      continue
    }
    const parent = text.parentElement
    if (parent?.closest('svg, .selection-ink')) {
      node = walker.nextNode()
      continue
    }
    piece.selectNodeContents(text)
    for (const rect of piece.getClientRects()) {
      if (rect.width >= 2 && rect.height >= 2)
        raw.push({ x: rect.left, y: rect.top, w: rect.width, h: rect.height })
    }
    node = walker.nextNode()
  }
  piece.detach()
  return mergeClientRects(raw)
}

export function clearSelectionInk(): void {
  for (const svg of document.querySelectorAll<SVGSVGElement>('svg.selection-ink')) {
    const host = svg.parentElement
    svg.remove()
    if (!host)
      continue
    if (host.dataset.selectionInkPos === '1') {
      host.style.removeProperty('position')
      delete host.dataset.selectionInkPos
    }
    if (host.dataset.selectionInkIso === '1') {
      host.style.removeProperty('isolation')
      delete host.dataset.selectionInkIso
    }
  }
}

function ensureSelectionHost(el: HTMLElement): HTMLElement | null {
  const host = (el.closest('p, li, h1, h2, h3, h4, h5, h6, blockquote, pre, td, th, article, [un-prose], section') as HTMLElement | null) ?? el
  if (host.matches('body, html'))
    return null

  const cs = getComputedStyle(host)
  if (cs.position === 'static') {
    host.style.position = 'relative'
    host.dataset.selectionInkPos = '1'
  }
  if (cs.isolation === 'auto') {
    host.style.isolation = 'isolate'
    host.dataset.selectionInkIso = '1'
  }
  return host
}

export function paintSelectionInk(range: Range): boolean {
  clearSelectionInk()

  const ancestor = range.commonAncestorContainer
  const el = (ancestor.nodeType === Node.ELEMENT_NODE
    ? ancestor
    : ancestor.parentElement) as HTMLElement | null
  if (!el)
    return false

  const lines = selectionLineBoxes(range)
  if (!lines.length)
    return false

  const host = ensureSelectionHost(el)
  if (!host)
    return false

  const cs = getComputedStyle(host)
  const em = Number.parseFloat(cs.fontSize) || 16
  const italic = ITALIC_RE.test(cs.fontStyle)
  const boxes = fontBoxes(host)
  const seed0 = hashSeed(`sel:${range.startOffset}:${(range.toString() || '').slice(0, 32)}`)
  const box = host.getBoundingClientRect()
  const svgW = Math.max(1, box.width)
  const svgH = Math.max(1, box.height)

  const svg = document.createElementNS(NS, 'svg')
  svg.setAttribute('class', 'selection-ink')
  svg.setAttribute('aria-hidden', 'true')
  svg.setAttribute('width', String(svgW))
  svg.setAttribute('height', String(svgH))
  svg.setAttribute('viewBox', `0 0 ${svgW} ${svgH}`)
  svg.style.left = '0'
  svg.style.top = '0'
  svg.style.width = `${svgW}px`
  svg.style.height = `${svgH}px`

  lines.forEach((line, i) => {
    const seed = seed0 + i * 97
    const width = inkBoxHeight(line.h, boxes, em)
    appendMarkStroke(
      svg,
      markerSwipe(
        line.x - box.left,
        inkBoxMidY(line.y - box.top, line.h, boxes),
        line.w,
        em,
        seed,
        italic,
      ),
      width,
      false,
    )
  })

  host.insertBefore(svg, host.firstChild)
  return true
}

export function paintRoughInk(el: HTMLElement): void {
  if (!canPaint(el))
    return

  const { live, hover, kinds } = inksOf(el)
  if (!kinds.length) {
    pruneSvgs(el, [])
    delete el.dataset.inkSig
    return
  }

  const host = el.getBoundingClientRect()
  if (host.width < 2 || host.height < 2)
    return

  const em = Number.parseFloat(getComputedStyle(el).fontSize) || 16
  const lines = textLineBoxes(el)
  const boxW = Math.round(el.offsetWidth || host.width)
  const boxH = Math.round(el.offsetHeight || host.height)
  const revealOf = (kind: InkKind) => (hover === kind && live !== kind ? 'hover' : 'live')
  const sig = `v25:${boxW}x${boxH}:${lines.length}:${kinds.map(kind => `${kind}@${revealOf(kind)}`).join('+')}`
  if (el.dataset.inkSig === sig && kinds.every(kind => el.querySelector(`:scope > .${SVG_CLASS}[data-kind="${kind}"]`))) {
    for (const kind of kinds) {
      const svg = el.querySelector<SVGSVGElement>(`:scope > .${SVG_CLASS}[data-kind="${kind}"]`)
      if (!svg || svg.dataset.reveal === 'enter' || svg.dataset.reveal === 'exit')
        continue
      svg.dataset.reveal = revealOf(kind)
    }
    return
  }

  pruneSvgs(el, kinds)
  for (const kind of kinds) {
    const svg = el.querySelector<SVGSVGElement>(`:scope > .${SVG_CLASS}[data-kind="${kind}"]`)
    if (svg?.dataset.reveal === 'enter' || svg?.dataset.reveal === 'exit')
      continue
    paintKind(el, kind, host, em, lines, revealOf(kind))
  }
  el.dataset.inkSig = sig
}

const morphTimers = new WeakMap<HTMLElement, number[]>()

function trackTimer(el: HTMLElement, id: number) {
  const list = morphTimers.get(el) ?? []
  list.push(id)
  morphTimers.set(el, list)
}

function clearMorphTimers(el: HTMLElement) {
  for (const id of morphTimers.get(el) ?? [])
    window.clearTimeout(id)
  morphTimers.set(el, [])
}

function prefersReducedInk(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** Cross-fade stroke kinds (underline ↔ circle) instead of swapping the SVG. */
export function morphRoughInk(el: HTMLElement): void {
  if (!canPaint(el) || prefersReducedInk()) {
    paintRoughInk(el)
    return
  }

  const { live, hover, kinds } = inksOf(el)
  const host = el.getBoundingClientRect()
  if (host.width < 2 || host.height < 2)
    return

  clearMorphTimers(el)
  const em = Number.parseFloat(getComputedStyle(el).fontSize) || 16
  const lines = textLineBoxes(el)
  const boxW = Math.round(el.offsetWidth || host.width)
  const boxH = Math.round(el.offsetHeight || host.height)
  const revealOf = (kind: InkKind) => (hover === kind && live !== kind ? 'hover' : 'live')
  const keep = new Set(kinds)

  for (const svg of [...el.querySelectorAll<SVGSVGElement>(`:scope > .${SVG_CLASS}`)]) {
    const kind = parseKind(svg.dataset.kind)
    if (kind && keep.has(kind))
      continue
    svg.dataset.reveal = 'exit'
    const drop = () => svg.remove()
    svg.querySelector('.ink-reveal')?.addEventListener('transitionend', drop, { once: true })
    trackTimer(el, window.setTimeout(drop, 800))
  }

  for (const kind of kinds) {
    const existed = el.querySelector<SVGSVGElement>(`:scope > .${SVG_CLASS}[data-kind="${kind}"]`)
    const next = revealOf(kind)
    const prev = existed?.dataset.reveal

    if (next === 'live' && existed && prev === 'hover') {
      // Hover (unhovered) already holds the stroke at full dashoffset.
      // Flip to enter so dashoffset eases to 0 — no repaint, no lost frame.
      existed.dataset.reveal = 'enter'
      const settle = () => {
        existed.dataset.reveal = 'live'
      }
      existed.querySelector('.ink-reveal')?.addEventListener('transitionend', settle, { once: true })
      trackTimer(el, window.setTimeout(settle, 800))
      continue
    }

    if (next === 'live' && prev !== 'live' && prev !== 'enter') {
      paintKind(el, kind, host, em, lines, 'exit')
      const svg = el.querySelector<SVGSVGElement>(`:scope > .${SVG_CLASS}[data-kind="${kind}"]`)
      if (!svg)
        continue
      svg.classList.add('ink-boot')
      requestAnimationFrame(() => {
        void svg.getBoundingClientRect()
        requestAnimationFrame(() => {
          svg.classList.remove('ink-boot')
          svg.dataset.reveal = 'enter'
          const settle = () => {
            svg.dataset.reveal = 'live'
          }
          svg.querySelector('.ink-reveal')?.addEventListener('transitionend', settle, { once: true })
          trackTimer(el, window.setTimeout(settle, 800))
        })
      })
      continue
    }

    if (next === 'hover' && existed && (prev === 'live' || prev === 'enter')) {
      // Live strokes may lack .ink-reveal; rebuild visible then wipe to hover.
      paintKind(el, kind, host, em, lines, 'enter')
      const svg = el.querySelector<SVGSVGElement>(`:scope > .${SVG_CLASS}[data-kind="${kind}"]`)
      if (!svg)
        continue
      svg.classList.add('ink-boot')
      requestAnimationFrame(() => {
        void svg.getBoundingClientRect()
        requestAnimationFrame(() => {
          svg.classList.remove('ink-boot')
          svg.dataset.reveal = 'hover'
        })
      })
      continue
    }

    if (existed) {
      existed.dataset.reveal = next
      continue
    }
    paintKind(el, kind, host, em, lines, next)
  }

  el.dataset.inkSig = `v25:${boxW}x${boxH}:${lines.length}:${kinds.map(kind => `${kind}@${revealOf(kind)}`).join('+')}`
}

function paintKind(
  el: HTMLElement,
  kind: InkKind,
  host: DOMRect,
  em: number,
  lines: LineBox[],
  reveal: 'live' | 'hover' | 'exit' | 'enter',
): void {
  const svg = ensureSvg(el, kind)
  svg.replaceChildren()
  svg.dataset.kind = kind
  svg.dataset.reveal = reveal

  const [px, py] = PAD[kind]
  const padX = em * px
  const padY = em * py
  let ox = 0
  let oy = 0
  const display = getComputedStyle(el).display
  if (
    display === 'inline'
    || (
      display.startsWith('inline')
      && display !== 'inline-block'
      && display !== 'inline-flex'
      && display !== 'inline-grid'
    )
  ) {
    const first = el.getClientRects()[0]
    if (first) {
      ox = first.left - host.left
      oy = first.top - host.top
    }
  }
  const svgW = host.width + padX * 2
  const svgH = host.height + padY * 2
  svg.setAttribute('width', String(svgW))
  svg.setAttribute('height', String(svgH))
  svg.setAttribute('viewBox', `0 0 ${svgW} ${svgH}`)
  svg.setAttribute('preserveAspectRatio', 'none')
  svg.style.left = `${-ox - padX}px`
  svg.style.top = `${-oy - padY}px`
  svg.style.width = `${svgW}px`
  svg.style.height = `${svgH}px`

  const boxes = kind === 'mark' || kind === 'circle' ? fontBoxes(el) : null
  const italic = ITALIC_RE.test(getComputedStyle(el).fontStyle)
  const seed0 = hashSeed(`${kind}:${(el.textContent || '').trim()}`)
  const rc = kind === 'strike' ? rough.svg(svg) : null

  lines.forEach((line, i) => {
    const x = line.x - host.left + padX
    const y = line.y - host.top + padY
    const seed = seed0 + i * 97
    if (kind === 'circle' && boxes) {
      const pts = circlePoints(
        x + line.w / 2,
        inkMidY(y, line.h, boxes, 0.36),
        (line.w + em * 0.72) / 2,
        em * 0.62,
        seed,
      )
      const maxW = Math.max(1.25, em * 0.06)
      const edge = Math.min(0.18, Math.max(6, em * 0.22) / Math.max(polylineLen(pts), 1))
      appendMaskedFill(
        svg,
        variableRibbon(pts, t => maxW * penTaper(t, edge)),
        pts,
        maxW,
      )
      return
    }
    if (kind === 'mark' && boxes) {
      const width = Math.max(8, em * 0.52)
      const pts = markerSwipe(
        x,
        inkMidY(y, line.h, boxes, 0.42),
        line.w,
        em,
        seed,
        italic,
      )
      appendMarkStroke(svg, pts, width, reveal !== 'live')
      return
    }
    if (kind === 'underline') {
      const pts = underlineScribble(x, y + em * 1.08, line.w, em, seed, italic)
      const maxW = Math.max(1.15, em * 0.055)
      const edge = Math.min(0.04, Math.max(5, em * 0.2) / Math.max(polylineLen(pts), 1))
      appendMaskedFill(
        svg,
        variableRibbon(pts, t => maxW * penTaper(t, edge)),
        pts,
        maxW,
      )
      return
    }
    if (!rc)
      return
    const over = em * 0.06
    svg.appendChild(rc.line(
      x - over,
      y + em * 0.52,
      x + line.w + over,
      y + em * 0.52,
      strokeOptions(seed, em),
    ))
  })
}
