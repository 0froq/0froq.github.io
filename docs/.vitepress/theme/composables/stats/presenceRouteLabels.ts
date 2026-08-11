/**
 * Display labels for non-article routes in 「正在发生」.
 * Matched by longest path prefix (after exact article title lookup fails).
 * Values are vue-i18n message keys under `stats.*`.
 */
export const PRESENCE_ROUTE_LABEL_KEYS: Record<string, string> = {
  '/': 'stats.presenceRouteHome',
  '/en/': 'stats.presenceRouteHome',
  '/dashboard/': 'stats.presenceRouteDashboard',
  '/tags/': 'stats.presenceRouteTags',
  '/posts/': 'stats.presenceRoutePosts',
  '/corpus/': 'stats.presenceRouteCorpus',
}

/** Longest-prefix match → i18n key, or null if no route label applies. */
export function resolvePresenceRouteLabelKey(path: string): string | null {
  let best: string | null = null
  let bestLen = -1
  for (const [prefix, key] of Object.entries(PRESENCE_ROUTE_LABEL_KEYS)) {
    if (path === prefix || path.startsWith(prefix)) {
      if (prefix.length > bestLen) {
        best = key
        bestLen = prefix.length
      }
    }
  }
  return best
}

/** Resolve a localized label via `t`; null when path has no special route label. */
export function resolvePresenceRouteLabel(
  path: string,
  t: (key: string) => string,
): string | null {
  const key = resolvePresenceRouteLabelKey(path)
  return key ? t(key) : null
}
