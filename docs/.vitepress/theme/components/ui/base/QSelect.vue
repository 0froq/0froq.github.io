<script setup lang="ts">
import { useEventListener } from '@vueuse/core'
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

const props = withDefaults(defineProps<{
  modelValue?: string | string[]
  items: string[]
  placeholder?: string
  multiple?: boolean
}>(), {
  multiple: false,
})

const emit = defineEmits(['update:modelValue'])

const open = ref(false)
const buttonRef = ref<HTMLElement | null>(null)
const popupStyle = ref<Record<string, string>>({})
const popupId = `qselect-popup-${Math.random().toString(36).slice(2, 8)}`

const selectedLabel = computed(() => {
  if (Array.isArray(props.modelValue))
    return props.modelValue.length ? props.modelValue.join(', ') : (props.placeholder ?? 'Select')
  return props.modelValue ?? props.placeholder ?? 'Select'
})

function calculatePosition() {
  const btn = buttonRef.value
  if (!btn)
    return
  const rect = btn.getBoundingClientRect()
  const popupWidth = Math.max(rect.width, 200)
  const estimatedHeight = 240

  // default place below the button
  let top = rect.bottom + window.scrollY
  let left = rect.left + window.scrollX

  const spaceBelow = window.innerHeight - rect.bottom
  const spaceAbove = rect.top
  if (spaceBelow < estimatedHeight && spaceAbove > spaceBelow) {
    // place above
    top = rect.top + window.scrollY - estimatedHeight
  }

  // clamp horizontally
  if (left + popupWidth > window.innerWidth) {
    left = Math.max(8, window.innerWidth - popupWidth - 8)
  }
  if (left < 8)
    left = 8

  popupStyle.value = {
    position: 'absolute',
    top: `${top}px`,
    left: `${left}px`,
    width: `${popupWidth}px`,
    zIndex: '9999',
  }
}

function scrollSelectedIntoView() {
  const popup = document.getElementById(popupId)
  if (!popup)
    return
  const selectedEl = popup.querySelector('[data-selected="true"]') as HTMLElement | null
  if (!selectedEl)
    return
  selectedEl.scrollIntoView({ block: 'nearest', inline: 'nearest' })
}

async function openSelect() {
  open.value = !open.value
  if (open.value) {
    await nextTick()
    // initial calculate
    calculatePosition()
    scrollSelectedIntoView()
    // ensure layout/fonts settle: recalc on next animation frames and a short timeout
    requestAnimationFrame(() => {
      calculatePosition()
      scrollSelectedIntoView()
    })
    requestAnimationFrame(() => {
      setTimeout(() => {
        calculatePosition()
        scrollSelectedIntoView()
      }, 50)
    })
  }
}

function isSelected(item: string) {
  if (Array.isArray(props.modelValue))
    return props.modelValue.includes(item)
  return props.modelValue === item
}

function selectItem(item: string) {
  if (props.multiple || Array.isArray(props.modelValue)) {
    const current = Array.isArray(props.modelValue) ? [...props.modelValue] : []
    const index = current.indexOf(item)
    if (index === -1)
      current.push(item)
    else
      current.splice(index, 1)
    emit('update:modelValue', current)
    return
  }
  emit('update:modelValue', item)
  open.value = false
}

function handleClickOutside(e: MouseEvent) {
  const target = e.target as Node
  const btn = buttonRef.value
  const popup = document.getElementById(popupId)
  if (!btn)
    return
  if (btn.contains(target))
    return
  if (popup && popup.contains(target))
    return
  open.value = false
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape')
    open.value = false
}

useEventListener(window, 'resize', () => {
  if (open.value)
    calculatePosition()
})
useEventListener(window, 'scroll', () => {
  if (open.value)
    calculatePosition()
}, { passive: true })

useEventListener(document, 'click', handleClickOutside)
useEventListener(document, 'keydown', onKeydown)

// onMounted(() => {
//   window.addEventListener('click', handleClickOutside)
//   window.addEventListener('keydown', onKeydown)
// })
// onBeforeUnmount(() => {
//   window.removeEventListener('click', handleClickOutside)
//   window.removeEventListener('keydown', onKeydown)
// })
</script>

<template>
  <div
    un-flex="~ row"
    un-items-center
  >
    <button
      ref="buttonRef"
      un-h-fit
      un-px-4
      un-text="neutral-800 dark:neutral-200"
      un-underline="~ px neutral-400 dark:neutral-600 hover:neutral-700 dark:hover:neutral-300"
      un-flex="~ row"
      un-items-center
      un-text-nowrap
      un-justify-between
      un-cursor-pointer
      un-gap-2
      @click="openSelect"
    >
      <span>{{ multiple ? `${props.modelValue?.length} selected` : selectedLabel }}</span>
    </button>
    <un-i-ph-caret-down-duotone
      un-text="neutral-500 dark:neutral-400"
      un-text-lg
      :class="{ 'rotate-90': !open }"
      un-transition-transform
    />
  </div>

  <Teleport to="body">
    <div
      v-if="open"
      :id="popupId"
      :style="popupStyle"
      un-bg="neutral-100 dark:neutral-900"
      un-shadow-lg
      un-border="~ neutral-700 dark:neutral-300"
      un-overflow-auto
      un-max-h-320px
    >
      <ul>
        <li
          v-for="item in props.items"
          :key="item"
          :data-selected="isSelected(item)"
          un-p-1
          un-cursor-pointer
          un-text-sm
          un-break-normal
          un-transition-colors
          :un-bg="isSelected(item) ? 'neutral-700 dark:neutral-300' : 'hover:neutral-300 dark:hover:neutral-700'"
          :un-text="isSelected(item) ? 'neutral-100 dark:neutral-900' : 'neutral-800 dark:neutral-200'"
          @click="selectItem(item)"
          @mouseenter.prevent
        >
          {{ item }}
        </li>
      </ul>
    </div>
  </Teleport>
</template>
