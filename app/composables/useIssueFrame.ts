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
      if (prev && isIssueArticlePath(prev) && isIssueArticlePath(next))
        clear()
    },
  )

  watch(
    () => toValue(title),
    (next) => {
      articleTitle.value = next?.trim() || null
    },
    { immediate: true },
  )

  onBeforeUnmount(() => {
    if (!isIssueArticlePath(route.path))
      articleTitle.value = null
  })
}

export function useIssueFrame() {
  const route = useRoute()
  const articleTitle = useIssueArticleTitle()
  const sectionSlug = computed(() => route.path.split('/').filter(Boolean)[0] ?? '')
  const publication = computed(() => findPublicationSection(sectionSlug.value) ?? null)

  const isHome = computed(() => route.path === '/')
  const section = computed(() => publication.value?.slug ?? (route.path.startsWith('/dashboard') ? 'dashboard' : 'home'))
  const isArticle = computed(() => isIssueArticlePath(route.path))
  const isHub = computed(() => Boolean(publication.value) && !isArticle.value)

  return { section, publication, isHome, isHub, isArticle, articleTitle }
}
