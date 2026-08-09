<script setup lang="ts">
import { onClickOutside, useDebounceFn, useEventListener, useMouse } from '@vueuse/core'
import { computed, ref, useSlots } from 'vue'
import FloatWindow from '@/ui/base/FloatWindow.vue'
import { renderMdInline } from '~/utils/renderMdInline'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<Props>(), {
  followMouse: true,
  placement: 'bottom',
  offset: 0,
})

interface Props {
  href: string
  text: string
  vanilla?: boolean
  followMouse?: boolean
  placement?: 'bottom' | 'top' | 'left' | 'right'
  offset?: number
}

const showTooltip = ref(false)
const triggerRef = ref<HTMLElement | null>(null)
const floatWindowRef = ref<InstanceType<typeof FloatWindow> | null>(null)
const linkContent = computed(() => renderMdInline(props.text))
const hasTooltipSlot = computed(() => !!useSlots().tooltip)

// Scroll-awareness: suppress tooltip during scroll to prevent flickering
const isScrolling = ref(false)
const { x: mouseX, y: mouseY } = useMouse({ type: 'client', touch: false })

function isMouseOverTrigger(): boolean {
  const el = triggerRef.value
  if (!el)
    return false
  const rect = el.getBoundingClientRect()
  return mouseX.value >= rect.left && mouseX.value <= rect.right
    && mouseY.value >= rect.top && mouseY.value <= rect.bottom
}

function syncTooltipAfterScroll() {
  if (!props.followMouse || !hasTooltipSlot.value)
    return
  if (isMouseOverTrigger()) {
    // Simulate a synthetic mouse event to position the FloatWindow
    const syntheticEvent = new MouseEvent('mousemove', {
      clientX: mouseX.value,
      clientY: mouseY.value,
    })
    floatWindowRef.value?.updateMousePosition(syntheticEvent)
    showTooltip.value = true
  }
}

const onScrollEnd = useDebounceFn(() => {
  isScrolling.value = false
  syncTooltipAfterScroll()
}, 150)

useEventListener('scroll', () => {
  isScrolling.value = true
  if (showTooltip.value)
    showTooltip.value = false
  onScrollEnd()
}, { passive: true, capture: true })

onClickOutside(triggerRef, () => {
  if (!showTooltip.value)
    return
  if (showTooltip.value) {
    showTooltip.value = false
  }
})

function toggleTooltip() {
  if (!props.followMouse && hasTooltipSlot.value) {
    showTooltip.value = !showTooltip.value
  }
}

function handleMouseEnter() {
  if (props.followMouse && hasTooltipSlot.value && !isScrolling.value) {
    showTooltip.value = true
  }
}

function handleMouseLeave() {
  if (props.followMouse && hasTooltipSlot.value) {
    showTooltip.value = false
  }
}

function handleMouseMove(e: MouseEvent) {
  if (props.followMouse && hasTooltipSlot.value && !isScrolling.value) {
    floatWindowRef.value?.updateMousePosition(e)
  }
}
</script>

<template>
  <div
    un-flex="~ row"
    un-max-w-full
    un-overflow-hidden
    un-items-center
  >
    <span
      ref="triggerRef"
      un-after="content-empty bg-neutral-400 dark:bg-neutral-600 w-full h-1px absolute bottom-0.5 left-0 z-0"
      un-duration-400
      un-text="neutral-600 dark:neutral-400 hover:neutral-800 dark:hover:neutral-200"
      un-relative
      un-min-w-0
      un-mx-1
      un-before-w-0
      un-before-h-px
      un-before-left-0
      un-before-bottom="0.5"
      un-before-z-1
      un-before-rounded-none
      un-before-absolute
      un-hover-before-w-full
      un-before-transition-width
      un-before-content-empty
      v-bind="$attrs['un-before'] ? { 'un-before': $attrs['un-before'] } : {}"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
      @mousemove="handleMouseMove"
    >
      <a
        v-bind="$attrs['un-text'] ? { 'un-text': $attrs['un-text'] } : {}"
        un-block
        un-max-w-full
        un-whitespace-nowrap
        un-text-ellipsis
        un-overflow-hidden
        :href="href"
        class="markdown-rendered"
        v-html="linkContent"
      />
    </span>

    <un-i-solar-arrow-right-down-line-duotone
      v-if="!followMouse && hasTooltipSlot"
      un-cursor-pointer
      un-text="neutral-500 hover:neutral-700 dark:hover:neutral-300"
      un-transition
      un-duration-200
      un-z-2
      un-block
      @click.stop="toggleTooltip"
    />
  </div>

  <FloatWindow
    v-if="hasTooltipSlot"
    ref="floatWindowRef"
    v-model:visible="showTooltip"
    :trigger-ref="triggerRef"
    :follow-mouse="followMouse"
    :placement="placement"
    :offset="offset"
  >
    <div
      class="garden-float-panel"
      un-text="neutral-700 dark:neutral-300"
      un-text-align-start
      un-p4
      un-max-w-fit
      un-w-full
      un-text-base
    >
      <slot name="tooltip" />
    </div>
  </FloatWindow>
</template>
