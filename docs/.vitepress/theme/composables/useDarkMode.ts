import { useDark } from '@vueuse/core'
import { nextTick } from 'vue'

/**
 * Dark mode toggle with View Transition API (circular reveal from click point).
 * @see https://github.com/antfu/antfu.me/blob/main/src/logics/index.ts
 */
export const isDark = useDark()

export function toggleDark(event?: MouseEvent) {
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

  // @ts-expect-error experimental API
  const transition = document.startViewTransition(async () => {
    isDark.value = !isDark.value
    await nextTick()
  })

  transition.ready.then(() => {
    const clipPath = [
      `circle(0px at ${x}px ${y}px)`,
      `circle(${endRadius}px at ${x}px ${y}px)`,
    ]
    document.documentElement.animate(
      {
        clipPath: isDark.value
          ? [...clipPath].reverse()
          : clipPath,
      },
      {
        duration: 400,
        easing: 'ease-out',
        fill: 'forwards',
        pseudoElement: isDark.value
          ? '::view-transition-old(root)'
          : '::view-transition-new(root)',
      },
    )
  })
}
