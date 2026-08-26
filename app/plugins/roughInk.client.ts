import { INK_SELECTOR, paintRoughInk } from '~/utils/roughInk'

export default defineNuxtPlugin((nuxtApp) => {
  let ro: ResizeObserver | undefined
  let mo: MutationObserver | undefined
  let frame = 0
  let painting = false
  const watched = new WeakSet<Element>()

  function scan(): void {
    painting = true
    for (const svg of document.querySelectorAll<SVGSVGElement>('svg.rough-ink')) {
      const host = svg.parentElement
      if (host instanceof HTMLElement)
        paintRoughInk(host)
    }
    const targets = document.querySelectorAll<HTMLElement>(INK_SELECTOR)
    for (const el of targets) {
      paintRoughInk(el)
      if (!watched.has(el)) {
        watched.add(el)
        ro?.observe(el)
      }
    }
    painting = false
  }

  function schedule(): void {
    if (frame)
      return
    frame = requestAnimationFrame(() => {
      frame = 0
      scan()
    })
  }

  nuxtApp.hook('app:mounted', () => {
    ro = new ResizeObserver((entries) => {
      if (painting)
        return
      painting = true
      for (const entry of entries)
        paintRoughInk(entry.target as HTMLElement)
      painting = false
    })
    scan()
    document.fonts?.ready.then(schedule)

    mo = new MutationObserver(() => {
      schedule()
    })
    mo.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-ink', 'data-hover-ink'],
    })
  })

  nuxtApp.hook('page:finish', () => {
    schedule()
    requestAnimationFrame(() => schedule())
  })
})
