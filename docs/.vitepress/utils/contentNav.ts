import type { Composer } from 'vue-i18n'

/**
 * Tree node structure for ContentNav component
 */
export interface ContentNavItem {
  label: string
  url: string
  tooltip?: string
  children?: ContentNavItem[]
}

/**
 * Route context returned by findRouteContext
 */
export interface RouteContext {
  current: ContentNavItem | null
  parent: ContentNavItem | null
}

/**
 * Creates the default navigation tree for the blog
 * Includes HOME, Corpus (with categories), Posts, Dashboard, and Tags
 */
export function createDefaultContentNavTree(t: Composer['t']): ContentNavItem[] {
  return [
    {
      label: 'HOME',
      url: '/',
      children: [
        {
          label: 'Corpus',
          url: '/corpus/',
          children: [
            { label: 'Autopsia', url: '/corpus/000_autopsia/', tooltip: t('tooltip.autopsia') },
            { label: 'Ingesta', url: '/corpus/100_ingesta/', tooltip: t('tooltip.ingesta') },
            { label: 'Neoplasma', url: '/corpus/200_neoplasma/', tooltip: t('tooltip.neoplasma') },
            { label: 'Putredo', url: '/corpus/300_putredo/', tooltip: t('tooltip.putredo') },
            { label: 'Delirium', url: '/corpus/400_delirium/', tooltip: t('tooltip.delirium') },
            { label: 'Vigil', url: '/corpus/500_vigil/', tooltip: t('tooltip.vigil') },
          ],
        },
        { label: 'Posts', url: '/posts/' },
        { label: 'Dashboard', url: '/dashboard/' },
        { label: 'Tags', url: '/tags/' },
      ],
    },
  ]
}

/**
 * Resolves the parent URL for an article based on its URL
 * - Posts go to /posts/
 * - Corpus articles go to their parent folder
 */
export function resolveArticleParentUrl(url: string): string {
  const parts = url.split('/').filter(Boolean)

  if (parts[0] === 'posts') {
    return '/posts/'
  }

  // For corpus articles, go up one level from the article
  // e.g., /corpus/100_ingesta/article.md -> /corpus/100_ingesta/
  if (parts.length >= 2) {
    return `/${parts.slice(0, -1).join('/')}/`
  }

  return '/'
}

/**
 * Recursively finds the current route and its parent in the navigation tree
 */
export function findRouteContext(
  items: ContentNavItem[],
  currentPath: string,
  parent: ContentNavItem | null = null,
): RouteContext {
  for (const item of items) {
    if (currentPath === item.url) {
      return { current: item, parent }
    }
    if (item.children) {
      const found = findRouteContext(item.children, currentPath, item)
      if (found.current) {
        return found
      }
    }
  }
  return { current: null, parent: null }
}
