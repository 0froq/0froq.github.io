export interface ActivityProcess {
  name: string
  windowTitle: string
  iconUrl: string
}

export interface ActivityMedia {
  coverImg: string
  title: string
  artist?: string
  duration?: number
  elapsedTime?: number
  processName?: string
}

export interface Activity {
  active: boolean
  timestamp?: string
  updatedAt?: string
  process?: ActivityProcess | null
  media?: ActivityMedia | null
}

export const ACTIVITY_STALE_MS = 5 * 60 * 1000

function asString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined
}

function parseProcess(raw: unknown): ActivityProcess | null {
  if (!raw || typeof raw !== 'object')
    return null
  const row = raw as Record<string, unknown>
  const name = asString(row.name)
  if (!name)
    return null
  return {
    name,
    windowTitle: asString(row.windowTitle) ?? '',
    iconUrl: asString(row.iconUrl) ?? '',
  }
}

function parseMedia(raw: unknown): ActivityMedia | null {
  if (!raw || typeof raw !== 'object')
    return null
  const row = raw as Record<string, unknown>
  const coverImg = asString(row.coverImg)
  const title = asString(row.title)
  if (!coverImg || !title)
    return null
  return {
    coverImg,
    title,
    artist: asString(row.artist),
    duration: typeof row.duration === 'number' ? row.duration : undefined,
    elapsedTime: typeof row.elapsedTime === 'number' ? row.elapsedTime : undefined,
    processName: asString(row.processName),
  }
}

export function parseActivity(raw: unknown): Activity {
  if (!raw || typeof raw !== 'object')
    return { active: false }
  const row = raw as Record<string, unknown>
  return {
    active: row.active === true,
    timestamp: asString(row.timestamp),
    updatedAt: asString(row.updatedAt),
    process: parseProcess(row.process),
    media: parseMedia(row.media),
  }
}

export function activityIsSleeping(activity: Activity, now = Date.now()): boolean {
  if (!activity.timestamp)
    return true
  const stamp = new Date(activity.timestamp).getTime()
  if (Number.isNaN(stamp))
    return true
  return now - stamp > ACTIVITY_STALE_MS
}
