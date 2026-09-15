<script setup lang="ts">
import { inkPointerParts } from '~/utils/inkDraw'

type InkPointerSize = 'md' | 'sm' | 'lg'
type InkPointerPace = 'normal' | 'fast'

const props = withDefaults(defineProps<{
  seed: string
  dir?: InkArrowDir
  size?: InkPointerSize
  draw?: boolean
  /** When set, draw in / erase out as this toggles. Home gloss still uses `draw`. */
  drawn?: boolean | null
  pace?: InkPointerPace
}>(), {
  dir: 'down',
  size: 'md',
  draw: false,
  drawn: null,
  pace: 'normal',
})

const stemEl = ref<SVGPathElement | null>(null)
const headEl = ref<SVGPathElement | null>(null)
const timers: number[] = []
const anims: Animation[] = []

const parts = computed(() => inkPointerParts(props.seed, props.dir))
const tall = computed(() => props.dir === 'up' || props.dir === 'down')
const live = computed(() => props.drawn !== null)
const inked = computed(() => !live.value)

/** Uno spacing: 1 = 0.25rem. Safelisted class tokens (see uno.config). */
const boxClass = computed(() => {
  const size = props.size
  const isTall = tall.value
  switch (size) {
    case 'md':
      return isTall ? 'h-17 w-9' : 'h-9 w-17'
    case 'sm':
      return isTall ? 'h-6 w-3.5' : 'h-3.5 w-7'
    case 'lg':
      return isTall ? 'h-10 w-6' : 'h-6 w-12'
    default: {
      const _exhaustive: never = size
      return _exhaustive
    }
  }
})

const stroke = computed(() => {
  const size = props.size
  switch (size) {
    case 'md':
      return 1.7
    case 'sm':
      return 3.4
    case 'lg':
      return 2.4
    default: {
      const _exhaustive: never = size
      return _exhaustive
    }
  }
})

function reduceMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function later(ms: number, fn: () => void) {
  timers.push(window.setTimeout(fn, ms))
}

function clearTimers() {
  for (const id of timers)
    window.clearTimeout(id)
  timers.length = 0
  for (const anim of anims)
    anim.cancel()
  anims.length = 0
}

function timings() {
  const pace = props.pace
  switch (pace) {
    case 'fast':
      return { stem: 220, head: 140, gap: 12 }
    case 'normal':
      return { stem: 520, head: 360, gap: 32 }
    default: {
      const _exhaustive: never = pace
      return _exhaustive
    }
  }
}

function pathLen(el: SVGPathElement) {
  return Math.ceil(el.getTotalLength()) + 8
}

function hide(el: SVGPathElement) {
  const len = pathLen(el)
  el.style.strokeDasharray = `${len}`
  el.style.strokeDashoffset = `${len}`
}

function reveal(el: SVGPathElement, ms: number) {
  const len = pathLen(el)
  el.style.strokeDasharray = `${len}`

  if (reduceMotion() || ms <= 0) {
    el.style.strokeDashoffset = '0'
    return
  }

  el.style.strokeDashoffset = `${len}`
  const anim = el.animate(
    [
      { strokeDashoffset: len },
      { strokeDashoffset: 0 },
    ],
    {
      duration: ms,
      easing: 'cubic-bezier(0, 0, 0.2, 1)',
      fill: 'forwards',
    },
  )
  anims.push(anim)
  anim.finished.then(() => {
    el.style.strokeDashoffset = '0'
  }).catch(() => {})
}

function conceal(el: SVGPathElement, ms: number) {
  const len = pathLen(el)
  el.style.strokeDasharray = `${len}`
  const from = Number.parseFloat(getComputedStyle(el).strokeDashoffset) || 0

  if (reduceMotion() || ms <= 0) {
    el.style.strokeDashoffset = `${len}`
    return
  }

  const anim = el.animate(
    [
      { strokeDashoffset: from },
      { strokeDashoffset: len },
    ],
    {
      duration: ms,
      easing: 'cubic-bezier(0.4, 0, 1, 1)',
      fill: 'forwards',
    },
  )
  anims.push(anim)
  anim.finished.then(() => {
    el.style.strokeDashoffset = `${len}`
  }).catch(() => {})
}

function armDraw() {
  const stem = stemEl.value
  const head = headEl.value
  if (!stem || !head)
    return

  clearTimers()
  hide(stem)
  hide(head)

  if (reduceMotion()) {
    reveal(stem, 0)
    reveal(head, 0)
    return
  }

  const { stem: stemMs, head: headMs, gap } = timings()
  later(gap, () => {
    reveal(stem, stemMs)
  })
  later(gap + stemMs, () => {
    reveal(head, headMs)
  })
}

function armErase() {
  const stem = stemEl.value
  const head = headEl.value
  if (!stem || !head)
    return

  clearTimers()

  if (reduceMotion()) {
    hide(stem)
    hide(head)
    return
  }

  const { stem: stemMs, head: headMs, gap } = timings()
  conceal(head, headMs)
  later(headMs + gap, () => {
    conceal(stem, stemMs)
  })
}

onMounted(() => {
  if (props.drawn !== null) {
    const stem = stemEl.value
    const head = headEl.value
    if (stem)
      hide(stem)
    if (head)
      hide(head)
    if (props.drawn)
      armDraw()
    return
  }

  if (!props.draw) {
    const stem = stemEl.value
    const head = headEl.value
    if (stem)
      stem.style.strokeDashoffset = '0'
    if (head)
      head.style.strokeDashoffset = '0'
    return
  }
  const el = stemEl.value
  if (!el)
    return
  const group = el.closest('[data-phase="hold"]')
  if (!group) {
    armDraw()
    return
  }
  const obs = new MutationObserver(() => {
    if (group.getAttribute('data-phase') === 'hold')
      return
    obs.disconnect()
    armDraw()
  })
  obs.observe(group, { attributes: true, attributeFilter: ['data-phase'] })
  onUnmounted(() => {
    obs.disconnect()
    clearTimers()
  })
})

watch(() => props.drawn, (on) => {
  if (on == null)
    return
  if (on)
    armDraw()
  else
    armErase()
})

onUnmounted(() => {
  clearTimers()
})
</script>

<template>
  <svg
    class="ink-pointer"
    viewBox="0 0 96 96"
    aria-hidden="true"
    un-block
    un-overflow-visible
    un-text-colored-ink
    :class="boxClass"
  >
    <path
      ref="stemEl"
      class="ink-pointer-stroke"
      :d="parts.stem"
      fill="none"
      stroke="currentColor"
      :stroke-width="stroke"
      stroke-linecap="round"
      stroke-linejoin="round"
      :stroke-dasharray="live ? 400 : undefined"
      :stroke-dashoffset="live ? 400 : undefined"
      :data-ink="inked ? 'stem' : undefined"
    />
    <path
      ref="headEl"
      class="ink-pointer-stroke"
      :d="parts.head"
      fill="none"
      stroke="currentColor"
      :stroke-width="stroke"
      stroke-linecap="round"
      stroke-linejoin="round"
      :stroke-dasharray="live ? 400 : undefined"
      :stroke-dashoffset="live ? 400 : undefined"
      :data-ink="inked ? 'head' : undefined"
    />
  </svg>
</template>
