export type InkPt = [number, number]

export function hashSeed(input: string): number {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0) % 2147483646 + 1
}

export function inkRng(seed: string | number): () => number {
  let a = (typeof seed === 'number' ? seed : hashSeed(seed)) >>> 0
  return () => {
    a |= 0
    a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function inkBlobPath(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  rot: number,
  rng: () => number,
  n = 7,
): string {
  const pts: InkPt[] = []
  const cos = Math.cos(rot)
  const sin = Math.sin(rot)
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2
    const j = 0.72 + rng() * 0.46
    const x = Math.cos(a) * rx * j
    const y = Math.sin(a) * ry * j
    pts.push([
      cx + x * cos - y * sin,
      cy + x * sin + y * cos,
    ])
  }
  const count = pts.length
  let d = `M${pts[0]![0].toFixed(2)} ${pts[0]![1].toFixed(2)}`
  for (let i = 0; i < count; i++) {
    const p0 = pts[(i - 1 + count) % count]!
    const p1 = pts[i]!
    const p2 = pts[(i + 1) % count]!
    const p3 = pts[(i + 2) % count]!
    const c1x = p1[0] + (p2[0] - p0[0]) / 6
    const c1y = p1[1] + (p2[1] - p0[1]) / 6
    const c2x = p2[0] - (p3[0] - p1[0]) / 6
    const c2y = p2[1] - (p3[1] - p1[1]) / 6
    d += ` C${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`
  }
  return `${d}Z`
}

export function inkStrokePath(pts: InkPt[]): string {
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

export type InkArrowDir = 'up' | 'down' | 'left' | 'right'

/** Hand-drawn chevron. ViewBox 0 0 16 16. */
export function inkArrowPath(seed: string, dir: InkArrowDir = 'up'): string {
  const rng = inkRng(`ink-arrow:v1:${dir}:${seed}`)
  const jitter = () => (rng() - 0.5) * 0.9
  const mid = 8 + jitter() * 0.4
  const wing = 4.2 + rng() * 0.8
  const lift = 3.4 + rng() * 0.7
  const bow = 0.4 + rng() * 0.5
  const left: InkPt = [mid - wing + jitter(), 8 + lift + jitter()]
  const tip: InkPt = [mid + jitter() * 0.3, 8 - lift + jitter()]
  const right: InkPt = [mid + wing + jitter(), 8 + lift + jitter()]
  const thru: InkPt = [
    tip[0] + (right[0] - left[0]) * 0.02,
    tip[1] + bow,
  ]
  const pts: InkPt[] = [left, tip, thru, right]
  if (dir === 'down')
    return inkStrokePath(pts.map(([x, y]) => [x, 16 - y]))
  if (dir === 'left')
    return inkStrokePath(pts.map(([x, y]) => [y, x]))
  if (dir === 'right')
    return inkStrokePath(pts.map(([x, y]) => [16 - y, x]))
  return inkStrokePath(pts)
}

/** Long curved pointer. ViewBox 0 0 96 96. Stroke only. */
export function inkPointerPath(seed: string, dir: InkArrowDir = 'down'): string {
  const rng = inkRng(`ink-pointer:v1:${dir}:${seed}`)
  const j = (span = 2) => (rng() - 0.5) * span
  const start: InkPt = [48 + j(1.6), 8 + j(1.2)]
  const mid: InkPt = [48 + j(16), 48 + j(4)]
  const tip: InkPt = [48 + j(1.2), 88 + j(1.2)]
  const left: InkPt = [tip[0] - 11 + j(1.6), tip[1] - 18 + j(1.4)]
  const right: InkPt = [tip[0] + 11 + j(1.6), tip[1] - 18 + j(1.4)]

  const remap = (pt: InkPt): InkPt => {
    const [x, y] = pt
    if (dir === 'down')
      return pt
    if (dir === 'up')
      return [x, 96 - y]
    if (dir === 'left')
      return [y, x]
    return [96 - y, x]
  }

  const stem = inkStrokePath([start, mid, tip].map(remap))
  const head = inkStrokePath([left, tip, right].map(remap))
  return `${stem} ${head}`
}

export type InkGlyphKind
  = 'mail'
    | 'wechat'
    | 'github'
    | 'podcast'
    | 'wave'
    | 'x'
    | 'instagram'
    | 'xiaohongshu'
    | 'bluesky'
    | 'clock'
    | 'ring'

/** Platform / contact glyphs. ViewBox 0 0 24 24.
 *  Content frame ~[4,4]–[20,20], visual center ~12,12. Stroke only. */
export function inkGlyphPath(seed: string, kind: InkGlyphKind): string {
  const resolved = kind === 'wave' ? 'podcast' : kind === 'ring' ? 'github' : kind
  const rng = inkRng(`ink-glyph:v7:${resolved}:${seed}`)
  const j = (n = 0.14) => (rng() - 0.5) * n
  const pt = (x: number, y: number, n?: number): InkPt => [x + j(n), y + j(n)]
  const stroke = (pts: InkPt[]) => inkStrokePath(pts)

  if (resolved === 'mail') {
    return [
      stroke([pt(4, 5.5), pt(20, 5.5), pt(20, 18.5), pt(4, 18.5), pt(4, 5.5)]),
      stroke([pt(4.4, 6), pt(12, 13.4), pt(19.6, 6)]),
    ].join(' ')
  }

  if (resolved === 'wechat') {
    return [
      stroke([
        pt(4, 8.4),
        pt(6.8, 5.2),
        pt(12.2, 5),
        pt(16, 7.4),
        pt(15.8, 11.6),
        pt(12, 13.8),
        pt(7.2, 13.6),
        pt(4.6, 16.6),
        pt(5.6, 13.2),
        pt(4, 10.4),
        pt(4, 8.4),
      ]),
      stroke([
        pt(11.4, 12),
        pt(14.2, 10.6),
        pt(18.2, 10.8),
        pt(20.2, 13.2),
        pt(20, 16.4),
        pt(17.2, 18.4),
        pt(13.6, 18.2),
        pt(12, 20.4),
        pt(12.8, 17.6),
        pt(11.4, 14.8),
        pt(11.4, 12),
      ]),
      stroke([pt(8, 8.8), pt(8.7, 8.8)]),
      stroke([pt(11.4, 8.8), pt(12.1, 8.8)]),
      stroke([pt(15.6, 13.8), pt(16.3, 13.8)]),
      stroke([pt(18.2, 13.8), pt(18.9, 13.8)]),
    ].join(' ')
  }

  if (resolved === 'github') {
    // Shifted down vs v6 so ears/chin sit in [4,4]–[20,20], not top-heavy.
    return [
      stroke([pt(7.2, 8.6), pt(5.5, 4.4), pt(10.6, 6.8)]),
      stroke([pt(16.8, 8.6), pt(18.5, 4.4), pt(13.4, 6.8)]),
      stroke([
        pt(6, 9.4),
        pt(8.8, 7),
        pt(12, 6.4),
        pt(15.2, 7),
        pt(18, 9.4),
        pt(18.8, 12.6),
        pt(18.2, 16),
        pt(15.4, 18.6),
        pt(12, 19.4),
        pt(8.6, 18.6),
        pt(5.8, 16),
        pt(5.2, 12.6),
        pt(6, 9.4),
      ]),
      stroke([pt(8.6, 12.2), pt(9.8, 12.2)]),
      stroke([pt(14.2, 12.2), pt(15.4, 12.2)]),
      stroke([pt(9.4, 15.4), pt(12, 17), pt(14.6, 15.4)]),
    ].join(' ')
  }

  if (resolved === 'podcast') {
    // Wave fills content frame vertically (~y 5–19), center y=12
    return stroke([
      pt(3.2, 12),
      pt(5.8, 5.8),
      pt(8.6, 18.2),
      pt(12, 5.2),
      pt(15.4, 18.2),
      pt(18.2, 5.8),
      pt(20.8, 12),
    ])
  }

  if (resolved === 'x') {
    return [
      stroke([pt(4.5, 4.5), pt(19.5, 19.5)]),
      stroke([pt(19.5, 4.5), pt(4.5, 19.5)]),
      stroke([pt(4.5, 4.5), pt(8.2, 4.5)]),
      stroke([pt(15.8, 19.5), pt(19.5, 19.5)]),
      stroke([pt(19.5, 4.5), pt(15.8, 4.5)]),
      stroke([pt(8.2, 19.5), pt(4.5, 19.5)]),
    ].join(' ')
  }

  if (resolved === 'instagram') {
    return [
      stroke([
        pt(5.4, 4.2),
        pt(18.6, 4.2),
        pt(19.8, 5.4),
        pt(19.8, 18.6),
        pt(18.6, 19.8),
        pt(5.4, 19.8),
        pt(4.2, 18.6),
        pt(4.2, 5.4),
        pt(5.4, 4.2),
      ]),
      stroke([
        pt(12, 8.2),
        pt(14.6, 9.2),
        pt(15.6, 12),
        pt(14.6, 14.8),
        pt(12, 15.8),
        pt(9.4, 14.8),
        pt(8.4, 12),
        pt(9.4, 9.2),
        pt(12, 8.2),
      ]),
      stroke([pt(17, 6.8), pt(17.6, 6.8)]),
    ].join(' ')
  }

  if (resolved === 'xiaohongshu') {
    return [
      stroke([
        pt(4.4, 4.8),
        pt(15.4, 4.8),
        pt(17, 6.4),
        pt(17, 19),
        pt(15.4, 20.2),
        pt(4.4, 20.2),
        pt(4.4, 4.8),
      ]),
      stroke([pt(7.2, 4.8), pt(7.2, 20.2)]),
      stroke([pt(9.4, 8.2), pt(14.4, 8.2)]),
      stroke([pt(9.4, 11.4), pt(14.4, 11.4)]),
      stroke([pt(9.4, 14.6), pt(12.6, 14.6)]),
      stroke([
        pt(17, 5.6),
        pt(20.2, 4.4),
        pt(20, 11.2),
        pt(17, 10),
      ]),
    ].join(' ')
  }

  if (resolved === 'clock') {
    // Loose round face; hour + minute hands with a slight bow.
    const cj = (n = 0.55) => j(n)
    return [
      stroke([
        pt(12, 4.4, 0.55),
        pt(15.8, 5.2, 0.55),
        pt(18.8, 7.8, 0.55),
        pt(19.6, 11.6, 0.55),
        pt(18.4, 15.6, 0.55),
        pt(15.2, 18.6, 0.55),
        pt(11.2, 19.6, 0.55),
        pt(7.2, 18.2, 0.55),
        pt(4.8, 14.8, 0.55),
        pt(4.6, 10.6, 0.55),
        pt(6.8, 6.6, 0.55),
        pt(12, 4.4, 0.55),
      ]),
      stroke([
        pt(12 + cj(0.2), 12 + cj(0.2)),
        pt(11.4 + cj(0.35), 9.4 + cj(0.35)),
        pt(12.1 + cj(0.25), 6.8 + cj(0.3)),
      ]),
      stroke([
        pt(12 + cj(0.2), 12 + cj(0.2)),
        pt(14.2 + cj(0.35), 13.2 + cj(0.35)),
        pt(16.8 + cj(0.3), 14.6 + cj(0.3)),
      ]),
    ].join(' ')
  }

  return [
    stroke([
      pt(12, 11.4),
      pt(8.6, 6.4),
      pt(4.4, 5),
      pt(3.4, 8.6),
      pt(5.6, 12.2),
      pt(9.4, 13.8),
      pt(12, 11.4),
    ]),
    stroke([
      pt(12, 11.4),
      pt(8.8, 14.6),
      pt(5.8, 17.4),
      pt(7.8, 19),
      pt(11.2, 16.2),
      pt(12, 13.4),
    ]),
    stroke([
      pt(12, 11.4),
      pt(15.4, 6.4),
      pt(19.6, 5),
      pt(20.6, 8.6),
      pt(18.4, 12.2),
      pt(14.6, 13.8),
      pt(12, 11.4),
    ]),
    stroke([
      pt(12, 11.4),
      pt(15.2, 14.6),
      pt(18.2, 17.4),
      pt(16.2, 19),
      pt(12.8, 16.2),
      pt(12, 13.4),
    ]),
    stroke([pt(12, 11.2), pt(12, 19.2)]),
  ].join(' ')
}

export function inkDotCluster(seed: string, count = 3): string[] {
  const rng = inkRng(`ink-dots:v1:${seed}`)
  const dots: string[] = []
  for (let i = 0; i < count; i++) {
    const cx = 4.4 + i * 9.8 + (rng() - 0.5) * 1.4
    const cy = 4 + (rng() - 0.5) * 1.6
    const rx = 1.45 + rng() * 0.95
    const ry = 1.2 + rng() * 0.95
    const rot = (rng() - 0.5) * 0.85
    dots.push(inkBlobPath(cx, cy, rx, ry, rot, rng))
  }
  return dots
}

function inkLerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

const COIL_SAMPLES = 22

/** Thin looping coil. ViewBox 0 0 16 16. Stroke only.
 *  `fill` 0 = a loose, incomplete or slightly overlapping rim; 1 = rough filled coil. */
export function inkCoilPath(seed: string, fill = 1): string {
  const t = Math.min(1, Math.max(0, fill))
  const rng = inkRng(`ink-coil:v10:${seed}`)
  const cx = 8 + (rng() - 0.5) * 0.22
  const cy = 8 + (rng() - 0.5) * 0.22
  const rot = (rng() - 0.5) * 0.55
  const ecc = inkLerp(0.76 + rng() * 0.22, 0.78 + rng() * 0.16, t)
  const turns = inkLerp(0.7 + rng() * 0.72, 2.35 + rng() * 0.4, t)
  const a0 = rng() * Math.PI * 2
  const rMean = inkLerp(5.75 + rng() * 0.3, 3.9 + rng() * 0.4, t)
  const breath = inkLerp(0.38 + rng() * 0.28, 1.7 + rng() * 0.45, t)
  const breathPhase = rng() * Math.PI * 2
  const wobble = inkLerp(0.32 + rng() * 0.22, 1.35 + rng() * 0.4, t)
  const wobblePhase = rng() * Math.PI * 2
  const grain = inkLerp(0.18 + rng() * 0.12, 0.55 + rng() * 0.22, t)
  const grainPhase = rng() * Math.PI * 2
  const drift = inkLerp(0.28 + rng() * 0.22, 1.45 + rng() * 0.4, t)
  const driftPhase = rng() * Math.PI * 2
  const driftTurns = inkLerp(0.2 + rng() * 0.12, 0.85 + rng() * 0.3, t)
  const stagger = inkLerp(0.05 + rng() * 0.04, 0.1 + rng() * 0.06, t)
  const staggerPhase = rng() * Math.PI * 2
  const rMin = inkLerp(4.5, 0.7, t)
  const cosR = Math.cos(rot)
  const sinR = Math.sin(rot)
  const pts: InkPt[] = []
  for (let i = 0; i <= COIL_SAMPLES; i++) {
    const u = i / COIL_SAMPLES
    const a = a0 + u * turns * Math.PI * 2
      + Math.sin(u * turns * Math.PI * 2 * 3 + staggerPhase) * stagger
    const r = Math.min(
      6.7,
      Math.max(
        rMin,
        rMean
        + Math.sin(a * 0.9 + breathPhase) * breath
        + Math.sin(a * 1.45 + wobblePhase) * wobble
        + Math.sin(a * 2.7 + grainPhase) * grain,
      ),
    )
    const ox = Math.cos(a0 + u * driftTurns * Math.PI * 2 + driftPhase) * drift
    const oy = Math.sin(a0 + u * driftTurns * Math.PI * 2 * 1.15 + driftPhase) * drift * 0.9
    const x = Math.cos(a) * r + ox
    const y = Math.sin(a) * r * ecc + oy
    pts.push([
      cx + x * cosR - y * sinR,
      cy + x * sinR + y * cosR,
    ])
  }
  return inkStrokePath(pts)
}

export function inkDotPath(seed: string, filled = true): string {
  return inkCoilPath(seed, filled ? 1 : 0)
}

/** Flattened waiting stain for a glyph box. ViewBox 0 0 24 24. */
export function inkWaitBlob(seed: string): string {
  const rng = inkRng(`ink-wait:v3:${seed}`)
  return inkBlobPath(
    12 + (rng() - 0.5) * 1.1,
    13.4 + (rng() - 0.5) * 0.6,
    11.2 + rng() * 2.2,
    2.15 + rng() * 1.05,
    (rng() - 0.5) * 0.18,
    rng,
    8,
  )
}

/** Same 8-point topology as inkWaitBlob, tightened toward a glyph. */
export function inkGlyphBlob(seed: string): string {
  const rng = inkRng(`ink-glyph:v3:${seed}`)
  return inkBlobPath(
    12 + (rng() - 0.5) * 0.45,
    13.1 + (rng() - 0.5) * 0.4,
    6.4 + rng() * 1.5,
    1.65 + rng() * 0.75,
    (rng() - 0.5) * 0.16,
    rng,
    8,
  )
}

export interface InkWaitSpot {
  seed: string
  left: number
  top: number
  width: number
  height: number
  rot: number
  opacity: number
}

export function inkWaitLayout(seed: string, count = 4): InkWaitSpot[] {
  const rng = inkRng(`ink-field:v3:${seed}`)
  const spots: InkWaitSpot[] = []
  for (let i = 0; i < count; i++) {
    spots.push({
      seed: `${seed}:${i}`,
      left: rng() * 16 - 4,
      top: 8 + rng() * 46,
      width: 16 + rng() * 18,
      height: 2.3 + rng() * 2.1,
      rot: (rng() - 0.5) * 12,
      opacity: 0.88 + rng() * 0.12,
    })
  }
  return spots
}

/** Wobbly checkbox frame. ViewBox 0 0 18 18. Stroke only. */
export function inkBoxPath(seed: string): string {
  const rng = inkRng(`ink-box:v1:${seed}`)
  const jitter = () => (rng() - 0.5) * 0.72
  const inset = 2.15
  const pts: InkPt[] = [
    [inset + jitter(), inset + jitter()],
    [18 - inset + jitter(), inset + jitter()],
    [18 - inset + jitter(), 18 - inset + jitter()],
    [inset + jitter(), 18 - inset + jitter()],
  ]
  pts.push(pts[0]!)
  return inkStrokePath(pts)
}

/** Hand-drawn check mark. ViewBox 0 0 18 18. Stroke only. */
export function inkTickPath(seed: string): string {
  const rng = inkRng(`ink-tick:v1:${seed}`)
  const jitter = () => (rng() - 0.5) * 0.5
  return inkStrokePath([
    [4.1 + jitter(), 9.1 + jitter()],
    [7.5 + jitter(), 12.7 + jitter()],
    [13.8 + jitter(), 5.2 + jitter()],
  ])
}

/** Hollow irregular ring. ViewBox 0 0 16 16. Stroke only. */
export function inkRingPath(seed: string): string {
  const rng = inkRng(`ink-ring:v1:${seed}`)
  const cx = 8 + (rng() - 0.5) * 0.4
  const cy = 8 + (rng() - 0.5) * 0.4
  const rx = 5.1 + rng() * 0.7
  const ry = 4.7 + rng() * 0.8
  const n = 8
  const pts: InkPt[] = []
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + (rng() - 0.5) * 0.22
    const j = 0.86 + rng() * 0.24
    pts.push([
      cx + Math.cos(a) * rx * j,
      cy + Math.sin(a) * ry * j,
    ])
  }
  pts.push(pts[0]!)
  return inkStrokePath(pts)
}

/** Small heart. ViewBox 0 0 18 18. Stroke only. */
export function inkHeartPath(seed: string): string {
  const rng = inkRng(`ink-heart:v1:${seed}`)
  const j = () => (rng() - 0.5) * 0.55
  return inkStrokePath([
    [9 + j(), 15.2 + j()],
    [3.2 + j(), 9.4 + j()],
    [3.6 + j(), 5.4 + j()],
    [7.1 + j(), 4.2 + j()],
    [9 + j(), 6.1 + j()],
    [10.9 + j(), 4.2 + j()],
    [14.4 + j(), 5.4 + j()],
    [14.8 + j(), 9.4 + j()],
    [9 + j(), 15.2 + j()],
  ])
}

/** Horizontal rule. ViewBox 0 0 120 8. Stroke only. */
export function inkRulePath(seed: string, width = 120, pad = 4): string {
  const rng = inkRng(`ink-rule:v1:${seed}`)
  const pts: InkPt[] = []
  const n = 5
  const span = Math.max(1, width - pad * 2)
  for (let i = 0; i <= n; i++) {
    pts.push([
      pad + (i / n) * span + (rng() - 0.5) * 1.4,
      4 + (rng() - 0.5) * 1.6,
    ])
  }
  return inkStrokePath(pts)
}

/** Closed wobbly rectangle. Coordinates in the caller's viewBox. */
export function inkWobbleBox(
  seed: string,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  jitter = 0.7,
  steps = 3,
): string {
  const rng = inkRng(`ink-wobble-box:v1:${seed}`)
  const j = () => (rng() - 0.5) * jitter * 2
  const pts: InkPt[] = []
  const edge = (ax: number, ay: number, bx: number, by: number, skipStart: boolean) => {
    for (let i = skipStart ? 1 : 0; i <= steps; i++) {
      const t = i / steps
      pts.push([
        ax + (bx - ax) * t + j(),
        ay + (by - ay) * t + j(),
      ])
    }
  }
  edge(x0, y0, x1, y0, false)
  edge(x1, y0, x1, y1, true)
  edge(x1, y1, x0, y1, true)
  edge(x0, y1, x0, y0, true)
  pts.push(pts[0]!)
  return inkStrokePath(pts)
}

/** Clipboard board. ViewBox 0 0 18 18. */
export function inkClipboardBoardPath(seed: string): string {
  return inkWobbleBox(`${seed}:board`, 4.1, 5.2, 13.9, 16.2, 0.42, 2)
}

/** Clipboard clip + slot. ViewBox 0 0 18 18. Stroke only. */
export function inkClipboardClipPath(seed: string): string {
  const rng = inkRng(`ink-clipboard:v1:${seed}`)
  const j = () => (rng() - 0.5) * 0.38
  return [
    inkStrokePath([
      [6.7 + j(), 5.4 + j()],
      [6.7 + j(), 2.5 + j()],
      [11.3 + j(), 2.5 + j()],
      [11.3 + j(), 5.4 + j()],
    ]),
    inkStrokePath([
      [7.6 + j(), 3.7 + j()],
      [10.4 + j(), 3.7 + j()],
    ]),
  ].join(' ')
}

/** Paper lines on the clipboard. ViewBox 0 0 18 18. */
export function inkClipboardLinesPath(seed: string): string {
  const rng = inkRng(`ink-clipboard-lines:v1:${seed}`)
  const j = () => (rng() - 0.5) * 0.38
  return [
    inkStrokePath([
      [6.2 + j(), 8.1 + j()],
      [11.8 + j(), 8.2 + j()],
    ]),
    inkStrokePath([
      [6.3 + j(), 10.5 + j()],
      [11.6 + j(), 10.4 + j()],
    ]),
    inkStrokePath([
      [6.2 + j(), 12.9 + j()],
      [10.2 + j(), 13.0 + j()],
    ]),
  ].join(' ')
}

/** Tick sitting on the clipboard paper. ViewBox 0 0 18 18. */
export function inkClipboardTickPath(seed: string): string {
  const rng = inkRng(`ink-clipboard-tick:v1:${seed}`)
  const j = () => (rng() - 0.5) * 0.32
  return inkStrokePath([
    [6.1 + j(), 10.3 + j()],
    [8.2 + j(), 12.6 + j()],
    [12.5 + j(), 7.6 + j()],
  ])
}

const TOKEN_RE = /[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*|\S|(\s+)/gu

export function inkTokens(text: string): string[] {
  return text.match(TOKEN_RE) ?? (text ? [text] : [])
}
