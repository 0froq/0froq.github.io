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

const WIDTH = 288
const GAP = 12
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
  if (e.key === 'Enter') {
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
      class="annotation-float-reply"
      :style="floatStyle"
      un-absolute
      un-z-50
      un-w-72
      un-bg="stone-50/50 dark:stone-950/50"
      un-backdrop-blur-lg
      un-border="~ stone-400 dark:stone-600"
      un-rounded-xs
      un-shadow-lg
      un-p-3
    >
      <div
        un-text="xs stone-400 dark:stone-500"
        un-mb-2
        un-leading-relaxed
      >
        {{ t('reply.replyTo') }}
        <span
          un-font-semibold
          un-text="stone-600 dark:stone-300"
        >
          {{ target.author.login }}
        </span>
        <div
          un-text-xs
          un-text="stone-400 dark:stone-500"
          un-border="l-2 stone-300 dark:stone-600"
          un-pl-2
          un-mt-1
          un-leading-relaxed
          un-whitespace-pre-wrap
        >
          {{ target.data.text.slice(0, 80) }}{{ target.data.text.length > 80 ? '…' : '' }}
        </div>
      </div>
      <input
        v-model="text"
        type="text"
        :placeholder="replyPlaceholder"
        autofocus
        un-w-full
        un-text-sm
        un-bg="stone-200/20 dark:stone-800/20"
        un-border="~ stone-200 dark:stone-800"
        un-transition-all
        un-rounded
        un-px-3
        un-py-1.5
        un-outline-none
        un-text="stone-800 dark:stone-200"
        un-placeholder="stone-400 dark:stone-600"
        un-focus="border-stone-600 dark:border-stone-400 rounded-lg"
        @keydown="onKeydown"
      >
      <div
        un-flex
        un-items-center
        un-justify-between
        un-mt-2
      >
        <span
          v-if="error"
          un-text="xs red-500"
        >
          {{ resolveAnnotationMessage(t, te, error) }}
        </span>
      </div>
    </div>
  </Teleport>
</template>
