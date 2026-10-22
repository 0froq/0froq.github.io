export function useIssueArticleTitle() {
  return useState<string | null>('issue-article-title', () => null)
}

function isIssueArticlePath(path: string) {
  const parts = path.split('/').filter(Boolean)
  return parts.length >= 2 && Boolean(findPublicationSection(parts[0]!))
}

/** Bind the current page title into the shared masthead. Clears on leave. */
export function useIssueArticleMast(title: MaybeRefOrGetter<string | undefined>) {
  const articleTitle = useIssueArticleTitle()
  const route = useRoute()
  const { clear } = useIssueArticleReturn()

  watch(
    () => route.path,
    (next, prev) => {
      if (prev && isIssueArticlePath(prev) && isIssueArticlePath(next)) clear()
    },
  )

  watch(
    () => toValue(title),
    next => {
      articleTitle.value = next?.trim() || null
    },
    { immediate: true },
  )

  onBeforeUnmount(() => {
    if (!isIssueArticlePath(route.path)) articleTitle.value = null
  })
}

export type IssueSheetChrome = 'article' | 'hub'

/** Leaving sheet, held until its fade finishes so the frame does not swap mid-transition. */
export function useIssueSheetChrome() {
  return useState<IssueSheetChrome | null>('issue-sheet-chrome', () => null)
}

export function releaseIssueSheetChrome() {
  const chrome = useIssueSheetChrome()
  if (chrome.value !== null) chrome.value = null
}

export function useIssueFrame() {
  const route = useRoute()
  const articleTitle = useIssueArticleTitle()
  const sheetChrome = useIssueSheetChrome()
  const sectionSlug = computed(() => route.path.split('/').filter(Boolean)[0] ?? '')
  const publication = computed(() => findPublicationSection(sectionSlug.value) ?? null)

  const isHome = computed(() => route.path === '/')
  const section = computed(
    () => publication.value?.slug ?? (route.path.startsWith('/dashboard') ? 'dashboard' : 'home'),
  )
  const routeIsArticle = computed(() => isIssueArticlePath(route.path))
  const routeIsHub = computed(() => Boolean(publication.value) && !routeIsArticle.value)
  const isArticle = computed(
    () => sheetChrome.value === 'article' || (sheetChrome.value == null && routeIsArticle.value),
  )
  const isHub = computed(
    () => sheetChrome.value === 'hub' || (sheetChrome.value == null && routeIsHub.value),
  )

  return { section, publication, isHome, isHub, isArticle, articleTitle }
}
