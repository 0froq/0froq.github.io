/** Shared presence / progress constants (client). */

export const READ_THRESHOLD = 0.9
/** Count a site/page visit once reading progress reaches this ratio. */
export const VISIT_THRESHOLD = 0.3
export const HEARTBEAT_MS = 25_000
export const PROGRESS_LOCAL_THROTTLE_MS = 1_000
export const PROGRESS_SYNC_DEBOUNCE_MS = 5_000
/** Fallback if siteMeta.data is unavailable. */
export const SITE_LAUNCH_AT = '2024-01-01T00:00:00.000Z'

export const ANON_ID_KEY = 'froq_anon_id'
/** When true (default), logged-in users still heartbeat as anon:{anonId}. */
export const PRESENCE_AS_ANON_KEY = 'froq_presence_as_anon'
/** When true (default), show co-reader ghost dots on articles. */
export const GHOST_ENABLED_KEY = 'froq_ghost_enabled'
/** Throttle for ghost pointer WS messages. */
export const GHOST_POINTER_THROTTLE_MS = 80
/** Max relative viewport size gap before pointer ghosts fall back to progress. */
export const GHOST_VIEWPORT_MISMATCH = 0.2
export const PROGRESS_STORAGE_PREFIX = 'froq-reading-progress:'
