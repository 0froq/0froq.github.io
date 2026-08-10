import { useRoute } from 'vitepress'
import { nextTick, onBeforeUnmount, onMounted, watch } from 'vue'

const NEAR_PX = 240

function isNearViewport(el: HTMLElement): boolean {
  const rect = el.getBoundingClientRect()
  return rect.top < window.innerHeight + NEAR_PX && rect.bottom > -NEAR_PX
}

/**
 * 正文块级懒显：
 * - IntersectionObserver 提前（rootMargin）标记 is-revealed，淡入上浮现形
 * - 同帧进入的块按序错峰（--lazy-delay），形成瀑布式呼吸感
 * - 兜底：仅强制揭示「近视口但仍未揭示」的块，避免 hydration 空白；
 *   不提前揭开屏外块，以免毁掉滚入动画
 */
export function useLazyContent(selector = '#content') {
  const route = useRoute()
  let io: IntersectionObserver | undefined
  let fallbackTimer: ReturnType<typeof setTimeout> | undefined

  function reveal(el: HTMLElement) {
    el.classList.add('is-revealed')
    io?.unobserve(el)
  }

  function setup() {
    io?.disconnect()
    if (fallbackTimer)
      clearTimeout(fallbackTimer)

    const root = document.querySelector(selector)
    if (!root)
      return

    // markdown 常被包在单层容器（vp-doc div）里，自动深入一层
    const container = root.children.length === 1
      ? root.children[0] as HTMLElement
      : root as HTMLElement

    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const blocks = Array.from(container.children).filter(
      (el): el is HTMLElement => el instanceof HTMLElement,
    )

    blocks.forEach((el, i) => {
      el.classList.add('lazy-block')
      el.style.setProperty('--lazy-delay', `${(i % 4) * 70}ms`)
      el.querySelectorAll('img').forEach((img) => {
        if (!img.hasAttribute('loading'))
          img.setAttribute('loading', 'lazy')
      })
      if (reduced)
        el.classList.add('is-revealed')
    })
    if (reduced)
      return

    io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting)
          reveal(entry.target as HTMLElement)
      }
    }, { rootMargin: `${NEAR_PX}px 0px` })

    blocks.forEach((el) => {
      // Already in (or near) viewport — reveal immediately without waiting for IO.
      if (isNearViewport(el))
        reveal(el)
      else
        io!.observe(el)
    })

    // Safety net: only near-viewport blocks that IO missed (e.g. after remount).
    // Do NOT reveal below-fold content — that kills the scroll-in animation.
    fallbackTimer = setTimeout(() => {
      blocks.forEach((el) => {
        if (!el.classList.contains('is-revealed') && isNearViewport(el))
          reveal(el)
      })
    }, 600)
  }

  onMounted(() => nextTick(() => requestAnimationFrame(setup)))
  watch(() => route.path, () => nextTick(() => requestAnimationFrame(setup)))
  onBeforeUnmount(() => {
    io?.disconnect()
    if (fallbackTimer)
      clearTimeout(fallbackTimer)
  })
}
