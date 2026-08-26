const HTTP_RE = /^(https?:)?\/\//i
const LEAVE_RE = /^(mailto|tel|sms):/i

export function isExternalHref(href: string, origin?: string) {
  if (!href)
    return false
  if (LEAVE_RE.test(href))
    return true
  if (href.startsWith('#') || href.startsWith('?'))
    return false
  if (href.startsWith('/') && !href.startsWith('//'))
    return false
  if (!HTTP_RE.test(href) && !href.includes(':'))
    return false
  try {
    const url = new URL(href, origin || 'http://local.invalid')
    if (LEAVE_RE.test(url.protocol))
      return true
    if (url.protocol !== 'http:' && url.protocol !== 'https:')
      return true
    if (!origin)
      return HTTP_RE.test(href)
    return url.origin !== new URL(origin).origin
  }
  catch {
    return HTTP_RE.test(href)
  }
}

export function isHttpExternalHref(href: string, origin?: string) {
  return isExternalHref(href, origin) && HTTP_RE.test(href)
}
