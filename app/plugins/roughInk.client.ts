import { INK_SELECTOR, morphRoughInk, paintRoughInk } from '~/utils/roughInk'

export default defineNuxtPlugin((nuxtApp) => {
  let ro: ResizeObserver | undefined
  let mo: MutationObserver | undefined
  let frame = 0
  let painting = false
  const watched = new WeakSet<Element>()

  function owned(el: HTMLElement): boolean {
    return !el.classList.contains('journal-wheel__ring')
  }

  function scan(): void {
    painting = true
    for (const svg of document.querySelectorAll<SVGSVGElement>('svg.rough-ink')) {
      const host = svg.parentElement
      if (host instanceof HTMLElement && owned(host))
        paintRoughInk(host)
    }
    const targets = document.querySelectorAll<HTMLElement>(INK_SELECTOR)
    for (const el of targets) {
      if (!owned(el))
        continue
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
      for (const entry of entries) {
        const host = entry.target
        if (host instanceof HTMLElement && owned(host))
          paintRoughInk(host)
      }
      painting = false
    })
    scan()
    document.fonts?.ready.then(schedule)

    mo = new MutationObserver((records) => {
      const morphHosts = new Set<HTMLElement>()
      let structural = false

      for (const record of records) {
        if (record.type === 'attributes' && record.target instanceof HTMLElement) {
          const name = record.attributeName
          if (name === 'data-ink' || name === 'data-hover-ink')
            morphHosts.add(record.target)
        }
        else {
          structural = true
        }
      }

      for (const el of morphHosts) {
        if (owned(el))
          morphRoughInk(el)
      }
      if (structural)
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
