<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  /** 选区 bounding rect（viewport 坐标） */
  rect: DOMRect | null
  /** 选中的文本（用于复制） */
  text: string
  /** 是否可评论（选区在文章内容区内） */
  canComment?: boolean
}>()

const emit = defineEmits<{
  comment: []
}>()

const { t } = useI18n({ useScope: 'global' })

const barRef = ref<HTMLElement | null>(null)
const copied = ref(false)
// bump to recompute barStyle once real width/height are measurable
const measured = ref(0)
onMounted(async () => {
  await nextTick()
  measured.value++
})

/**
 * 选区进行中（鼠标未松开）时整个工具栏不渲染。
 * 原因：向上选择文本时，实时跟随的工具栏会出现在鼠标上方，浏览器会把
 * 选区延伸到工具栏内的文本节点，造成选区闪烁/跳动。pointer-events:none
 * 无法阻止这种 selection 延伸，只能在选区进行中不渲染，松手后再显示。
 */
const isSelecting = ref(false)
function onDocMouseDown(e: MouseEvent) {
  if (barRef.value?.contains(e.target as Node))
    return
  isSelecting.value = true
}
function onDocMouseUp() {
  isSelecting.value = false
}
onMounted(() => {
  document.addEventListener('mousedown', onDocMouseDown, true)
  document.addEventListener('mouseup', onDocMouseUp, true)
})
onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onDocMouseDown, true)
  document.removeEventListener('mouseup', onDocMouseUp, true)
})

const BAR_GAP = 18

const barStyle = computed(() => {
  void measured.value // depend on measurement pass
  if (!props.rect)
    return { display: 'none' }
  const vw = window.innerWidth
  const width = barRef.value?.offsetWidth ?? 96
  const height = barRef.value?.offsetHeight ?? 30
  const left = Math.max(8, Math.min(
    props.rect.left + props.rect.width / 2 - width / 2,
    vw - width - 8,
  ))
  // 默认放选区上方；贴顶则放下方
  let top = props.rect.top - height - BAR_GAP
  if (top < 8)
    top = props.rect.bottom + BAR_GAP
  return {
    position: 'fixed' as const,
    top: `${top}px`,
    left: `${left}px`,
  }
})

async function onCopy() {
  try {
    await navigator.clipboard.writeText(props.text)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 1200)
  }
  catch { /* clipboard denied */ }
}

function onComment() {
  emit('comment')
}
</script>

<template>
  <Teleport to="body">
    <div
      ref="barRef"
      class="selection-toolbar annotation-popover"
      :class="{ 'selection-toolbar--inert': isSelecting }"
      :style="barStyle"
      un-z-50
      un-flex
      un-items-center
      un-gap-0.5
      un-p-1
      un-rounded-md
      @mousedown.prevent
    >
      <button
        class="selection-toolbar-btn"
        :title="t('selection.copy')"
        @click="onCopy"
      >
        <span un-text-xs>{{ copied ? t('selection.copied') : t('selection.copy') }}</span>
      </button>
      <button
        v-if="canComment"
        class="selection-toolbar-btn"
        :title="t('selection.comment')"
        @click="onComment"
      >
        <span un-text-xs>{{ t('selection.comment') }}</span>
      </button>
    </div>
  </Teleport>
</template>

<style scoped>
.selection-toolbar {
  background: #fafaf9;
  color: #44403c;
  border: 1px solid rgb(120 113 108 / 0.25);
  box-shadow:
    0 1px 2px rgb(28 25 23 / 0.08),
    0 8px 24px -8px rgb(28 25 23 / 0.18);
}
.dark .selection-toolbar {
  background: #1c1917;
  color: #e7e5e4;
  border-color: rgb(168 162 158 / 0.3);
  box-shadow:
    0 1px 2px rgb(0 0 0 / 0.4),
    0 8px 24px -8px rgb(0 0 0 / 0.5);
}
/* 选区进行中：工具栏可见但不可交互、不可被选中，
 * 防止鼠标滑入或选区延伸到工具栏文本造成闪烁。 */
.selection-toolbar--inert {
  pointer-events: none;
  user-select: none;
  -webkit-user-select: none;
}
.selection-toolbar-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 7px;
  border-radius: 5px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: inherit;
  white-space: nowrap;
}
.selection-toolbar-btn:hover {
  background: rgb(120 113 108 / 0.12);
}
.dark .selection-toolbar-btn:hover {
  background: rgb(168 162 158 / 0.16);
}
</style>
