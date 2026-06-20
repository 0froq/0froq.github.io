<script setup lang="ts">
import { useEventListener } from '@vueuse/core'
import { computed, onMounted, ref } from 'vue'

export interface FloatWindowProps {
  visible?: boolean
  triggerRef?: HTMLElement | null
  followMouse?: boolean
  placement?: 'bottom' | 'top' | 'left' | 'right'
  offset?: number
  mouseMargin?: number
  teleportTo?: string
  disableTeleport?: boolean
}

const props = withDefaults(defineProps<FloatWindowProps>(), {
  visible: false,
  followMouse: true,
  placement: 'bottom',
  offset: 8,
  mouseMargin: 10,
  teleportTo: 'body',
  disableTeleport: false,
})

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
}>()

const windowRef = ref<HTMLElement | null>(null)

const mouseX = ref(0)
const mouseY = ref(0)

const windowStyle = computed(() => {
  if (props.followMouse) {
    return {
      left: `${mouseX.value}px`,
      top: `${mouseY.value}px`,
    }
  }

  // Access visible to make this computed reactive to visibility changes,
  // ensuring getBoundingClientRect() returns fresh position on each show.
  if (!props.visible || !props.triggerRef) {
    return { left: '0px', top: '0px' }
  }

  const rect = props.triggerRef.getBoundingClientRect()

  let top = 0
  let left = 0

  switch (props.placement) {
    case 'bottom':
      top = rect.bottom + props.offset
      left = rect.left
      break
    case 'top':
      top = rect.top - props.offset
      left = rect.left
      break
    case 'left':
      top = rect.top
      left = rect.left - props.offset
      break
    case 'right':
      top = rect.top
      left = rect.right + props.offset
      break
  }

  return {
    top: `${top}px`,
    left: `${left}px`,
  }
})

async function updateMousePosition(e: MouseEvent) {
  if (!props.followMouse)
    return

  let newX = e.clientX + props.mouseMargin
  let newY = e.clientY + props.mouseMargin

  if (windowRef.value) {
    const rect = windowRef.value.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    if (newX + rect.width > viewportWidth) {
      newX = e.clientX - rect.width - props.mouseMargin
    }
    if (newY + rect.height > viewportHeight) {
      newY = e.clientY - rect.height - props.mouseMargin
    }
  }

  mouseX.value = newX
  mouseY.value = newY
}

function close() {
  emit('update:visible', false)
}

onMounted(() => {
  useEventListener(['resize', 'scroll'], close)
})

defineExpose({
  updateMousePosition,
  close,
})
</script>

<template>
  <component
    :is="disableTeleport ? 'div' : 'Teleport'"
    :to="teleportTo"
  >
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="visible"
        ref="windowRef"
        class="float-window"
        :style="windowStyle"
        un-fixed
        un-z-50
      >
        <slot />
      </div>
    </Transition>
  </component>
</template>

<style scoped>
.float-window {
  transform-origin: top left;
}
</style>
