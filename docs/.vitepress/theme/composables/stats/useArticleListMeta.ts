import type { PageVisitRow } from './usePagePresence'
import { onMounted, readonly, ref, watch } from 'vue'
import { useGitHubAuth } from '~/composables/useGitHubAuth'
import { getReadAccessToken } from '~/composables/useGitHubDiscussions'
import { froqApiConfigured, froqFetch } from './froqApi'
import { usePagePresenceState } from './usePagePresence'

const TRAILING_SLASH_RE = /\/$/
const SLASHES_RE = /^\/+|\/+$/g
const COMMENT_CACHE_KEY = 'froq-article-comment-counts'
const COMMENT_CACHE_TTL_MS = 8 * 60 * 1000
const REPO_OWNER = '0froq'
const REPO_NAME = '0froq.github.io'
const PAGE_MARKER_PREFIX = '<!-- annotation-page: '

const commentCounts = ref<Record<string, number>>({})
const visitCounts = ref<Record<string, number>>({})
const commentsLoaded = ref(false)
const visitsLoaded = ref(false)

let commentsFetch: Promise<void> | null = null
let visitsFetch: Promise<void> | null = null

export function normalizeListPath(p: string): string {
  if (!p || p === '/')
    return '/'
  return p.replace(TRAILING_SLASH_RE, '') || '/'
}

/** Match annotation Discussion marker (no leading/trailing slash; home → index). */
export function toAnnotationPageKey(url: string): string {
  let p = url.replace(SLASHES_RE, '')
  if (!p)
    p = 'index'
  return p
}

interface CommentCachePayload {
  at: number
  counts: Record<string, number>
}

function readCommentCache(): Record<string, number> | null {
  if (typeof localStorage === 'undefined')
    return null
  try {
    const raw = localStorage.getItem(COMMENT_CACHE_KEY)
    if (!raw)
      return null
    const parsed = JSON.parse(raw) as CommentCachePayload
    if (!parsed?.at || Date.now() - parsed.at > COMMENT_CACHE_TTL_MS)
      return null
    return parsed.counts || null
  }
  catch {
    return null
  }
}

function writeCommentCache(counts: Record<string, number>): void {
  if (typeof localStorage === 'undefined')
    return
  localStorage.setItem(
    COMMENT_CACHE_KEY,
    JSON.stringify({ at: Date.now(), counts } satisfies CommentCachePayload),
  )
}

function indexPageVisits(rows: PageVisitRow[]): Record<string, number> {
  const map: Record<string, number> = {}
  for (const row of rows) {
    const key = normalizeListPath(row.pagePath)
    map[key] = Math.max(map[key] || 0, row.visits)
    map[row.pagePath] = row.visits
  }
  return map
}

async function fetchCommentCounts(token: string): Promise<Record<string, number>> {
  const query = `query($owner: String!, $name: String!, $cursor: String) {
    repository(owner: $owner, name: $name) {
      discussions(first: 50, after: $cursor, orderBy: { field: UPDATED_AT, direction: DESC }) {
        nodes {
          body
          comments { totalCount }
        }
        pageInfo { hasNextPage endCursor }
      }
    }
  }`

  const counts: Record<string, number> = {}
  let cursor: string | null = null

  for (;;) {
    const res = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: { owner: REPO_OWNER, name: REPO_NAME, cursor },
      }),
    })
    if (!res.ok)
      break
    const json = await res.json() as {
      data?: {
        repository?: {
          discussions?: {
            nodes: Array<{ body: string, comments: { totalCount: number } }>
            pageInfo: { hasNextPage: boolean, endCursor: string | null }
          }
        }
      }
      errors?: unknown[]
    }
    if (json.errors?.length)
      break

    const discussions = json.data?.repository?.discussions
    if (!discussions)
      break

    for (const node of discussions.nodes) {
      const idx = node.body.indexOf(PAGE_MARKER_PREFIX)
      if (idx === -1)
        continue
      const start = idx + PAGE_MARKER_PREFIX.length
      const end = node.body.indexOf(' -->', start)
      if (end === -1)
        continue
      const pageKey = node.body.slice(start, end).trim()
      if (!pageKey)
        continue
      counts[pageKey] = node.comments.totalCount
    }

    if (!discussions.pageInfo.hasNextPage)
      break
    cursor = discussions.pageInfo.endCursor
  }

  return counts
}

async function ensureVisits(presenceRows: PageVisitRow[]): Promise<void> {
  if (presenceRows.length) {
    visitCounts.value = indexPageVisits(presenceRows)
    visitsLoaded.value = true
    return
  }
  if (visitsFetch)
    return visitsFetch
  if (!froqApiConfigured())
    return

  visitsFetch = (async () => {
    const res = await froqFetch('/stats', { headers: { Accept: 'application/json' } })
    if (!res || !res.ok)
      return
    try {
      const data = await res.json() as { pageVisits?: PageVisitRow[] }
      if (Array.isArray(data.pageVisits)) {
        visitCounts.value = indexPageVisits(data.pageVisits)
        visitsLoaded.value = true
      }
    }
    catch {
      // ignore
    }
  })().finally(() => {
    visitsFetch = null
  })

  return visitsFetch
}

async function ensureComments(userToken: string | null | undefined): Promise<void> {
  if (commentsLoaded.value)
    return
  const cached = readCommentCache()
  if (cached) {
    commentCounts.value = cached
    commentsLoaded.value = true
    return
  }
  if (commentsFetch)
    return commentsFetch

  const access = getReadAccessToken(userToken)
  if (!access)
    return

  commentsFetch = (async () => {
    try {
      const counts = await fetchCommentCounts(access)
      commentCounts.value = counts
      writeCommentCache(counts)
      commentsLoaded.value = true
    }
    catch {
      // silent
    }
  })().finally(() => {
    commentsFetch = null
  })

  return commentsFetch
}

/**
 * Shared comment/visit maps for ArticleList meta columns.
 * Module-level caches so multiple lists on a page share one fetch.
 */
export function useArticleListMeta(options?: {
  comments?: boolean
  visits?: boolean
}) {
  const wantComments = options?.comments !== false
  const wantVisits = options?.visits !== false
  const presence = usePagePresenceState()
  const { token } = useGitHubAuth()

  onMounted(() => {
    if (wantVisits)
      void ensureVisits(presence.pageVisits.value)
    if (wantComments)
      void ensureComments(token.value)
  })

  if (wantVisits) {
    watch(
      () => presence.pageVisits.value,
      (rows) => {
        if (rows.length)
          visitCounts.value = indexPageVisits(rows)
      },
      { deep: true },
    )
  }

  function commentCountFor(url: string): number | null {
    if (!wantComments)
      return null
    const key = toAnnotationPageKey(url)
    const n = commentCounts.value[key]
    return typeof n === 'number' ? n : null
  }

  function visitCountFor(url: string): number | null {
    if (!wantVisits)
      return null
    const n = visitCounts.value[normalizeListPath(url)]
      ?? visitCounts.value[url]
      ?? visitCounts.value[`${normalizeListPath(url)}/`]
    return typeof n === 'number' ? n : null
  }

  return {
    commentCounts: readonly(commentCounts),
    visitCounts: readonly(visitCounts),
    commentCountFor,
    visitCountFor,
  }
}
