const pageFallback = {
  name: 'issue-sheet',
  mode: 'out-in' as const,
}

const feedTransition = {
  name: 'hub-feed',
  mode: 'out-in' as const,
}

export function useIssuePageTransition() {
  const transition = shallowRef<false | typeof pageFallback>(false)

  onMounted(() => {
    if (!('startViewTransition' in document))
      transition.value = pageFallback
  })

  return transition
}

/** Nested hub listings always fade locally; document VT is skipped for those navigations. */
export function useHubFeedTransition() {
  return feedTransition
}
