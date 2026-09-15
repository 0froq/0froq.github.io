import { findPublicationSection, publicationRoot } from '~/utils/layers'

export interface ArticleBack { to: string, label: string }

export function useIssueArticleReturn() {
  const returnTo = useState<string | null>('issue-article-return', () => null)

  function remember(path: string) {
    if (!publicationRoot(path))
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
  if (saved && publicationRoot(saved))
    return saved
  return issueArticleFallback(currentPath)
}

export function issueArticleFallback(path: string): string {
  const section = path.split('/').filter(Boolean)[0]
  return section && findPublicationSection(section) ? `/${section}` : '/'
}

export function labelForArticleBack(to: string): string {
  const section = to.split(/[?#]/, 1)[0]?.split('/').filter(Boolean)[0]
  if (!section)
    return 'Home'
  return findPublicationSection(section)?.label ?? 'Home'
}

export function resolveArticleBackTarget(currentPath: string): ArticleBack {
  const saved = useState<string | null>('issue-article-return').value
  const to = issueArticleBackTo(currentPath, saved)
  return { to, label: labelForArticleBack(to) }
}
