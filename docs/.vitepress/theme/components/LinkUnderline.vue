<script setup lang="ts">
import { useEventListener } from '@vueuse/core'
import { nextTick, onMounted, reactive, ref } from 'vue'
import { renderMdInline } from '../../utils/renderMdInline'

const props = defineProps<{
  href: string
  text: string
  tooltip?: boolean
  tooltipAddons?: string[]
  tooltipText?: string
  vanilla?: boolean
}>()

const showTooltip = ref(false)
const tooltipRef = ref<HTMLElement | null>(null)
const mouseX = ref(0)
const mouseY = ref(0)
const tooltipStyle = reactive({
  left: '0px',
  top: '0px',
})

async function updateTooltipPosition(e: MouseEvent) {
  if (!props.tooltip) {
    return
  }

  mouseX.value = e.clientX
  mouseY.value = e.clientY

  if (showTooltip.value) {
    await nextTick()
    if (tooltipRef.value) {
      const tooltipWidth = tooltipRef.value.offsetWidth
      const tooltipHeight = tooltipRef.value.offsetHeight
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      let newLeft = mouseX.value + 10
      let newTop = mouseY.value + 10

      // Check if tooltip goes off right edge
      if (newLeft + tooltipWidth > viewportWidth) {
        newLeft = mouseX.value - tooltipWidth - 10
      }

      // Check if tooltip goes off bottom edge
      if (newTop + tooltipHeight > viewportHeight) {
        newTop = mouseY.value - tooltipHeight - 10
      }

      tooltipStyle.left = `${newLeft}px`
      tooltipStyle.top = `${newTop}px`
    }
  }
}

onMounted(() => {
  useEventListener(window, ['resize', 'scroll'], () => showTooltip.value = false)
})
</script>

<template>
  <div
    v-if="vanilla"
    @mouseenter="showTooltip = true"
    @mouseleave="showTooltip = false"
    @mousemove="showTooltip = true; updateTooltipPosition($event)"
  >
    <a
      un-transition-colors
      un-duration-200
      un-underline="~ px neutral-400 dark:neutral-600 hover:neutral-700 dark:hover:neutral-300"
      un-block
      un-max-w-full
      un-whitespace-nowrap
      un-text-ellipsis
      un-overflow-hidden
      :href="href"
      class="markdown-rendered"
      v-html="renderMdInline(text)"
    />
    <div
      v-if="showTooltip && tooltip"
      ref="tooltipRef"
      class="tooltip"
      :style="tooltipStyle"
      un-bg="neutral-200 dark:neutral-800"
      un-text="neutral-800 dark:neutral-200"
      un-fixed
      un-rounded-sm
      un-whitespace-nowrap
      un-text-align-start
      un-z-50
      un-py-2
      un-px-4
      un-shadow-lg
    >
      <div
        un-flex="~ col"
      >
        <div
          class="markdown-rendered"
          v-html="renderMdInline(tooltipText)"
        />
        <slot
          name="tooltipAddons"
        />
      </div>
    </div>
  </div>
  <div
    v-else
    un-after="content-empty bg-neutral-400 dark:bg-neutral-600 w-full h-1px absolute bottom-0 left-0 z-0"
    un-inline-block
    un-duration-400
    un-relative
    un-min-w-0
    un-px-2
    un-before-w-0
    un-before-h-3px
    un-before-left-0
    un-before-bottom-0
    un-before-z-1
    un-before-rounded-none
    un-before-absolute
    un-hover-before-w-full
    un-before-transition-width
    un-before-content-empty
    @mouseenter="showTooltip = true"
    @mouseleave="showTooltip = false"
    @mousemove="showTooltip = true; updateTooltipPosition($event)"
  >
    <a
      un-block
      un-max-w-full
      un-whitespace-nowrap
      un-text-ellipsis
      un-overflow-hidden
      :href="href"
      class="markdown-rendered"
      v-html="renderMdInline(text)"
    />
    <div
      v-if="showTooltip && tooltip"
      ref="tooltipRef"
      class="tooltip"
      :style="tooltipStyle"
      un-bg="neutral-200 dark:neutral-800"
      un-text="neutral-800 dark:neutral-200"
      un-fixed
      un-rounded-sm
      un-whitespace-nowrap
      un-text-align-start
      un-text-base
      un-z-50
      un-py-2
      un-px-4
      un-shadow-lg
    >
      <div
        un-flex="~ col"
      >
        <div
          class="markdown-rendered"
          v-html="renderMdInline(tooltipText)"
        />
        <slot
          name="tooltipAddons"
        />
      </div>
    </div>
  </div>
</template>
