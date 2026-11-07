/** Stroke / boil numbers from `@oreo-design/doodle-icons` (data only — the package entry is React). */
export const DOODLE_STROKE = 3.4
export const DOODLE_BOIL = {
  amplitude: 4,
  duration: '0.86s',
  frequency: 0.055,
  octaves: 2,
  frames: 6,
} as const

const files = import.meta.glob<string>('../../node_modules/@oreo-design/doodle-icons/icons/*.svg', {
  eager: true,
  query: '?raw',
  import: 'default',
})

const PATH_D = /\bd="([^"]+)"/g
const COORD = /-?\d*\.?\d+(?:e[+-]?\d+)?/gi

export interface DoodleIcon {
  paths: string[]
  /** Square viewBox cropped to the ink bounds, bottom edge = stroke bottom. */
  viewBox: string
  vb: { x: number; y: number; size: number }
}

/* Doodle artwork leaves ~19% padding inside the 48x48 canvas. Crop the viewBox
 * to the ink bbox (square, ink bottom flush with viewBox bottom) so a 1em svg
 * sits its ink directly on the text baseline — no margin/translate hacks. */
function cropViewBox(paths: string[]): DoodleIcon['vb'] {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const d of paths) {
    const nums = (d.match(COORD) ?? []).map(Number)
    for (let i = 0; i + 1 < nums.length; i += 2) {
      const [x, y] = [nums[i], nums[i + 1]] as [number, number]
      if (x < minX) minX = x
      if (x > maxX) maxX = x
      if (y < minY) minY = y
      if (y > maxY) maxY = y
    }
  }
  const pad = DOODLE_STROKE / 2
  const size = Math.max(maxX - minX, maxY - minY) + pad * 2
  const x = (minX + maxX) / 2 - size / 2
  const y = maxY + pad - size
  return { x, y, size }
}

const iconsByName = new Map<string, DoodleIcon>()
for (const [file, raw] of Object.entries(files)) {
  const base = file.slice(file.lastIndexOf('/') + 1, -'.svg'.length)
  const paths = Array.from(raw.matchAll(PATH_D), match => match[1] ?? '')
  if (!paths.length) continue
  const vb = cropViewBox(paths)
  iconsByName.set(base, {
    paths,
    vb,
    viewBox: `${vb.x} ${vb.y} ${vb.size} ${vb.size}`,
  })
}

export function doodleIcon(name: string) {
  return iconsByName.get(name)
}
