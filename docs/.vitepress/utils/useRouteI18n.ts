import { computed } from 'vue'

export function useRouteI18n(path: string, locale: string) {
  const currentBasePath = computed(() => {
    // Remove ending `/<lang>/` from the path
    const langPath = `/${locale}/`
    if (path.endsWith(langPath)) {
      return path.slice(0, -langPath.length + 1)
    }
    return path
  })

  return {
    currentBasePath,
  }
}
