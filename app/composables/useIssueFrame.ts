export function useIssueArticleTitle() {
  return useState<string | null>('issue-article-title', () => null)
}

/** Bind the current page title into the shared masthead. Clears on leave. */
export function useIssueArticleMast(title: MaybeRefOrGetter<string | undefined>) {
  const articleTitle = useIssueArticleTitle()

  watch(
    () => toValue(title),
    (next) => {
      articleTitle.value = next?.trim() || null
    },
    { immediate: true },
  )

  onBeforeUnmount(() => {
    articleTitle.value = null
  })
}

export function useIssueFrame() {
  const route = useRoute()
  const articleTitle = useIssueArticleTitle()

  const isHome = computed(() => route.path === '/')

  const section = computed(() => {
    if (route.path.startsWith('/posts'))
      return 'posts'
    if (route.path.startsWith('/corpus'))
      return 'corpus'
    if (route.path.startsWith('/dashboard'))
      return 'dashboard'
    return 'home'
  })

  const isArticle = computed(() => Boolean(articleTitle.value))

  const isHub = computed(() => {
    const parts = route.path.split('/').filter(Boolean)
    return (parts[0] === 'posts' || parts[0] === 'corpus') && parts.length <= 2
  })

  return {
    section,
    isHome,
    isHub,
    isArticle,
    articleTitle,
  }
}
