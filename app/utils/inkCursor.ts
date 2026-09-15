import type { InkPt } from '~/utils/inkDraw'
import { inkRng, inkStrokePath } from '~/utils/inkDraw'

export type InkCursorKind = 'arrow' | 'circle' | 'point'

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

/**
 * Morph triangle (t=0) into circle (t=1). Both loops share point count,
 * winding, and start direction, so the interpolation stays a single stroke.
 * `breathe` scales the circle around its center (-1..1), for idle motion.
 */
export function morphCursorPath(t: number, breathe = 0): string {
  const a = triangleLoop()
  const c = circleLoop()
  const grow = 1 + breathe * 0.05
  const pts = a.map((p, i) => {
    const q = c[i]!
    const cx = LOOP_CENTER[0] + (q[0] - LOOP_CENTER[0]) * grow
    const cy = LOOP_CENTER[1] + (q[1] - LOOP_CENTER[1]) * grow
    return [p[0] + (cx - p[0]) * t, p[1] + (cy - p[1]) * t] as InkPt
  })
  return `${inkStrokePath(pts)} Z`
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

export function inkCursorSvg(): SVGSVGElement {
  const svg = document.createElementNS(NS, 'svg')
  svg.setAttribute('viewBox', '0 0 32 32')
  svg.setAttribute('aria-hidden', 'true')
  svg.setAttribute('focusable', 'false')
  svg.classList.add('ink-cursor__svg', 'ink-cursor__svg--arrow')

  const path = document.createElementNS(NS, 'path')
  path.setAttribute('d', morphCursorPath(0))
  path.setAttribute('fill', 'none')
  path.setAttribute('stroke', 'currentColor')
  path.setAttribute('stroke-width', '1.7')
  path.setAttribute('stroke-linecap', 'round')
  path.setAttribute('stroke-linejoin', 'round')
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
