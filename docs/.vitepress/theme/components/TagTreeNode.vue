<script setup lang="ts">
import { defaultWindow, useEventListener, useMouse } from '@vueuse/core'
import { computed, onBeforeUnmount, onMounted, onUpdated, ref, watch } from 'vue'
import LinkUnderline from './LinkUnderline.vue'
import QSeperator from './QSeperator.vue'

interface TagNode {
  name: string
  fullPath: string
  exactCount: number
  totalCount: number
  children: TagNode[]
}

const props = withDefaults(defineProps<{ node: TagNode, defaultOpen?: boolean, depth?: number }>(), {
  defaultOpen: false,
  depth: 0,
})

const hasChildren = computed(() => props.node.children && props.node.children.length > 0)
const isOpen = ref(Boolean(props.defaultOpen))
const displayCount = computed(() => {
  if (hasChildren.value && isOpen.value)
    return props.node.exactCount
  return props.node.totalCount
})
const formattedCount = computed(() => String(displayCount.value).padStart(3, '0'))

const palette = {
  green: '#22c55e',
  yellow: '#f59e0b',
  red: '#f43f5e',
  zero: '#9ca3af',
}

function hexToRgb(hex: string): [number, number, number] {
  const value = hex.replace('#', '')
  const full = value.length === 3
    ? value.split('').map(ch => ch + ch).join('')
    : value
  const int = Number.parseInt(full, 16)
  return [
    (int >> 16) & 255,
    (int >> 8) & 255,
    int & 255,
  ]
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

function interpolateHex(from: string, to: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(from)
  const [r2, g2, b2] = hexToRgb(to)
  const r = Math.round(lerp(r1, r2, t))
  const g = Math.round(lerp(g1, g2, t))
  const b = Math.round(lerp(b1, b2, t))
  return `rgb(${r}, ${g}, ${b})`
}

function getCountColor(count: number, max = 50): string {
  if (count <= 0)
    return palette.zero
  const clamped = Math.min(count, max)
  const ratio = clamped / max
  if (ratio <= 0.5) {
    return interpolateHex(palette.green, palette.yellow, ratio / 0.5)
  }
  return interpolateHex(palette.yellow, palette.red, (ratio - 0.5) / 0.5)
}

const countColor = computed(() => getCountColor(displayCount.value))

const animatedCountText = ref(formattedCount.value)
let countAnimRafId: number | null = null

function padCount(value: number): string {
  return String(Math.max(0, value)).padStart(3, '0')
}

function animateCount(to: number) {
  const targetText = padCount(to)
  const win = defaultWindow
  if (!win) {
    animatedCountText.value = targetText
    return
  }

  if (countAnimRafId != null)
    win.cancelAnimationFrame(countAnimRafId)

  const scrambleChars = '0123456789'
  const duration = 600
  const start = win.performance.now()

  const easeInOutCubic = (value: number) => {
    if (value < 0.5)
      return 4 * value * value * value
    return 1 - (((-2 * value + 2) ** 3) / 2)
  }

  const tick = (now: number) => {
    const progress = Math.min(1, (now - start) / duration)
    const eased = easeInOutCubic(progress)
    const lockCount = Math.floor(eased * targetText.length)

    let next = ''
    for (let i = 0; i < targetText.length; i++) {
      if (progress >= 1 || i < lockCount) {
        next += targetText[i]
      }
      else {
        const randomIndex = Math.floor(Math.random() * scrambleChars.length)
        next += scrambleChars[randomIndex]
      }
    }

    animatedCountText.value = next
    if (progress < 1) {
      countAnimRafId = win.requestAnimationFrame(tick)
    }
    else {
      countAnimRafId = null
      animatedCountText.value = targetText
    }
  }

  countAnimRafId = win.requestAnimationFrame(tick)
}

watch(displayCount, (next) => {
  if (!hasChildren.value) {
    animatedCountText.value = padCount(next)
    return
  }
  animateCount(next)
})

const { x: pointerX, y: pointerY } = useMouse({ type: 'client', touch: false })
const pointerActive = ref(false)
let refreshRafId: number | null = null

const rowRef = ref<HTMLElement | null>(null)
const separatorOpacity = ref(0.08)

function scheduleSeparatorRefresh() {
  if (refreshRafId != null)
    cancelAnimationFrame(refreshRafId)
  refreshRafId = requestAnimationFrame(() => {
    refreshRafId = null
    updateSeparatorOpacity()
  })
}

function triggerGlobalLayoutRefresh() {
  defaultWindow?.dispatchEvent(new CustomEvent('tag-tree-layout-refresh'))
}

function updateSeparatorOpacity() {
  const el = rowRef.value
  if (!el || !pointerActive.value) {
    separatorOpacity.value = 0.08
    return
  }

  const rect = el.getBoundingClientRect()
  const horizontalPadding = 80
  const withinX = pointerX.value >= rect.left - horizontalPadding && pointerX.value <= rect.right + horizontalPadding
  if (!withinX) {
    separatorOpacity.value = 0.08
    return
  }

  const centerY = rect.top + rect.height / 2
  const dy = pointerY.value - centerY
  const sigma = 56
  const influence = Math.exp(-(dy * dy) / (2 * sigma * sigma))
  separatorOpacity.value = 0.08 + (0.72 - 0.08) * influence
}

watch([pointerX, pointerY, pointerActive], () => {
  scheduleSeparatorRefresh()
})

useEventListener(defaultWindow, 'pointermove', () => {
  pointerActive.value = true
}, { passive: true })

useEventListener(defaultWindow, 'pointerleave', () => {
  pointerActive.value = false
}, { passive: true })

useEventListener(defaultWindow, 'scroll', () => {
  scheduleSeparatorRefresh()
}, { passive: true, capture: true })

useEventListener(defaultWindow, 'resize', () => {
  scheduleSeparatorRefresh()
}, { passive: true })

useEventListener(defaultWindow, 'tag-tree-layout-refresh', () => {
  scheduleSeparatorRefresh()
})

onMounted(() => {
  scheduleSeparatorRefresh()
})

onUpdated(() => {
  scheduleSeparatorRefresh()
})

onBeforeUnmount(() => {
  if (refreshRafId != null) {
    cancelAnimationFrame(refreshRafId)
    refreshRafId = null
  }
  if (countAnimRafId != null && defaultWindow) {
    defaultWindow.cancelAnimationFrame(countAnimRafId)
    countAnimRafId = null
  }
})

function asHTMLElement(el: Element): HTMLElement | null {
  return el instanceof HTMLElement ? el : null
}

function beforeEnter(el: Element) {
  const element = asHTMLElement(el)
  if (!element)
    return
  element.style.maxHeight = '0px'
  element.style.opacity = '0'
}

function enter(el: Element) {
  const element = asHTMLElement(el)
  if (!element)
    return
  requestAnimationFrame(() => {
    element.style.maxHeight = `${element.scrollHeight}px`
    element.style.opacity = '1'
  })
}

function afterEnter(el: Element) {
  const element = asHTMLElement(el)
  if (!element)
    return
  element.style.maxHeight = ''
  element.style.opacity = ''
  triggerGlobalLayoutRefresh()
}

function beforeLeave(el: Element) {
  const element = asHTMLElement(el)
  if (!element)
    return
  element.style.maxHeight = `${element.scrollHeight}px`
  element.style.opacity = '1'
}

function leave(el: Element) {
  const element = asHTMLElement(el)
  if (!element)
    return
  requestAnimationFrame(() => {
    element.style.maxHeight = '0px'
    element.style.opacity = '0'
  })
}

function afterLeave(el: Element) {
  const element = asHTMLElement(el)
  if (!element)
    return
  element.style.maxHeight = ''
  element.style.opacity = ''
  triggerGlobalLayoutRefresh()
}

function toggle() {
  if (!hasChildren.value)
    return
  isOpen.value = !isOpen.value
}
</script>

<template>
  <li un-mb-1>
    <div
      ref="rowRef"
      un-flex="~ row"
      un-items-center
      un-gap-2
      un-text-lg
      un-w-full
    >
      <div
        un-flex="~ row"
        un-items-center
        un-gap-1
        un-shrink-0
      >
        <span
          v-if="props.depth > 0"
          un-text="neutral-500"
        >
          ../
        </span>
        <LinkUnderline
          :href="`/tags/${props.node.fullPath}`"
          :text="props.node.name"
          :vanilla="true"
          un-underline="~ px neutral-400 dark:neutral-600 hover:sky-500"
          un-text="neutral-600 dark:neutral-400"
        />
        <template v-if="hasChildren">
          <span
            un-text="neutral-500"
          >
            /
          </span>
          <span
            v-if="hasChildren"
            un-text="neutral-500 hover:neutral-950 dark:hover:neutral-50"
            un-cursor-pointer
            un-transition
            :aria-expanded="isOpen"
            :aria-label="isOpen ? '折叠子标签' : '展开子标签'"
            @click="toggle"
          >
            <span>..</span>
          </span>
        </template>
      </div>

      <QSeperator
        type="dashed"
        un-flex-grow
        :style="{ opacity: separatorOpacity, transition: 'opacity 140ms cubic-bezier(0.22, 1, 0.36, 1)' }"
      />

      <span
        un-font-mono
        un-shrink-0
        :style="{ color: countColor, transition: 'color 220ms cubic-bezier(0.22, 1, 0.36, 1)' }"
      >
        {{ animatedCountText }}
      </span>
    </div>
    <Transition
      name="tag-collapse"
      @before-enter="beforeEnter"
      @enter="enter"
      @after-enter="afterEnter"
      @before-leave="beforeLeave"
      @leave="leave"
      @after-leave="afterLeave"
    >
      <ul
        v-if="hasChildren"
        v-show="isOpen"
        un-ml-4
        un-list-none
        un-mt-1
        un-pl-0
        un-space-y-1
      >
        <TagTreeNode
          v-for="child in props.node.children"
          :key="child.fullPath"
          :node="child"
          :depth="props.depth + 1"
        />
      </ul>
    </Transition>
  </li>
</template>

<style scoped>
.tag-collapse-enter-active,
.tag-collapse-leave-active {
  transition:
    max-height 220ms ease,
    opacity 220ms ease;
  overflow: hidden;
}

.tag-collapse-enter-active > li,
.tag-collapse-leave-active > li {
  transition:
    opacity 180ms ease,
    transform 180ms ease;
  transition-delay: 120ms;
}

.tag-collapse-enter-from > li {
  opacity: 0;
  transform: translateY(4px);
}

.tag-collapse-leave-to > li {
  opacity: 0;
  transform: translateY(4px);
}
</style>
