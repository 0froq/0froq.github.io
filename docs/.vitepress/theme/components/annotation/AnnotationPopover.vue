<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useGitHubAuth } from '../../composables/useGitHubAuth'

const props = defineProps<{
  /** 选区的 bounding rect，用于定位弹出位置 */
  rect: DOMRect | null
  /** 选中的文本预览（引用） */
  selectedPreview?: string
  /** 是否正在提交 */
  submitting?: boolean
}>()

const emit = defineEmits<{
  submit: [text: string]
  close: []
}>()

const { isAuthenticated, isAuthenticating, deviceInfo, startDeviceFlow, authError, clearError } = useGitHubAuth()

const annotationText = ref('')
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const popoverRef = ref<HTMLElement | null>(null)

// 定位（340px 宽；fixed 基于视口坐标，rect 已含滚动偏移，不能加 scrollY）
const POPOVER_WIDTH = 340
const POPOVER_GAP = 8

const popoverStyle = computed(() => {
  if (!props.rect)
    return { display: 'none' }

  const vw = window.innerWidth
  const vh = window.innerHeight

  // 水平：居中于选区，钳制在视口内
  const left = Math.max(8, Math.min(
    props.rect.left + (props.rect.width / 2) - POPOVER_WIDTH / 2,
    vw - POPOVER_WIDTH - 8,
  ))

  // 垂直：优先选区下方；放不下则翻转至上方
  let top = props.rect.bottom + POPOVER_GAP
  if (top + 200 > vh) {
    top = Math.max(8, props.rect.top - 200 - POPOVER_GAP)
  }

  return {
    position: 'fixed' as const,
    top: `${top}px`,
    left: `${left}px`,
    width: `${POPOVER_WIDTH}px`,
    zIndex: 9999,
  }
})

// 引用预览：前 2 行截断
const previewText = computed(() => {
  const t = props.selectedPreview?.trim() ?? ''
  if (!t)
    return ''
  return t.length > 60 ? `${t.slice(0, 60)}…` : t
})

function handleSubmit() {
  const text = annotationText.value.trim()
  if (!text)
    return
  emit('submit', text)
  annotationText.value = ''
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
    e.preventDefault()
    handleSubmit()
  }
  if (e.key === 'Escape') {
    emit('close')
  }
}

// 点击外部关闭
function handleClickOutside(e: MouseEvent) {
  if (isAuthenticating.value)
    return
  if (popoverRef.value && !popoverRef.value.contains(e.target as Node)) {
    emit('close')
  }
}

onMounted(async () => {
  await nextTick()
  textareaRef.value?.focus()
  document.addEventListener('mousedown', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})

// 打开 popover 时重置错误
watch(() => props.rect, () => {
  clearError()
})
</script>

<template>
  <Teleport to="body">
    <div
      ref="popoverRef"
      :style="popoverStyle"
      class="annotation-popover"
      un-bg="white dark:stone-800"
      un-border="~ stone-300 dark:stone-600"
      un-rounded
      un-shadow-lg
      un-p-3
    >
      <!-- 引用预览 -->
      <div
        v-if="previewText"
        un-text-xs
        un-text="stone-400 dark:stone-500"
        un-italic
        un-border="l-2 stone-300 dark:stone-600"
        un-pl-2
        un-mb-2
        un-leading-relaxed
      >
        {{ previewText }}
      </div>

      <!-- 已登录：输入框 -->
      <template v-if="isAuthenticated">
        <textarea
          ref="textareaRef"
          v-model="annotationText"
          rows="2"
          placeholder="写下批注…"
          un-w-full
          un-resize-none
          un-text-sm
          un-bg="transparent"
          un-border-none
          un-outline-none
          un-text="stone-800 dark:stone-200"
          un-placeholder="stone-400 dark:stone-500"
          un-leading-relaxed
          @keydown="handleKeydown"
        />
        <div
          un-flex
          un-items-center
          un-justify-between
          un-mt-2
        >
          <span
            un-text="xs stone-400 dark:stone-500"
          >
            ⌘⏎ 提交 · Esc 取消
          </span>
          <button
            class="annotation-btn-primary"
            :disabled="submitting || !annotationText.trim()"
            @click="handleSubmit"
          >
            {{ submitting ? '提交中…' : '批注' }}
          </button>
        </div>
      </template>

      <!-- 未登录：紧凑登录 -->
      <template v-else>
        <div
          v-if="!isAuthenticating && !authError"
          un-flex
          un-items-center
          un-justify-between
        >
          <span
            un-text-sm
            un-text="stone-600 dark:stone-400"
          >
            登录以添加批注
          </span>
          <button
            class="annotation-btn-primary"
            @click="startDeviceFlow"
          >
            使用 GitHub 登录
          </button>
        </div>

        <!-- 连接中 -->
        <div
          v-if="isAuthenticating && !deviceInfo && !authError"
          un-text-sm
          un-text="stone-500 dark:stone-400"
          un-py-4
          un-text-center
        >
          正在连接 GitHub…
        </div>

        <!-- Device Flow 进行中 -->
        <div
          v-if="isAuthenticating && deviceInfo"
          un-text-sm
        >
          <div
            un-text="stone-600 dark:stone-400"
            un-mb-2
          >
            打开链接并输入验证码：
          </div>
          <div
            un-flex
            un-items-center
            un-gap-2
            un-mb-2
          >
            <a
              :href="deviceInfo.verification_uri"
              target="_blank"
              un-text="blue-600 dark:blue-400"
              un-underline
              un-text-sm
            >
              {{ deviceInfo.verification_uri }}
            </a>
            <code
              un-text-xs
              un-bg="stone-100 dark:stone-700"
              un-rounded
              un-px-1
              un-py-0.5
              un-font-mono
            >
              {{ deviceInfo.user_code }}
            </code>
          </div>
        </div>

        <!-- 认证错误 -->
        <div
          v-if="authError"
          un-text-sm
          un-text="red-500"
          un-flex
          un-items-center
          un-justify-between
        >
          <span>{{ authError }}</span>
          <button
            un-text-xs
            un-underline
            @click="clearError"
          >
            重试
          </button>
        </div>
      </template>
    </div>
  </Teleport>
</template>

<style scoped>
.annotation-btn-primary {
  @apply un-px-3 un-py-1 un-text-xs un-rounded un-bg-stone-900 dark:un-bg-stone-100 un-text-white dark:un-text-stone-900 un-transition un-duration-300;
}
.annotation-btn-primary:hover:not(:disabled) {
  @apply un-opacity-80;
}
.annotation-btn-primary:disabled {
  @apply un-opacity-40 un-cursor-not-allowed;
}
</style>
