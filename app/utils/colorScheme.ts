export type ColorSchemePref = 'light' | 'dark' | 'auto'

export const COLOR_SCHEME_KEY = 'froq-color-scheme'

export function resolveColorScheme(pref: ColorSchemePref): 'light' | 'dark' {
  if (pref === 'auto') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  }
  return pref
}

export function paintColorScheme(pref: ColorSchemePref) {
  const resolved = resolveColorScheme(pref)
  const root = document.documentElement
  root.classList.toggle('dark', resolved === 'dark')
  root.classList.toggle('light', resolved === 'light')
  root.style.colorScheme = resolved
}

export function readColorSchemePref(): ColorSchemePref {
  const saved = localStorage.getItem(COLOR_SCHEME_KEY)
  if (saved === 'light' || saved === 'dark' || saved === 'auto')
    return saved
  return 'auto'
}
