function routeDepth(path: string) {
  return path.split('/').filter(Boolean).length
}

export default defineNuxtRouteMiddleware((to, from) => {
  if (import.meta.server || to.path === from.path)
    return

  const toDepth = routeDepth(to.path)
  const fromDepth = routeDepth(from.path)
  const nav = toDepth > fromDepth
    ? 'open'
    : toDepth < fromDepth
      ? 'close'
      : 'turn'
  document.documentElement.dataset.issueNav = nav

  const chrome = useIssueSheetChrome()
  if (!samePublicationSection(to.path, from.path) || nav === 'turn')
    chrome.value = null
  else
    chrome.value = nav === 'close' ? 'article' : 'hub'
})
