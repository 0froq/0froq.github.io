/** Stroke / boil numbers from `@oreo-design/doodle-icons` (data only — the package entry is React). */
export const DOODLE_STROKE = 3.4
export const DOODLE_BOIL = {
  amplitude: 4,
  duration: '0.86s',
  frequency: 0.055,
  octaves: 2,
  frames: 6,
} as const

const files = import.meta.glob<string>(
  '../../node_modules/@oreo-design/doodle-icons/icons/*.svg',
  { eager: true, query: '?raw', import: 'default' },
)

const PATH_D = /\bd="([^"]+)"/g

const pathsByName = new Map<string, string[]>()
for (const [file, raw] of Object.entries(files)) {
  const base = file.slice(file.lastIndexOf('/') + 1, -'.svg'.length)
  const paths = Array.from(raw.matchAll(PATH_D), match => match[1]!)
  if (paths.length)
    pathsByName.set(base, paths)
}

export function doodlePaths(name: string) {
  return pathsByName.get(name)
}
