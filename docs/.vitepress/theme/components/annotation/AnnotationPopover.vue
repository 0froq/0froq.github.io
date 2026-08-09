<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { resolveAuthError } from '~/i18n/annotation'
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

const { t } = useI18n({ useScope: 'global' })

const { isAuthenticated, isAuthenticating, deviceInfo, startDeviceFlow, authError, clearError } = useGitHubAuth()

const annotationText = ref('')
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const popoverRef = ref<HTMLElement | null>(null)

// 定位（340px 宽；absolute 文档坐标——视口坐标 + scroll，滚动跟随）
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
    position: 'absolute' as const,
    top: `${top + window.scrollY}px`,
    left: `${left + window.scrollX}px`,
    width: `${POPOVER_WIDTH}px`,
  }
})

// 引用预览：前 2 行截断
const previewText = computed(() => {
  const text = props.selectedPreview?.trim() ?? ''
  if (!text)
    return ''
  return text.length > 60 ? `${text.slice(0, 60)}…` : text
})

const authErrorMessage = computed(() => resolveAuthError(t, authError.value))

function handleSubmit() {
  const text = annotationText.value.trim()
  if (!text)
    return
  emit('submit', text)
  annotationText.value = ''
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
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
      class="annotation-popover garden-float-panel"
      un-z-50
      un-p-3
    >
      <!-- 引用预览 -->
      <div
        v-if="previewText"
        un-text-xs
        un-text="neutral-400 dark:neutral-500"
        un-italic
        un-border="l-2 neutral-300 dark:neutral-600"
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
          :placeholder="t('popover.placeholder')"
          un-w-full
          un-resize-none
          un-text-sm
          un-bg="neutral-200/20 dark:neutral-800/20"
          un-border="~ neutral-200 dark:neutral-800"
          un-rounded
          un-px-3
          un-py-1.5
          un-outline-none
          un-text="neutral-800 dark:neutral-200"
          un-placeholder="neutral-400 dark:neutral-600"
          un-focus="border-neutral-600 dark:border-neutral-400 rounded-lg"
          un-leading-relaxed
          @keydown="handleKeydown"
        />
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
            un-text="neutral-600 dark:neutral-400"
          >
            {{ t('popover.loginPrompt') }}
          </span>
          <button
            class="annotation-btn-primary"
            @click="startDeviceFlow"
          >
            {{ t('popover.loginButton') }}
          </button>
        </div>

        <!-- 连接中 -->
        <div
          v-if="isAuthenticating && !deviceInfo && !authError"
          un-text-sm
          un-text="neutral-500 dark:neutral-400"
          un-py-4
          un-text-center
        >
          {{ t('popover.connecting') }}
        </div>

        <!-- Device Flow 进行中 -->
        <div
          v-if="isAuthenticating && deviceInfo"
          un-text-sm
        >
          <div
            un-text="neutral-600 dark:neutral-400"
            un-mb-2
          >
            {{ t('popover.deviceFlowHint') }}
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
              un-bg="neutral-100 dark:neutral-700"
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
          <span>{{ authErrorMessage }}</span>
          <button
            un-text-xs
            un-underline
            @click="clearError"
          >
            {{ t('popover.retry') }}
          </button>
        </div>
      </template>
    </div>
  </Teleport>
</template>
