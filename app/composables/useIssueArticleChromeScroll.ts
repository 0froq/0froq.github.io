const TITLE_REVEAL_Y = 240

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n))
}

export function useIssueArticleChromeScroll() {
  const route = useRoute()
  const titleRevealed = ref(false)
  const progressWidth = ref('0px')
  const headerRef = ref<HTMLElement | null>(null)
  const progressTrackRef = ref<HTMLElement | null>(null)

  function update() {
    if (typeof window === 'undefined')
      return

    titleRevealed.value = window.scrollY > TITLE_REVEAL_Y

    const track = progressTrackRef.value
    const el = document.querySelector('.issue-read')
    if (!(el instanceof HTMLElement) || !track) {
      progressWidth.value = '0px'
      return
    }

    const scrollY = window.scrollY
    const rect = el.getBoundingClientRect()
    const height = rect.height || el.offsetHeight
    const wrapperOffsetY = rect.top + scrollY
    const fullWidth = track.offsetWidth
    const windowHeight = window.innerHeight

    if (height <= windowHeight) {
      progressWidth.value = `${fullWidth}px`
      return
    }

    const percentage = clamp01(
      (scrollY - wrapperOffsetY) / Math.max(0, height - windowHeight),
    )
    progressWidth.value = `${percentage * fullWidth}px`
  }

  onMounted(() => {
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update, { passive: true })
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', update)
    window.removeEventListener('resize', update)
  })

  watch(progressTrackRef, async (track) => {
    if (!track) {
      progressWidth.value = '0px'
      return
    }
    await nextTick()
    update()
  })

  watch(() => route.path, async () => {
    await nextTick()
    update()
  })

  return { titleRevealed, progressWidth, headerRef, progressTrackRef }
}
