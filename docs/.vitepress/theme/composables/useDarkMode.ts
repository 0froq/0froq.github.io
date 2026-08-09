import { useDark } from '@vueuse/core'
import { nextTick } from 'vue'

/**
 * Dark mode toggle with View Transition API (circular reveal from click point).
 * @see https://github.com/antfu/antfu.me/blob/main/src/logics/index.ts
 *
 * Clip / stacking are driven by CSS keyframes + data-theme-vt (set before
 * startViewTransition), not WAAPI after transition.ready — the latter leaves a
 * one-frame unclipped new snapshot on 2nd+ dark→light toggles (white flash).
 */
export const isDark = useDark()

function waitFrames(n = 2): Promise<void> {
  return new Promise((resolve) => {
    const step = (left: number) => {
      if (left <= 0)
        resolve()
      else
        requestAnimationFrame(() => step(left - 1))
    }
    step(n)
  })
}

export async function toggleDark(event?: MouseEvent) {
  const canTransition = typeof document !== 'undefined'
    && 'startViewTransition' in document
    // @ts-expect-error experimental API
    && !window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (!canTransition || !event) {
    isDark.value = !isDark.value
    return
  }

  const x = event.clientX
  const y = event.clientY
  const endRadius = Math.hypot(
    Math.max(x, innerWidth - x),
    Math.max(y, innerHeight - y),
  )

  const root = document.documentElement
  const toDark = !isDark.value

  // 清掉可能残留的上一轮 WAAPI / 状态
  root.getAnimations?.().forEach(a => a.cancel())

  root.style.setProperty('--vt-x', `${x}px`)
  root.style.setProperty('--vt-y', `${y}px`)
  root.style.setProperty('--vt-end', `${endRadius}px`)
  root.dataset.themeVt = toDark ? 'to-dark' : 'to-light'

  // 先展开懒加载块，让布局在 VT 截图之外完成
  root.classList.add('vt-active')
  await waitFrames(2)

  // @ts-expect-error experimental API
  const transition = document.startViewTransition(async () => {
    isDark.value = !isDark.value
    await nextTick()
  })

  const clear = () => {
    root.classList.remove('vt-active')
    delete root.dataset.themeVt
    root.style.removeProperty('--vt-x')
    root.style.removeProperty('--vt-y')
    root.style.removeProperty('--vt-end')
  }
  transition.finished.then(clear, clear)
  transition.ready.catch(clear)
}
