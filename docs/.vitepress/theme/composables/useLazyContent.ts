import { useRoute } from 'vitepress'
import { nextTick, onBeforeUnmount, onMounted, watch } from 'vue'

/**
 * 正文块级懒显：
 * - IntersectionObserver 提前（rootMargin 240px）标记 is-revealed，淡入上浮现形
 * - 同帧进入的块按序错峰（--lazy-delay），形成瀑布式呼吸感
 * - content-visibility 仅用于未揭示块；与 View Transition 并存时由 useDarkMode 规避
 */
export function useLazyContent(selector = '#content') {
  const route = useRoute()
  let io: IntersectionObserver | undefined

  function setup() {
    io?.disconnect()
    const root = document.querySelector(selector)
    if (!root)
      return

    // markdown 常被包在单层容器（vp-doc div）里，自动深入一层
    const container = root.children.length === 1
      ? root.children[0] as HTMLElement
      : root as HTMLElement

    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const blocks = Array.from(container.children) as HTMLElement[]

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
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed')
          io!.unobserve(entry.target)
        }
      }
    }, { rootMargin: '240px 0px' })

    blocks.forEach(el => io!.observe(el))
  }

  onMounted(() => nextTick(() => requestAnimationFrame(setup)))
  watch(() => route.path, () => nextTick(() => requestAnimationFrame(setup)))
  onBeforeUnmount(() => io?.disconnect())
}
