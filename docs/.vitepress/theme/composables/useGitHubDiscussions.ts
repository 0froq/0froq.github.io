import type { AnnotationData, ResolvedAnnotation } from '../types/annotation'

const REPO_OWNER = '0froq'
const REPO_NAME = '0froq.github.io'
const API_BASE = 'https://api.github.com'
const PAGE_MARKER_PREFIX = '<!-- annotation-page: '

// ---- 内部 helpers ----

function headers(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
  }
}

function makePageMarker(pagePath: string): string {
  return `${PAGE_MARKER_PREFIX}${pagePath} -->`
}

function parseDiscussionBody(body: string): string | null {
  const prefix = PAGE_MARKER_PREFIX
  const idx = body.indexOf(prefix)
  if (idx === -1) return null
  const start = idx + prefix.length
  const end = body.indexOf(' -->', start)
  if (end === -1) return null
  return body.slice(start, end)
}

function tryParseAnnotation(body: string): AnnotationData | null {
  try {
    const parsed = JSON.parse(body)
    if (parsed && parsed.version === 1 && parsed.pagePath && parsed.anchor && parsed.text) {
      return parsed as AnnotationData
    }
  }
  catch { /* not JSON */ }
  return null
}

// ---- Discussion 管理 ----

async function findDiscussionByPage(
  pagePath: string,
  token: string,
): Promise<number | null> {
  const res = await fetch(
    `${API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/discussions?per_page=100`,
    { headers: headers(token) },
  )
  if (!res.ok) return null

  const discussions: any[] = await res.json()
  for (const d of discussions) {
    if (d.body && parseDiscussionBody(d.body) === pagePath) {
      return d.number
    }
  }
  return null
}

async function createDiscussion(
  pagePath: string,
  title: string,
  token: string,
): Promise<number> {
  // 先获取 category ID
  const catRes = await fetch(
    `${API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/discussions/categories`,
    { headers: headers(token) },
  )
  if (!catRes.ok) throw new Error('无法获取 Discussion categories')
  const categories: any[] = await catRes.json()
  const catId = categories[0]?.node_id
  if (!catId) throw new Error('没有可用的 Discussion category')

  const body = `${makePageMarker(pagePath)}\n\n此 Discussion 用于存储页面 [${pagePath}](https://0froq.github.io/${pagePath}) 的批注。`

  const res = await fetch(
    `${API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/discussions`,
    {
      method: 'POST',
      headers: { ...headers(token), 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, body, category_id: catId }),
    },
  )
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`创建 Discussion 失败: ${res.status} ${JSON.stringify(err)}`)
  }
  const data = await res.json()
  return data.number
}

async function findOrCreateDiscussion(
  pagePath: string,
  title: string,
  token: string,
): Promise<number> {
  const existing = await findDiscussionByPage(pagePath, token)
  if (existing !== null) return existing
  return createDiscussion(pagePath, title, token)
}

// ---- Annotation CRUD ----

async function getAnnotations(
  discussionNumber: number,
  token: string,
): Promise<ResolvedAnnotation[]> {
  const res = await fetch(
    `${API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/discussions/${discussionNumber}/comments?per_page=100`,
    { headers: headers(token) },
  )
  if (!res.ok) return []

  const comments: any[] = await res.json()
  const annotations: ResolvedAnnotation[] = []

  for (const c of comments) {
    const data = tryParseAnnotation(c.body)
    if (!data) continue

    annotations.push({
      commentId: c.id,
      commentUrl: c.html_url,
      author: {
        login: c.user?.login ?? 'unknown',
        avatarUrl: c.user?.avatar_url ?? '',
      },
      data,
      domRange: null, // 后续由 highlight 填充
    })
  }

  return annotations
}

async function createAnnotation(
  discussionNumber: number,
  data: AnnotationData,
  token: string,
): Promise<number> {
  const res = await fetch(
    `${API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/discussions/${discussionNumber}/comments`,
    {
      method: 'POST',
      headers: { ...headers(token), 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: JSON.stringify(data, null, 2) }),
    },
  )
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`创建批注失败: ${res.status} ${JSON.stringify(err)}`)
  }
  const result = await res.json()
  return result.id
}

async function updateAnnotation(
  commentId: number,
  data: Partial<AnnotationData>,
  token: string,
): Promise<void> {
  await fetch(
    `${API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/discussions/comments/${commentId}`,
    {
      method: 'PATCH',
      headers: { ...headers(token), 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: JSON.stringify(data, null, 2) }),
    },
  )
}

// ---- 导出 ----

export function useGitHubDiscussions() {
  return {
    findOrCreateDiscussion,
    getAnnotations,
    createAnnotation,
    updateAnnotation,
  }
}
