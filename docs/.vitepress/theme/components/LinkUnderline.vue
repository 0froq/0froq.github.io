<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'
import { computed, ref, useSlots } from 'vue'
import { renderMdInline } from '../../utils/renderMdInline'
import FloatWindow from './FloatWindow.vue'

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
  if (props.followMouse && hasTooltipSlot.value) {
    showTooltip.value = true
  }
}

function handleMouseLeave() {
  if (props.followMouse && hasTooltipSlot.value) {
    showTooltip.value = false
  }
}

function handleMouseMove(e: MouseEvent) {
  if (props.followMouse && hasTooltipSlot.value) {
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
    <div
      v-if="vanilla"
      ref="triggerRef"
      class="link-underline-wrapper"
      un-items-center
      un-max-w-full
      un-gap-1
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
      @mousemove="handleMouseMove"
    >
      <a
        un-transition-colors
        un-duration-200
        un-underline="~ px stone-400 dark:stone-600"
        un-block
        un-text="stone-600 dark:stone-400 hover:stone-800 dark:hover:stone-200"
        un-max-w-full
        un-whitespace-nowrap
        un-text-ellipsis
        un-overflow-hidden
        :href
        class="markdown-rendered"
        v-bind="$attrs['un-before'] ? { 'un-before': $attrs['un-before'] } : {}"
        v-html="linkContent"
      />
    </div>

    <span
      v-else
      ref="triggerRef"
      un-after="content-empty bg-stone-400 dark:bg-stone-600 w-full h-1px absolute bottom-0.5 left-0 z-0"
      un-duration-400
      un-text="stone-600 dark:stone-400 hover:stone-800 dark:hover:stone-200"
      un-relative
      un-min-w-0
      un-mx-1
      un-before-w-0
      un-before-h-2px
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
      un-text="stone-500 hover:stone-700 dark:hover:stone-300"
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
      un-bg="stone-100 dark:stone-900"
      un-text="stone-700 dark:stone-300"
      un-rounded="~ sm"
      un-border="~ px stone-300 dark:stone-700"
      un-text-align-start
      un-py-2
      un-px-4
      un-max-w-fit
      un-text-base
    >
      <slot name="tooltip" />
    </div>
  </FloatWindow>
</template>
