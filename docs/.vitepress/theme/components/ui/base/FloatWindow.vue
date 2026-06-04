<script setup lang="ts">
import { useEventListener } from '@vueuse/core'
import { computed, nextTick, onMounted, ref } from 'vue'

export interface FloatWindowProps {
  /** 是否可见（v-model） */
  visible?: boolean
  /** 触发元素的 ref */
  triggerRef?: HTMLElement | null
  /** 是否跟随鼠标，false 则固定在触发元素旁 */
  followMouse?: boolean
  /** 固定位置时的方位 */
  placement?: 'bottom' | 'top' | 'left' | 'right'
  /** 固定位置时的偏移量 */
  offset?: number
  /** 跟随鼠标时的边距 */
  mouseMargin?: number
  /** Teleport 目标 */
  teleportTo?: string
  /** 是否禁用 Teleport */
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

// 鼠标位置（跟随鼠标模式）
const mouseX = ref(0)
const mouseY = ref(0)

// 元素边界（固定位置模式）- 使用传入的 triggerRef
const triggerBounds = computed(() => {
  if (!props.triggerRef) return null
  const rect = props.triggerRef.getBoundingClientRect()
  return {
    top: rect.top,
    bottom: rect.bottom,
    left: rect.left,
    right: rect.right,
    width: rect.width,
    height: rect.height,
  }
})

// 计算悬浮窗口位置样式
const windowStyle = computed(() => {
  if (props.followMouse) {
    return {
      left: `${mouseX.value}px`,
      top: `${mouseY.value}px`,
    }
  }

  const bounds = triggerBounds.value
  if (!bounds) {
    return { left: '0px', top: '0px' }
  }

  let top = 0
  let left = 0

  switch (props.placement) {
    case 'bottom':
      top = bounds.bottom + props.offset
      left = bounds.left
      break
    case 'top':
      top = bounds.top - props.offset
      left = bounds.left
      break
    case 'left':
      top = bounds.top
      left = bounds.left - props.offset
      break
    case 'right':
      top = bounds.top
      left = bounds.right + props.offset
      break
  }

  return {
    top: `${top}px`,
    left: `${left}px`,
  }
})

// 更新鼠标位置并检查边界
async function updateMousePosition(e: MouseEvent) {
  if (!props.followMouse) return

  let newX = e.clientX + props.mouseMargin
  let newY = e.clientY + props.mouseMargin

  // 检查视口边界
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

// 关闭窗口
function close() {
  emit('update:visible', false)
}

// 监听 resize/scroll 关闭窗口
onMounted(() => {
  useEventListener(['resize', 'scroll'], close)
})

// 暴露方法给父组件
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
