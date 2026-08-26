export function useColorScheme() {
  const pref = useState<ColorSchemePref>('color-scheme-pref', () => 'auto')

  function apply(next: ColorSchemePref) {
    pref.value = next
    if (!import.meta.client)
      return
    localStorage.setItem(COLOR_SCHEME_KEY, next)
    paintColorScheme(next)
  }

  function cycle() {
    apply(pref.value === 'auto' ? 'light' : pref.value === 'light' ? 'dark' : 'auto')
  }

  onMounted(() => {
    apply(readColorSchemePref())
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => {
      if (pref.value === 'auto')
        paintColorScheme('auto')
    }
    mq.addEventListener('change', onChange)
    onUnmounted(() => mq.removeEventListener('change', onChange))
  })

  return { pref, cycle }
}
