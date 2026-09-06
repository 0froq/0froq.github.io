import { findCorpusLayer, findPostLayer, hubListingRoot } from '~/utils/layers'

export type ArticleBack = { to: string, label: string }

export function useIssueArticleReturn() {
  const returnTo = useState<string | null>('issue-article-return', () => null)

  function remember(path: string) {
    if (!hubListingRoot(path))
      return
    returnTo.value = path
  }

  function clear() {
    returnTo.value = null
  }

  function resolveArticleBack(currentPath: string): string {
    return issueArticleBackTo(currentPath, returnTo.value)
  }

  return { returnTo, remember, clear, resolveArticleBack }
}

function issueArticleBackTo(currentPath: string, saved: string | null): string {
  if (saved && hubListingRoot(saved))
    return saved
  return issueArticleFallback(currentPath)
}

export function issueArticleFallback(path: string): string {
  const parts = path.split('/').filter(Boolean)
  if (parts.length >= 2 && (parts[0] === 'posts' || parts[0] === 'corpus'))
    return `/${parts[0]}/${parts[1]}`
  if (parts[0] === 'posts')
    return '/posts'
  if (parts[0] === 'corpus')
    return '/corpus'
  return '/'
}

export function labelForArticleBack(to: string): string {
  const pathname = to.split(/[?#]/, 1)[0] ?? to
  const parts = pathname.split('/').filter(Boolean)
  if (parts.length === 0)
    return 'Home'
  const root = parts[0]
  const slug = parts[1]
  if (root === 'posts') {
    if (!slug)
      return 'Posts'
    return findPostLayer(slug)?.label ?? slug
  }
  if (root === 'corpus') {
    if (!slug)
      return 'Corpus'
    return findCorpusLayer(slug)?.label ?? slug
  }
  return 'Home'
}

export function resolveArticleBackTarget(currentPath: string): ArticleBack {
  const saved = useState<string | null>('issue-article-return').value
  const to = issueArticleBackTo(currentPath, saved)
  return { to, label: labelForArticleBack(to) }
}
