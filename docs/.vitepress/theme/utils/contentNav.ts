import type { ContentNavItem, RouteContext } from '../types'
import type { Composer } from 'vue-i18n'

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

export function resolveArticleParentUrl(url: string): string {
  const parts = url.split('/').filter(Boolean)

  if (parts[0] === 'posts') {
    return '/posts/'
  }

  if (parts.length >= 2) {
    return `/${parts.slice(0, -1).join('/')}/`
  }

  return '/'
}

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
