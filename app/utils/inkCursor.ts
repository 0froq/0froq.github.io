import type { InkPt } from '~/utils/inkDraw'
import { inkRng, inkStrokePath } from '~/utils/inkDraw'

export type InkCursorKind = 'arrow' | 'circle' | 'point' | 'text'

const NS = 'http://www.w3.org/2000/svg'
const LOOP_N = 60

/** Arrow tip in viewBox units; the root is anchored here. */
export const INK_CURSOR_HOTSPOT: readonly [number, number] = [8, 7]

/** One-stroke handle-less triangle arrow. Clockwise in screen coords. */
const TRIANGLE: readonly InkPt[] = [[8, 7], [10, 26.2], [25.2, 15]]
const LOOP_CENTER: InkPt = [
  (TRIANGLE[0]![0] + TRIANGLE[1]![0] + TRIANGLE[2]![0]) / 3,
  (TRIANGLE[0]![1] + TRIANGLE[1]![1] + TRIANGLE[2]![1]) / 3,
]
const CIRCLE_R = 8.4
const BAR_W = 5
const BAR_H = 17.2

/** Bar center; used as the pointer hotspot in text mode. */
export const INK_CURSOR_TEXT_HOTSPOT: readonly [number, number] = LOOP_CENTER

function strokePath(pts: InkPt[]): string {
  if (pts.length < 2)
    return ''
  if (pts.length === 2)
    return `M${pts[0]![0].toFixed(2)} ${pts[0]![1].toFixed(2)} L${pts[1]![0].toFixed(2)} ${pts[1]![1].toFixed(2)}`

  let d = `M${pts[0]![0].toFixed(2)} ${pts[0]![1].toFixed(2)}`
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

let arrowLoopCache: InkPt[] | undefined
let circleLoopCache: InkPt[] | undefined
let barLoopCache: InkPt[] | undefined

/** Triangle perimeter, LOOP_N points, seeded jitter. Starts at the tip. */
function triangleLoop(): InkPt[] {
  if (arrowLoopCache)
    return arrowLoopCache
  const rng = inkRng('ink-cursor:v2:arrow')
  const j = () => (rng() - 0.5) * 0.62
  const pts: InkPt[] = []
  const per = LOOP_N / TRIANGLE.length
  for (let e = 0; e < TRIANGLE.length; e++) {
    const a = TRIANGLE[e]!
    const b = TRIANGLE[(e + 1) % TRIANGLE.length]!
    for (let i = 0; i < per; i++) {
      const t = i / per
      pts.push([a[0] + (b[0] - a[0]) * t + j(), a[1] + (b[1] - a[1]) * t + j()])
    }
  }
  arrowLoopCache = pts
  return pts
}

/** Wobbly circle, LOOP_N points, same winding and start direction as the triangle. */
function circleLoop(): InkPt[] {
  if (circleLoopCache)
    return circleLoopCache
  const rng = inkRng('ink-cursor:v2:circle')
  const start = Math.atan2(
    TRIANGLE[0]![1] - LOOP_CENTER[1],
    TRIANGLE[0]![0] - LOOP_CENTER[0],
  )
  const pts: InkPt[] = []
  for (let i = 0; i < LOOP_N; i++) {
    const a = start + (i / LOOP_N) * Math.PI * 2
    const r = CIRCLE_R * (1 + (rng() - 0.5) * 0.08)
    pts.push([LOOP_CENTER[0] + Math.cos(a) * r, LOOP_CENTER[1] + Math.sin(a) * r])
  }
  circleLoopCache = pts
  return pts
}

/** Vertical rectangle, LOOP_N points, clockwise from the top-left (nearest the tip). */
function rectLoop(
  cx: number,
  cy: number,
  w: number,
  h: number,
  rng: () => number,
  jScale: number,
): InkPt[] {
  const j = () => (rng() - 0.5) * jScale
  const hw = w / 2
  const hh = h / 2
  const corners: InkPt[] = [
    [cx - hw, cy - hh],
    [cx + hw, cy - hh],
    [cx + hw, cy + hh],
    [cx - hw, cy + hh],
  ]
  const pts: InkPt[] = []
  const per = LOOP_N / corners.length
  for (let e = 0; e < corners.length; e++) {
    const a = corners[e]!
    const b = corners[(e + 1) % corners.length]!
    for (let i = 0; i < per; i++) {
      const t = i / per
      pts.push([a[0] + (b[0] - a[0]) * t + j(), a[1] + (b[1] - a[1]) * t + j()])
    }
  }
  return pts
}

function barLoop(): InkPt[] {
  if (barLoopCache)
    return barLoopCache
  barLoopCache = rectLoop(LOOP_CENTER[0], LOOP_CENTER[1], BAR_W, BAR_H, inkRng('ink-cursor:v2:bar'), 0.28)
  return barLoopCache
}

/**
 * Morph triangle (circle=0, bar=0) into circle and/or the text bar.
 * All loops share point count and winding, so the interpolation stays a single stroke.
 * `breathe` scales the circle around its center (-1..1), for idle motion.
 */
export function morphCursorPts(circle = 0, breathe = 0, bar = 0): InkPt[] {
  const a = triangleLoop()
  const c = circleLoop()
  const b = barLoop()
  const grow = 1 + breathe * 0.05
  return a.map((p, i) => {
    const q = c[i]!
    const r = b[i]!
    const cx = LOOP_CENTER[0] + (q[0] - LOOP_CENTER[0]) * grow
    const cy = LOOP_CENTER[1] + (q[1] - LOOP_CENTER[1]) * grow
    return [
      p[0] + (cx - p[0]) * circle + (r[0] - p[0]) * bar,
      p[1] + (cy - p[1]) * circle + (r[1] - p[1]) * bar,
    ] as InkPt
  })
}

export function morphCursorPath(circle = 0, breathe = 0, bar = 0): string {
  return `${inkStrokePath(morphCursorPts(circle, breathe, bar))} Z`
}

export function closedInkPath(pts: InkPt[]): string {
  return `${inkStrokePath(pts)} Z`
}

export function closedLoopContains(pts: InkPt[], x: number, y: number) {
  let inside = false
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const xi = pts[i]![0]
    const yi = pts[i]![1]
    const xj = pts[j]![0]
    const yj = pts[j]![1]
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi + 1e-6) + xi)
      inside = !inside
  }
  return inside
}

export function closedLoopDist(pts: InkPt[], x: number, y: number) {
  if (pts.length < 2)
    return Infinity
  let best = Infinity
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i]!
    const b = pts[(i + 1) % pts.length]!
    const vx = b[0] - a[0]
    const vy = b[1] - a[1]
    const len2 = vx * vx + vy * vy
    const t = len2 < 1e-6 ? 0 : Math.max(0, Math.min(1, ((x - a[0]) * vx + (y - a[1]) * vy) / len2))
    const dx = x - (a[0] + vx * t)
    const dy = y - (a[1] + vy * t)
    const d = dx * dx + dy * dy
    if (d < best)
      best = d
  }
  return Math.sqrt(best)
}

interface SelBox {
  left: number
  top: number
  right: number
  bottom: number
}

function rectArea(r: { left: number, top: number, right: number, bottom: number }) {
  return Math.max(0, r.right - r.left) * Math.max(0, r.bottom - r.top)
}

function rectContains(
  a: { left: number, top: number, right: number, bottom: number },
  b: { left: number, top: number, right: number, bottom: number },
) {
  return a.left <= b.left + 1
    && a.right >= b.right - 1
    && a.top <= b.top + 1
    && a.bottom >= b.bottom - 1
    && rectArea(a) > rectArea(b) + 4
}

/** Drop block/element boxes that merely wrap line fragments. */
function lineRects(rects: ArrayLike<DOMRectReadOnly>): SelBox[] {
  const raw: SelBox[] = []
  for (const r of rects) {
    if (r.width > 1 && r.height > 1)
      raw.push({ left: r.left, top: r.top, right: r.right, bottom: r.bottom })
  }
  return raw.filter((a, i) => !raw.some((b, j) => j !== i && rectContains(a, b)))
}

function sameLine(a: SelBox, b: SelBox) {
  const overlap = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top)
  if (overlap <= 0)
    return false
  const minH = Math.min(a.bottom - a.top, b.bottom - b.top)
  return overlap >= minH * 0.25
}

function mergeSelectionRows(rects: ArrayLike<DOMRectReadOnly>): SelBox[] {
  const sorted = lineRects(rects).sort((a, b) => a.top - b.top || a.left - b.left)
  const rows: SelBox[] = []
  for (const r of sorted) {
    const hit = rows.find(row => sameLine(row, r))
    if (hit) {
      hit.left = Math.min(hit.left, r.left)
      hit.right = Math.max(hit.right, r.right)
      hit.top = Math.min(hit.top, r.top)
      hit.bottom = Math.max(hit.bottom, r.bottom)
    }
    else {
      rows.push({ ...r })
    }
  }
  return rows.sort((a, b) => a.top - b.top || a.left - b.left)
}

function padRows(rows: SelBox[], pad: number): SelBox[] {
  return rows.map(r => ({
    left: r.left - pad,
    top: r.top - pad,
    right: r.right + pad,
    bottom: r.bottom + pad,
  }))
}

function nearly(a: InkPt, b: InkPt) {
  return Math.abs(a[0] - b[0]) < 0.6 && Math.abs(a[1] - b[1]) < 0.6
}

/** Outer silhouette of stacked line boxes. Clockwise from first-line top-left. */
function selectionPolygon(rows: SelBox[]): InkPt[] {
  const n = rows.length
  if (!n)
    return []
  const pts: InkPt[] = []
  const first = rows[0]!
  pts.push([first.left, first.top], [first.right, first.top])
  for (let i = 0; i < n; i++) {
    const box = rows[i]!
    const next = rows[i + 1]
    pts.push([box.right, box.bottom])
    if (next)
      pts.push([next.right, box.bottom])
  }
  const last = rows[n - 1]!
  pts.push([last.left, last.bottom])
  for (let i = n - 1; i >= 0; i--) {
    const box = rows[i]!
    const prev = rows[i - 1]
    pts.push([box.left, box.top])
    if (prev)
      pts.push([prev.left, box.top])
  }
  const out: InkPt[] = []
  for (const p of pts) {
    const q = out.at(-1)
    if (!q || !nearly(p, q))
      out.push(p)
  }
  if (out.length > 1 && nearly(out[0]!, out.at(-1)!))
    out.pop()
  return out
}

function resampleClosed(pts: InkPt[], n: number): InkPt[] {
  if (pts.length < 2)
    return pts
  const ring = [...pts, pts[0]!]
  const lens: number[] = []
  let total = 0
  for (let i = 0; i < ring.length - 1; i++) {
    const len = Math.hypot(ring[i + 1]![0] - ring[i]![0], ring[i + 1]![1] - ring[i]![1])
    lens.push(len)
    total += len
  }
  if (total < 1)
    return Array.from({ length: n }).fill([pts[0]![0], pts[0]![1]] as InkPt)
  const out: InkPt[] = []
  const step = total / n
  let ei = 0
  let acc = 0
  for (let i = 0; i < n; i++) {
    const target = i * step
    while (ei < lens.length - 1 && acc + lens[ei]! < target)
      acc += lens[ei++]!
    const seg = lens[ei]!
    const t = seg < 1e-6 ? 0 : (target - acc) / seg
    const a = ring[ei]!
    const b = ring[ei + 1]!
    out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t])
  }
  return out
}

/** Glyph boxes inside the range, not block-level heading/paragraph frames. */
export function rangeTextRects(range: Range): DOMRect[] {
  const root = range.commonAncestorContainer
  const host = root.nodeType === Node.ELEMENT_NODE ? root : root.parentNode
  if (!host)
    return [...range.getClientRects()]
  const out: DOMRect[] = []
  const walker = document.createTreeWalker(host, NodeFilter.SHOW_TEXT)
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node as Text
    const len = text.data.length
    if (!len)
      continue
    try {
      if (range.comparePoint(text, len) < 0 || range.comparePoint(text, 0) > 0)
        continue
    }
    catch {
      continue
    }
    let start = 0
    let end = len
    if (text === range.startContainer)
      start = range.startOffset
    if (text === range.endContainer)
      end = range.endOffset
    if (start >= end)
      continue
    const piece = document.createRange()
    piece.setStart(text, start)
    piece.setEnd(text, end)
    for (const r of piece.getClientRects()) {
      if (r.width > 1 && r.height > 1)
        out.push(r)
    }
  }
  return out.length ? out : [...range.getClientRects()]
}

/** Outer silhouette of the selected line boxes, not their bounding box. */
export function selectionLoopFromRects(
  rects: ArrayLike<DOMRectReadOnly>,
): InkPt[] | null {
  const rows = mergeSelectionRows(rects)
  if (!rows.length)
    return null
  const poly = selectionPolygon(padRows(rows, 4))
  if (poly.length < 3)
    return null
  const rng = inkRng('ink-cursor:v2:bar')
  return resampleClosed(poly, LOOP_N).map(([x, y]) => [
    x + (rng() - 0.5) * 0.5,
    y + (rng() - 0.5) * 0.5,
  ] as InkPt)
}

/** Short floating strokes radiating from the arrow tip: "this is clickable". */
function tickPaths(): string[] {
  const rng = inkRng('ink-cursor:v2:ticks')
  const j = () => (rng() - 0.5) * 0.5
  const tip = TRIANGLE[0]!
  return [198, 238, 278].map((deg) => {
    const a = (deg * Math.PI) / 180
    const r = 6.6 + (rng() - 0.5) * 0.7
    const len = 4.4 + (rng() - 0.5) * 0.7
    const cx = tip[0] + Math.cos(a) * r + j()
    const cy = tip[1] + Math.sin(a) * r + j()
    const dx = (Math.cos(a) * len) / 2
    const dy = (Math.sin(a) * len) / 2
    return strokePath([[cx - dx, cy - dy], [cx + dx, cy + dy]])
  })
}

function svgRoot(): SVGSVGElement {
  const svg = document.createElementNS(NS, 'svg')
  svg.setAttribute('viewBox', '0 0 32 32')
  svg.setAttribute('aria-hidden', 'true')
  svg.setAttribute('focusable', 'false')
  svg.classList.add('ink-cursor__svg')
  return svg
}

function inkPath(cls: string, width: string) {
  const path = document.createElementNS(NS, 'path')
  path.classList.add(cls)
  path.setAttribute('stroke', 'currentColor')
  path.setAttribute('stroke-width', width)
  path.setAttribute('stroke-linecap', 'round')
  path.setAttribute('stroke-linejoin', 'round')
  return path
}

export function inkCursorSvg(): SVGSVGElement {
  const svg = svgRoot()
  svg.classList.add('ink-cursor__svg--arrow')
  const path = inkPath('ink-cursor__shape', '1.7')
  path.setAttribute('d', morphCursorPath(0))
  svg.append(path)
  const ticks = document.createElementNS(NS, 'g')
  ticks.classList.add('ink-cursor__ticks')
  for (const d of tickPaths()) {
    const tick = document.createElementNS(NS, 'path')
    tick.setAttribute('d', d)
    tick.setAttribute('pathLength', '1')
    tick.setAttribute('fill', 'none')
    tick.setAttribute('stroke', 'currentColor')
    tick.setAttribute('stroke-width', '1.85')
    tick.setAttribute('stroke-linecap', 'round')
    tick.classList.add('ink-cursor__tick')
    ticks.append(tick)
  }
  svg.append(ticks)
  return svg
}

export function inkSelSvg(): SVGSVGElement {
  const svg = svgRoot()
  const defs = document.createElementNS(NS, 'defs')
  const grad = document.createElementNS(NS, 'radialGradient')
  grad.id = 'ink-sel-bright-g'
  grad.setAttribute('gradientUnits', 'userSpaceOnUse')
  const stop0 = document.createElementNS(NS, 'stop')
  stop0.setAttribute('offset', '0%')
  stop0.setAttribute('stop-color', '#fff')
  const hold = document.createElementNS(NS, 'stop')
  hold.setAttribute('offset', '32%')
  hold.setAttribute('stop-color', '#fff')
  const stop1 = document.createElementNS(NS, 'stop')
  stop1.setAttribute('offset', '78%')
  stop1.setAttribute('stop-color', '#fff')
  stop1.setAttribute('stop-opacity', '0')
  const stop2 = document.createElementNS(NS, 'stop')
  stop2.setAttribute('offset', '100%')
  stop2.setAttribute('stop-color', '#fff')
  stop2.setAttribute('stop-opacity', '0')
  grad.append(stop0, hold, stop1, stop2)
  const mask = document.createElementNS(NS, 'mask')
  mask.id = 'ink-sel-bright'
  mask.setAttribute('maskUnits', 'userSpaceOnUse')
  const maskRect = document.createElementNS(NS, 'rect')
  maskRect.classList.add('ink-cursor__bright-mask')
  maskRect.setAttribute('fill', 'url(#ink-sel-bright-g)')
  mask.append(maskRect)
  defs.append(grad, mask)
  svg.append(defs)
  svg.append(inkPath('ink-cursor__frame', '1.7'))
  const glow = inkPath('ink-cursor__glow', '3.4')
  glow.setAttribute('fill', 'none')
  glow.setAttribute('mask', 'url(#ink-sel-bright)')
  svg.append(glow)
  return svg
}
