(() => {
  const key = 'froq-color-scheme'
  const saved = localStorage.getItem(key)
  const pref = saved === 'light' || saved === 'dark' || saved === 'auto'
    ? saved
    : 'auto'
  const dark = pref === 'dark' || (pref !== 'light' && matchMedia('(prefers-color-scheme: dark)').matches)
  const root = document.documentElement
  root.classList.toggle('dark', dark)
  root.classList.toggle('light', !dark)
  root.style.colorScheme = dark ? 'dark' : 'light'
})()
