const TRAILING_SLASH = /\/$/

export default defineEventHandler((event) => {
  const path = getRouterParam(event, 'path') ?? ''
  const base = String(useRuntimeConfig().public.froqApi || 'https://api.froq.me').replace(TRAILING_SLASH, '')
  return proxyRequest(event, `${base}/${path}${getRequestURL(event).search}`)
})
