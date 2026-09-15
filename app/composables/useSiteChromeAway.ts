export function useSiteChromeAway() {
  const away = useState('site-chrome-away', () => false)
  let timer = 0

  function pulse() {
    away.value = true
    if (timer)
      window.clearTimeout(timer)
    timer = window.setTimeout(() => {
      away.value = false
      timer = 0
    }, 560)
  }

  function reset() {
    if (timer)
      window.clearTimeout(timer)
    timer = 0
    away.value = false
  }

  return { away, pulse, reset }
}
