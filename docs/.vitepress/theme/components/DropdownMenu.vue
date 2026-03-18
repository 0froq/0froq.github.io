<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { onClickOutside, useElementBounding } from '@vueuse/core'

interface Props {
  visible?: boolean
  trigger?: 'hover' | 'click'
  placement?: 'bottom' | 'top' | 'left' | 'right'
  offset?: number
  width?: string
  gap?: number
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  trigger: 'hover',
  placement: 'bottom',
  offset: 4,
  width: 'auto',
  gap: 0,
})

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
}>()

const triggerRef = ref<HTMLElement | null>(null)
const dropdownRef = ref<HTMLElement | null>(null)
const internalVisible = ref(props.visible)

const isVisible = computed({
  get: () => internalVisible.value,
  set: (val) => {
    internalVisible.value = val
    emit('update:visible', val)
  },
})

watch(() => props.visible, (val) => {
  internalVisible.value = val
})

const triggerBounds = useElementBounding(triggerRef)

const dropdownStyle = computed(() => {
  const bounds = triggerBounds
  let top = 0
  let left = 0

  switch (props.placement) {
    case 'bottom':
      top = bounds.bottom.value + props.offset
      left = bounds.left.value
      break
    case 'top':
      top = bounds.top.value - props.offset
      left = bounds.left.value
      break
    case 'left':
      top = bounds.top.value
      left = bounds.left.value - props.offset
      break
    case 'right':
      top = bounds.top.value
      left = bounds.right.value + props.offset
      break
  }

  return {
    top: `${top}px`,
    left: `${left}px`,
    width: props.width === 'auto' ? `${bounds.width.value}px` : props.width,
    gap: `${props.gap}px`,
  }
})

function show() {
  if (props.trigger === 'hover') {
    isVisible.value = true
  }
}

function hide() {
  if (props.trigger === 'hover') {
    isVisible.value = false
  }
}

function toggle() {
  if (props.trigger === 'click') {
    isVisible.value = !isVisible.value
  }
}

onClickOutside(dropdownRef, () => {
  if (props.trigger === 'click') {
    isVisible.value = false
  }
})

// Handle mouse leaving both trigger and dropdown
let leaveTimer: ReturnType<typeof setTimeout> | null = null
function handleTriggerLeave() {
  if (props.trigger === 'hover') {
    leaveTimer = setTimeout(() => {
      isVisible.value = false
    }, 100)
  }
}

function handleTriggerEnter() {
  if (leaveTimer) {
    clearTimeout(leaveTimer)
    leaveTimer = null
  }
  show()
}

function handleDropdownEnter() {
  if (leaveTimer) {
    clearTimeout(leaveTimer)
    leaveTimer = null
  }
}

function handleDropdownLeave() {
  if (props.trigger === 'hover') {
    leaveTimer = setTimeout(() => {
      isVisible.value = false
    }, 100)
  }
}
</script>

<template>
  <div
    ref="triggerRef"
    un-inline-block
    @mouseenter="handleTriggerEnter"
    @mouseleave="handleTriggerLeave"
    @click="toggle"
  >
    <slot />
  </div>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="isVisible"
        ref="dropdownRef"
        class="dropdown-menu"
        :style="dropdownStyle"
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
        @mouseenter="handleDropdownEnter"
        @mouseleave="handleDropdownLeave"
      >
        <div
          un-flex="~ col"
          un-max-w="300px"
        >
          <slot name="content" />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.dropdown-menu {
  transform-origin: top left;
}
</style>
