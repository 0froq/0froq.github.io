export type VisitorNoteColor = 'yellow' | 'red' | 'blue' | 'green'

export interface VisitorNote {
  id: string
  /** Pixel cache (derived from xr/yr × current shell); kept for drag UX. */
  x: number
  y: number
  /**
   * Position as a fraction of the movable range:
   * xr = x / max(1, shellW - noteW), yr = y / max(1, shellH - noteH).
   * Source of truth across viewport resizes — right-edge notes stay on the right.
   */
  xr: number
  yr: number
  w: number
  h: number
  text: string
  color: VisitorNoteColor
  z: number
  updatedAt: string
}

export const VISITOR_NOTES_MAX_PER_PATH = 12
export const VISITOR_NOTE_DEFAULT_WIDTH = 240
export const VISITOR_NOTE_DEFAULT_HEIGHT = 180
export const VISITOR_NOTE_MIN_WIDTH = 168
export const VISITOR_NOTE_MIN_HEIGHT = 120
export const VISITOR_NOTES_STORAGE_PREFIX = 'visitor-notes:'

export const VISITOR_NOTE_COLORS: readonly VisitorNoteColor[] = [
  'yellow',
  'red',
  'blue',
  'green',
] as const

export const VISITOR_NOTE_COLOR_LABELS: Record<VisitorNoteColor, { zh: string, en: string }> = {
  yellow: { zh: '鹅黄', en: 'Yellow' },
  red: { zh: '绯红', en: 'Red' },
  blue: { zh: '天青', en: 'Blue' },
  green: { zh: '竹绿', en: 'Green' },
}

/**
 * UnoCSS attributify values for PaperEdgeSurface / color dots.
 * Dynamic `:un-fill` / `:un-bg` only work after a zero-size static scan
 * anchor in the .vue template has forced these utilities into the CSS build.
 */
export const VISITOR_NOTE_COLOR_STYLES: Record<VisitorNoteColor, {
  fill: string
  stroke: string
  /** Brighter stroke used while hovered / dragging (selection cue). */
  strokeActive: string
  bg: string
}> = {
  yellow: {
    fill: 'amber-50/70 dark:amber-950/55',
    stroke: 'amber-300/50 dark:amber-700/50',
    strokeActive: 'amber-400/80 dark:amber-500/80',
    bg: 'amber-300 dark:amber-500',
  },
  red: {
    fill: 'rose-50/70 dark:rose-950/55',
    stroke: 'rose-300/50 dark:rose-700/50',
    strokeActive: 'rose-400/80 dark:rose-500/80',
    bg: 'rose-300 dark:rose-500',
  },
  blue: {
    fill: 'sky-50/70 dark:sky-950/55',
    stroke: 'sky-300/50 dark:sky-700/50',
    strokeActive: 'sky-400/80 dark:sky-500/80',
    bg: 'sky-300 dark:sky-500',
  },
  green: {
    fill: 'emerald-50/70 dark:emerald-950/55',
    stroke: 'emerald-300/50 dark:emerald-700/50',
    strokeActive: 'emerald-400/80 dark:emerald-500/80',
    bg: 'emerald-300 dark:emerald-500',
  },
}

/** Migrate palettes from earlier versions to the classic four. */
export function normalizeNoteColor(value: unknown): VisitorNoteColor {
  switch (value) {
    case 'red':
    case 'rose':
      return 'red'
    case 'blue':
    case 'sky':
      return 'blue'
    case 'green':
    case 'mint':
      return 'green'
    case 'yellow':
    case 'sun':
    case 'paper':
    case 'violet':
    default:
      return 'yellow'
  }
}

export function randomNoteColor(): VisitorNoteColor {
  return VISITOR_NOTE_COLORS[Math.floor(Math.random() * VISITOR_NOTE_COLORS.length)]!
}
