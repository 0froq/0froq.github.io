<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useGitHubAuth } from '../../composables/useGitHubAuth'

const props = defineProps<{
  /** 选区的 bounding rect，用于定位弹出位置 */
  rect: DOMRect | null
  /** 是否正在提交 */
  submitting?: boolean
}>()

const emit = defineEmits<{
  submit: [text: string]
  close: []
}>()

const { isAuthenticated, isAuthenticating, deviceInfo, startDeviceFlow, user, authError, clearError } = useGitHubAuth()

const annotationText = ref('')
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const popoverRef = ref<HTMLElement | null>(null)

// 定位
const popoverStyle = computed(() => {
  if (!props.rect) return { display: 'none' }
  const top = props.rect.bottom + 8 + window.scrollY
  const left = Math.max(8, Math.min(
    props.rect.left + (props.rect.width / 2) - 150,
    window.innerWidth - 316,
  ))
  return {
    position: 'fixed' as const,
    top: `${top}px`,
    left: `${left}px`,
    width: '300px',
    zIndex: 9999,
  }
})

function handleSubmit() {
  const text = annotationText.value.trim()
  if (!text) return
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
  // 认证进行中不关闭
  if (isAuthenticating.value) return
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
      bg="white dark:stone-800"
      border="~ stone-300 dark:stone-600"
      rounded-lg
      shadow-xl
      p-4
    >
      <!-- 未登录 -->
      <template v-if="!isAuthenticated">
        <div v-if="!isAuthenticating" text-sm text="stone-600 dark:stone-400" mb-3>
          登录 GitHub 以添加批注
        </div>
        <button
          v-if="!isAuthenticating"
          class="annotation-btn-primary"
          @click="startDeviceFlow"
        >
          使用 GitHub 登录
        </button>

        <!-- 连接中 -->
        <div v-if="isAuthenticating && !deviceInfo && !authError" text-sm text="stone-500 dark:stone-400" py-4 text-center>
          正在连接 GitHub…
        </div>

        <!-- Device Flow 进行中 -->
        <div v-if="isAuthenticating && deviceInfo" text-sm>
          <div text="stone-600 dark:stone-400" mb-2>
            请打开以下链接并输入验证码：
          </div>
          <div mb-2>
            <a
              :href="deviceInfo.verification_uri"
              target="_blank"
              text="blue-500 dark:blue-400"
              underline
              font-mono
            >
              {{ deviceInfo.verification_uri }}
            </a>
          </div>
          <div
            text="2xl"
            font-bold
            tracking-widest
            text-center
            py-2
            bg="stone-100 dark:stone-700"
            rounded
            select-all
            cursor-pointer
          >
            {{ deviceInfo.user_code }}
          </div>
        </div>

        <!-- 错误提示（独立于 deviceInfo） -->
        <div v-if="authError" text="red-500" text-xs mt-3>
          {{ authError }}
          <button ml-2 underline @click="clearError">重试</button>
        </div>
      </template>

      <!-- 已登录 -->
      <template v-else>
        <div flex items-center gap-2 mb-3>
          <img
            v-if="user?.avatar_url"
            :src="user.avatar_url"
            w-5 h-5
            rounded-full
          >
          <span text-sm text="stone-600 dark:stone-400">
            {{ user?.login }}
          </span>
        </div>

        <textarea
          ref="textareaRef"
          v-model="annotationText"
          rows="3"
          class="annotation-textarea"
          placeholder="写下批注…"
          bg="stone-50 dark:stone-900"
          border="~ stone-300 dark:stone-600"
          rounded
          p-2
          w-full
          text-sm
          resize-none
          @keydown="handleKeydown"
        />

        <div flex justify-end items-center gap-2 mt-2>
          <button
            class="annotation-btn-ghost"
            @click="emit('close')"
          >
            取消
          </button>
          <button
            class="annotation-btn-primary"
            :disabled="!annotationText.trim() || submitting"
            @click="handleSubmit"
          >
            <span v-if="submitting">提交中…</span>
            <span v-else>批注 ⌘⏎</span>
          </button>
        </div>
      </template>
    </div>
  </Teleport>
</template>

<style scoped>
.annotation-btn-primary {
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 13px;
  background: #0969da;
  color: #fff;
  border: none;
  cursor: pointer;
  transition: opacity 0.15s;
}
.annotation-btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.annotation-btn-primary:hover:not(:disabled) {
  background: #0860c0;
}
.annotation-btn-ghost {
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 13px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--vp-c-text-2);
}
.annotation-btn-ghost:hover {
  background: var(--vp-c-bg-soft);
}
.annotation-textarea {
  outline: none;
  font-family: inherit;
  line-height: 1.5;
}
.annotation-textarea:focus {
  border-color: #0969da;
}

/* dark mode */
html.dark .annotation-btn-primary {
  background: #1f6feb;
}
html.dark .annotation-btn-primary:hover:not(:disabled) {
  background: #388bfd;
}
</style>
