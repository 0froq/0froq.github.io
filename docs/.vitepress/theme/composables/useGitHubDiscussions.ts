import type {
  AnnotationData,
  AnnotationReactionContent,
  AnnotationReactionGroup,
  ResolvedAnnotation,
} from '../types/annotation'

const REPO_OWNER = '0froq'
const REPO_NAME = '0froq.github.io'
const GRAPHQL_URL = 'https://api.github.com/graphql'
const PAGE_MARKER_PREFIX = '<!-- annotation-page: '

const REACTION_FRAGMENT = `
  reactionGroups {
    content
    viewerHasReacted
    reactors { totalCount }
  }
`

/** Guest / fallback read PAT (public_repo or Discussions read). Prefer user OAuth when present. */
const READ_TOKEN = (import.meta.env.VITE_GITHUB_READ_TOKEN as string | undefined)?.trim() || ''

/**
 * Resolve GraphQL access token for read operations.
 * Prefer the signed-in user token; fall back to the public read token.
 */
export function getReadAccessToken(userToken: string | null | undefined): string | null {
  return userToken || READ_TOKEN || null
}

// ---- 内部 helpers ----

function makePageMarker(pagePath: string): string {
  return `${PAGE_MARKER_PREFIX}${pagePath} -->`
}

function parseDiscussionBody(body: string): string | null {
  const prefix = PAGE_MARKER_PREFIX
  const idx = body.indexOf(prefix)
  if (idx === -1)
    return null
  const start = idx + prefix.length
  const end = body.indexOf(' -->', start)
  if (end === -1)
    return null
  return body.slice(start, end)
}

function tryParseAnnotation(body: string): AnnotationData | null {
  try {
    const parsed = JSON.parse(body)
    // anchor 可空：文本批注有 anchor，文章级评论 anchor 为 null（'anchor' in 判断存在性）
    if (parsed && parsed.version === 1 && parsed.pagePath && 'anchor' in parsed && parsed.text)
      return parsed as AnnotationData
  }
  catch { /* not JSON */ }
  return null
}

/** 统一 GraphQL 请求 */
async function graphql<T>(
  query: string,
  token: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const url = GRAPHQL_URL
  const method = 'POST'
  let res: Response
  try {
    res = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
    })
  }
  catch (e) {
    console.error('[annotation] GraphQL 网络请求失败:', e)
    throw e
  }

  let data: any
  try {
    data = await res.json()
  }
  catch (e) {
    console.error(`[annotation] GraphQL 响应解析失败 (HTTP ${res.status}):`, e)
    throw new Error(`GraphQL 响应解析失败 (HTTP ${res.status})`)
  }

  if (!res.ok) {
    console.error(`[annotation] GraphQL HTTP ${res.status}:`, JSON.stringify(data).slice(0, 300))
  }

  if (data.errors?.length) {
    console.error('[annotation] GraphQL 错误:', data.errors)
    throw new Error(data.errors[0].message || 'GraphQL 请求失败')
  }
  return data.data as T
}

// ---- Discussion 管理 ----

/** 按页面 marker 查找 Discussion（GraphQL），返回 {number, id, reactions} */
async function findDiscussionByPage(
  pagePath: string,
  token: string,
): Promise<{ number: number, id: string, reactions: AnnotationReactionGroup[] } | null> {
  const query = `query($owner: String!, $name: String!, $cursor: String) {
    repository(owner: $owner, name: $name) {
      discussions(first: 100, after: $cursor) {
        nodes {
          number
          id
          body
          ${REACTION_FRAGMENT}
        }
        pageInfo { hasNextPage endCursor }
      }
    }
  }`

  let cursor: string | null = null
  for (;;) {
    const data = await graphql<{
      repository: {
        discussions: {
          nodes: Array<{
            number: number
            id: string
            body: string
            reactionGroups: Array<{
              content: string
              viewerHasReacted: boolean
              reactors: { totalCount: number }
            }>
          }>
          pageInfo: { hasNextPage: boolean, endCursor: string | null }
        }
      }
    }>(query, token, { owner: REPO_OWNER, name: REPO_NAME, cursor })

    const { nodes, pageInfo } = data.repository.discussions
    for (const d of nodes) {
      if (parseDiscussionBody(d.body) === pagePath) {
        return {
          number: d.number,
          id: d.id,
          reactions: parseReactionGroups(d.reactionGroups),
        }
      }
    }
    if (!pageInfo.hasNextPage || !pageInfo.endCursor)
      return null
    cursor = pageInfo.endCursor
  }
}

/** 获取仓库 repositoryId 与默认 categoryId（GraphQL，仅创建时调用） */
async function fetchRepoIds(token: string): Promise<{ repositoryId: string, categoryId: string }> {
  const query = `query($owner: String!, $name: String!) {
    repository(owner: $owner, name: $name) {
      id
      discussionCategories(first: 10) {
        nodes { id name }
      }
    }
  }`
  const data = await graphql<{
    repository: {
      id: string
      discussionCategories: { nodes: Array<{ id: string, name: string }> }
    }
  }>(query, token, { owner: REPO_OWNER, name: REPO_NAME })

  const categories = data.repository.discussionCategories.nodes
  // 优先 General，回退第一个
  const cat = categories.find(c => c.name === 'General') || categories[0]
  if (!cat)
    throw new Error('仓库没有可用的 Discussion category')
  return { repositoryId: data.repository.id, categoryId: cat.id }
}

async function createDiscussion(
  pagePath: string,
  title: string,
  token: string,
): Promise<{ number: number, id: string, reactions: AnnotationReactionGroup[] }> {
  const { repositoryId, categoryId } = await fetchRepoIds(token)

  const body = `${makePageMarker(pagePath)}\n\n此 Discussion 用于存储页面 [${pagePath}](https://0froq.github.io/${pagePath}) 的批注。`
  const query = `mutation($input: CreateDiscussionInput!) {
    createDiscussion(input: $input) {
      discussion { id number }
    }
  }`
  const data = await graphql<{ createDiscussion: { discussion: { id: string, number: number } } }>(
    query,
    token,
    {
      input: {
        repositoryId,
        categoryId,
        title,
        body,
      },
    },
  )
  return {
    ...data.createDiscussion.discussion,
    reactions: [],
  }
}

async function findOrCreateDiscussion(
  pagePath: string,
  title: string,
  token: string,
): Promise<{ number: number, id: string, reactions: AnnotationReactionGroup[] }> {
  const existing = await findDiscussionByPage(pagePath, token)
  if (existing !== null)
    return existing
  return createDiscussion(pagePath, title, token)
}

function parseReactionGroups(
  groups: Array<{
    content: string
    viewerHasReacted: boolean
    reactors: { totalCount: number }
  }> | null | undefined,
): AnnotationReactionGroup[] {
  if (!groups?.length)
    return []
  return groups
    .filter(g => g.reactors.totalCount > 0 || g.viewerHasReacted)
    .map(g => ({
      content: g.content as AnnotationReactionContent,
      count: g.reactors.totalCount,
      viewerHasReacted: g.viewerHasReacted,
    }))
}

function mapCommentNode(
  c: {
    id: string
    url: string
    body: string
    author: { login: string, avatarUrl: string } | null
    createdAt: string
    reactionGroups?: Array<{
      content: string
      viewerHasReacted: boolean
      reactors: { totalCount: number }
    }>
  },
  parentCommentId: string | null,
): ResolvedAnnotation | null {
  const ann = tryParseAnnotation(c.body)
  if (!ann)
    return null
  return {
    commentId: c.id,
    parentCommentId,
    commentUrl: c.url,
    author: {
      login: c.author?.login ?? 'unknown',
      avatarUrl: c.author?.avatarUrl ?? '',
    },
    data: ann,
    domRange: null,
    matchState: 'stale',
    reactions: parseReactionGroups(c.reactionGroups),
  }
}

// ---- Annotation CRUD ----

async function getAnnotations(
  discussionNumber: number,
  token: string,
): Promise<ResolvedAnnotation[]> {
  const query = `query($owner: String!, $name: String!, $number: Int!) {
    repository(owner: $owner, name: $name) {
      discussion(number: $number) {
        comments(first: 100) {
          nodes {
            id
            url
            body
            author { login avatarUrl }
            createdAt
            ${REACTION_FRAGMENT}
            replies(first: 100) {
              nodes {
                id
                url
                body
                author { login avatarUrl }
                createdAt
                ${REACTION_FRAGMENT}
              }
            }
          }
        }
      }
    }
  }`
  const data = await graphql<{
    repository: {
      discussion: {
        comments: {
          nodes: Array<{
            id: string
            url: string
            body: string
            author: { login: string, avatarUrl: string } | null
            createdAt: string
            reactionGroups: Array<{
              content: string
              viewerHasReacted: boolean
              reactors: { totalCount: number }
            }>
            replies: {
              nodes: Array<{
                id: string
                url: string
                body: string
                author: { login: string, avatarUrl: string } | null
                createdAt: string
                reactionGroups: Array<{
                  content: string
                  viewerHasReacted: boolean
                  reactors: { totalCount: number }
                }>
              }>
            }
          }>
        }
      }
    }
  }>(query, token, { owner: REPO_OWNER, name: REPO_NAME, number: discussionNumber })

  const annotations: ResolvedAnnotation[] = []
  for (const c of data.repository.discussion.comments.nodes) {
    const top = mapCommentNode(c, null)
    if (top)
      annotations.push(top)
    for (const r of c.replies.nodes) {
      const reply = mapCommentNode(r, c.id)
      if (reply)
        annotations.push(reply)
    }
  }
  return annotations
}

async function toggleReaction(
  subjectId: string,
  content: AnnotationReactionContent,
  remove: boolean,
  token: string,
): Promise<AnnotationReactionGroup[]> {
  const mutation = remove
    ? `mutation($input: RemoveReactionInput!) {
        removeReaction(input: $input) {
          subject {
            ... on Reactable {
              reactionGroups {
                content
                viewerHasReacted
                reactors { totalCount }
              }
            }
          }
        }
      }`
    : `mutation($input: AddReactionInput!) {
        addReaction(input: $input) {
          subject {
            ... on Reactable {
              reactionGroups {
                content
                viewerHasReacted
                reactors { totalCount }
              }
            }
          }
        }
      }`

  const data = await graphql<{
    addReaction?: {
      subject: {
        reactionGroups: Array<{
          content: string
          viewerHasReacted: boolean
          reactors: { totalCount: number }
        }>
      }
    }
    removeReaction?: {
      subject: {
        reactionGroups: Array<{
          content: string
          viewerHasReacted: boolean
          reactors: { totalCount: number }
        }>
      }
    }
  }>(mutation, token, {
    input: { subjectId, content },
  })

  const groups = (remove ? data.removeReaction : data.addReaction)?.subject.reactionGroups
  return parseReactionGroups(groups)
}

async function createAnnotation(
  discussionId: string,
  data: AnnotationData,
  token: string,
  replyToId?: string,
): Promise<string> {
  const query = `mutation($input: AddDiscussionCommentInput!) {
    addDiscussionComment(input: $input) {
      comment { id }
    }
  }`
  const result = await graphql<{ addDiscussionComment: { comment: { id: string } } }>(
    query,
    token,
    {
      input: {
        discussionId,
        body: JSON.stringify(data),
        ...(replyToId ? { replyToId } : {}),
      },
    },
  )
  return result.addDiscussionComment.comment.id
}

async function updateAnnotation(
  commentId: string,
  data: Partial<AnnotationData>,
  token: string,
): Promise<void> {
  const query = `mutation($input: UpdateDiscussionCommentInput!) {
    updateDiscussionComment(input: $input) {
      comment { id }
    }
  }`
  await graphql(
    query,
    token,
    {
      input: {
        commentId,
        body: JSON.stringify(data),
      },
    },
  )
}

// ---- 导出 ----

export function useGitHubDiscussions() {
  return {
    /** Lookup only — does not create a Discussion. */
    findDiscussion: findDiscussionByPage,
    findOrCreateDiscussion,
    getAnnotations,
    createAnnotation,
    updateAnnotation,
    toggleReaction,
  }
}
