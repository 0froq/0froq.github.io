<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { resolveAnnotationMessage } from '~/i18n/annotation'
import { useAnnotationStore } from '~/stores/annotation'

const { t, te } = useI18n({ useScope: 'global' })
const store = useAnnotationStore()
const { replyTarget } = storeToRefs(store)
const { closeReplyFloat, submitAnnotation } = store

const text = ref('')
const submitting = ref(false)
const error = ref<string | null>(null)

watch(replyTarget, () => {
  text.value = ''
  error.value = null
})

const target = computed(() => replyTarget.value?.ann ?? null)
const anchorEl = computed(() => replyTarget.value?.el ?? null)

const replyPlaceholder = computed(() => {
  if (!target.value)
    return ''
  return target.value.parentCommentId
    ? t('reply.placeholderToUser', { user: `@${target.value.author.login}` })
    : t('reply.placeholderGeneric')
})

function close() {
  closeReplyFloat()
  text.value = ''
  error.value = null
}

const WIDTH = 340
const GAP = 8
const FLOAT_HEIGHT = 280

const floatStyle = computed(() => {
  if (!target.value)
    return {}
  const el = anchorEl.value
  if (!el)
    return { right: '1.5rem', bottom: '1.5rem' }
  const rect = el.getBoundingClientRect()
  let left: number
  if (rect.right + WIDTH + GAP <= window.innerWidth - 8)
    left = rect.right + GAP
  else if (rect.left - WIDTH - GAP >= 8)
    left = rect.left - WIDTH - GAP
  else
    left = Math.max(8, window.innerWidth - WIDTH - GAP - 8)
  const top = rect.bottom + GAP + FLOAT_HEIGHT > window.innerHeight
    ? Math.max(8, rect.top - FLOAT_HEIGHT - GAP)
    : rect.top
  return {
    left: `${left + window.scrollX}px`,
    top: `${Math.max(8, top) + window.scrollY}px`,
  }
})

async function submit() {
  const value = text.value.trim()
  if (!value) {
    error.value = 'error.empty'
    return
  }
  if (!target.value)
    return
  submitting.value = true
  error.value = null
  try {
    const ann = target.value
    const replyToId = ann.parentCommentId ?? ann.commentId
    const snapshot = {
      commentId: ann.commentId,
      author: ann.author.login,
      text: ann.data.text,
    }
    await submitAnnotation(value, null, replyToId, snapshot)
    close()
  }
  catch (e: any) {
    error.value = e.message || 'error.reply'
  }
  finally {
    submitting.value = false
  }
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
    e.preventDefault()
    submit()
  }
  else if (e.key === 'Escape') {
    close()
  }
}

function onOutsideClick(e: MouseEvent) {
  if (!target.value)
    return
  const el = e.target as HTMLElement
  if (el.closest('.annotation-float-reply'))
    return
  close()
}

onMounted(() => {
  document.addEventListener('mousedown', onOutsideClick)
})
onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onOutsideClick)
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="target"
      class="annotation-float-reply garden-float-panel"
      :style="{ ...floatStyle, width: `${WIDTH}px` }"
      un-absolute
      un-z-50
      un-p-3
    >
      <!-- 回复目标引用（与 AnnotationPopover 的 selected-preview 同款样式） -->
      <div
        un-text-xs
        un-text="neutral-400 dark:neutral-500"
        un-border="l-2 neutral-300 dark:neutral-600"
        un-pl-2
        un-mb-2
        un-leading-relaxed
      >
        {{ t('reply.replyTo') }}
        <span
          un-font-semibold
          un-text="neutral-600 dark:neutral-300"
        >
          {{ target.author.login }}
        </span>
        <div
          un-italic
          un-mt-1
          un-whitespace-pre-wrap
        >
          {{ target.data.text.slice(0, 60) }}{{ target.data.text.length > 60 ? '…' : '' }}
        </div>
      </div>

      <textarea
        v-model="text"
        rows="2"
        :placeholder="replyPlaceholder"
        autofocus
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
        @keydown="onKeydown"
      />
      <div
        v-if="error"
        un-text="xs red-500"
        un-mt-2
      >
        {{ resolveAnnotationMessage(t, te, error) }}
      </div>
    </div>
  </Teleport>
</template>
