import { useRoute } from 'vitepress'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

export function useRouteI18n(path?: string, locale?: string) {
  const { path: currentPath } = useRoute()
  const { locale: currentLocale } = useI18n()
  path = path || currentPath
  locale = locale || currentLocale.value

  const currentBasePath = computed(() => {
    const langPath = `/${locale}/`
    if (path.endsWith(langPath)) {
      return path.slice(0, -langPath.length + 1)
    }
    return path
  })

  function getLocaledPath(basePath?: string) {
    basePath = basePath || currentBasePath.value
    if (basePath.startsWith('http')) {
      return basePath
    }

    return `${basePath.split('#')[0]}${locale === 'zh' ? '' : `${locale}/`}${basePath.split('#')[1] || ''}`
  }

  return {
    currentBasePath,
    getLocaledPath,
  }
}
