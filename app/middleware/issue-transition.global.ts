function routeDepth(path: string) {
  return path.split('/').filter(Boolean).length
}

export default defineNuxtRouteMiddleware((to, from) => {
  if (import.meta.server || to.path === from.path)
    return

  const toDepth = routeDepth(to.path)
  const fromDepth = routeDepth(from.path)
  document.documentElement.dataset.issueNav = toDepth > fromDepth
    ? 'open'
    : toDepth < fromDepth
      ? 'close'
      : 'turn'
})
