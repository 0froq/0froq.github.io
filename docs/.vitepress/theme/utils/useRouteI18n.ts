import { computed } from 'vue'

export function useRouteI18n(path: string, locale: string) {
  const currentBasePath = computed(() => {
    const langPath = `/${locale}/`
    if (path.endsWith(langPath)) {
      return path.slice(0, -langPath.length + 1)
    }
    return path
  })

  function getLocaledPath(bathPath: string) {
    return `${bathPath}${locale === 'zh' ? '' : `${locale}/`}`
  }

  return {
    currentBasePath,
    getLocaledPath,
  }
}
