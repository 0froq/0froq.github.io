/** Shared presence / progress constants (client). */

export const READ_THRESHOLD = 0.9
export const HEARTBEAT_MS = 25_000
export const PROGRESS_LOCAL_THROTTLE_MS = 1_000
export const PROGRESS_SYNC_DEBOUNCE_MS = 5_000
/** Fallback if siteMeta.data is unavailable. */
export const SITE_LAUNCH_AT = '2024-01-01T00:00:00.000Z'

export const ANON_ID_KEY = 'froq_anon_id'
export const PROGRESS_STORAGE_PREFIX = 'froq-reading-progress:'
