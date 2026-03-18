<script setup lang="ts">
import { useAttrs, computed, onMounted, ref } from 'vue'
import { renderMdInline } from '../../utils/renderMdInline'
import FloatWindow from './FloatWindow.vue'

defineOptions({
  inheritAttrs: false,
})

const attrs = useAttrs()

const props = withDefaults(defineProps<Props>(), {
  followMouse: true,
  placement: 'bottom',
  offset: 8,
})

interface Props {
  href: string
  text: string
  tooltipText?: string
  vanilla?: boolean
  followMouse?: boolean
  placement?: 'bottom' | 'top' | 'left' | 'right'
  offset?: number
}

const showTooltip = ref(false)
const triggerRef = ref<HTMLElement | null>(null)
const floatWindowRef = ref<InstanceType<typeof FloatWindow> | null>(null)

const linkContent = computed(() => renderMdInline(props.text))
const tooltipContent = computed(() =>
  props.tooltipText ? renderMdInline(props.tooltipText) : '',
)

function handleMouseEnter() {
  showTooltip.value = true
}

function handleMouseLeave() {
  showTooltip.value = false
}

function handleMouseMove(e: MouseEvent) {
  if (props.followMouse) {
    floatWindowRef.value?.updateMousePosition(e)
  }
}

console.warn(attrs['un-text'])
</script>

<template>
  <div
    v-if="vanilla"
    ref="triggerRef"
    class="link-underline-wrapper"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @mousemove="handleMouseMove"
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
      v-bind="$attrs"
      v-html="linkContent"
    />
  </div>

  <span
    v-else
    ref="triggerRef"
    un-after="content-empty bg-neutral-400 dark:bg-neutral-600 w-full h-1px absolute bottom-0.5 left-0 z-0"
    un-inline-block
    un-duration-400
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
    un-before-bg="[--decoration-color]"
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

  <FloatWindow
    v-if="tooltipText || $slots.tooltip"
    ref="floatWindowRef"
    v-model:visible="showTooltip"
    :trigger-ref="triggerRef"
    :follow-mouse="followMouse"
    :placement="placement"
    :offset="offset"
  >
    <div
      v-if="tooltipText"
      un-bg="neutral-200 dark:neutral-800"
      un-text="neutral-800 dark:neutral-200"
      un-rounded-sm
      un-text-align-start
      un-py-2
      un-px-4
      un-shadow-lg
    >
      <div
        un-flex="~ col"
        un-max-w="300px"
      >
        <div
          class="markdown-rendered"
          un-break-words
          un-whitespace-normal
          v-html="tooltipContent"
        />
        <slot name="tooltipAddons" />
      </div>
    </div>

    <div
      v-else
      un-bg="neutral-200 dark:neutral-800"
      un-text="neutral-800 dark:neutral-200"
      un-rounded-sm
      un-text-align-start
      un-py-2
      un-px-4
      un-shadow-lg
    >
      <slot
        name="tooltip"
      />
    </div>
  </FloatWindow>
</template>
