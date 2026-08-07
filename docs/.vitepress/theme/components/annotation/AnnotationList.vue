<script setup lang="ts">
import type { ResolvedAnnotation } from '../../types/annotation'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { setHoverHighlight } from '~/composables/useAnnotationHighlight'
import { repliesOf, topLevelNewestFirst } from '~/composables/useAnnotationThreads'
import { resolveAnnotationMessage } from '~/i18n/annotation'
import { useAnnotationStore } from '~/stores/annotation'
import AnnotationCard from './AnnotationCard.vue'

const emit = defineEmits<{
  select: [annotation: ResolvedAnnotation]
}>()

const { t, te } = useI18n({ useScope: 'global' })
const store = useAnnotationStore()
const { annotations, activeCommentId } = storeToRefs(store)
const { openReplyFloat, submitAnnotation } = store

const sorted = computed(() => topLevelNewestFirst(annotations.value))

const articleCommentText = ref('')
const submitting = ref(false)
const replyError = ref<string | null>(null)

function openReply(ann: ResolvedAnnotation, el?: HTMLElement | null) {
  openReplyFloat(ann, el)
}

async function submitArticleComment() {
  const text = articleCommentText.value.trim()
  if (!text) {
    replyError.value = 'error.empty'
    return
  }
  submitting.value = true
  replyError.value = null
  try {
    await submitAnnotation(text, null)
    articleCommentText.value = ''
  }
  catch (e: any) {
    replyError.value = e.message || 'error.comment'
  }
  finally {
    submitting.value = false
  }
}

function handleArticleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
    e.preventDefault()
    submitArticleComment()
  }
  else if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
    e.preventDefault()
    submitArticleComment()
  }
  else if (e.key === 'Escape') {
    articleCommentText.value = ''
  }
}
</script>

<template>
  <section
    class="annotation-list"
    un-mt-8
    un-pt-6
  >
    <h2
      un-text-lg
      un-font-semibold
      un-mb-4
    >
      {{ t('list.title', { count: annotations.length }) }}
    </h2>

    <div
      un-pb-4
      un-mb-4
    >
      <textarea
        v-model="articleCommentText"
        rows="2"
        :placeholder="t('list.articleCommentPlaceholder')"
        un-w-full
        un-resize-none
        un-transition-all
        un-text-sm
        un-bg="stone-200/20 dark:stone-800/20"
        un-border="~ stone-200 dark:stone-800"
        un-rounded-xs
        un-px-3
        un-py-2
        un-outline-none
        un-text="stone-800 dark:stone-200"
        un-placeholder="stone-400 dark:stone-600"
        un-leading-relaxed
        un-focus="border-stone-600 dark:border-stone-400 rounded-lg"
        @keydown="handleArticleKeydown"
      />
      <div
        un-flex
        un-items-center
        un-justify-between
        un-mt-2
      >
        <span
          v-if="replyError"
          un-text="xs red-500"
        >
          {{ resolveAnnotationMessage(t, te, replyError) }}
        </span>
        <div
          un-flex
          un-items-center
          un-gap-2
        >
          <button
            v-if="articleCommentText.trim()"
            class="annotation-btn-primary"
            :disabled="submitting"
            @click="submitArticleComment"
          >
            {{ submitting ? t('submitting') : t('comment') }}
          </button>
        </div>
      </div>
    </div>

    <div
      v-for="ann in sorted"
      :key="ann.commentId"
      class="annotation-list-item"
      un-mb-3
    >
      <AnnotationCard
        :anns="[ann]"
        :replies="repliesOf(annotations, ann.commentId)"
        :active-comment-id="activeCommentId"
        :truncate="false"
        show-anchor
        compact
        @reply="openReply"
        @select="emit('select', $event)"
        @hover="setHoverHighlight"
      />
    </div>
  </section>
</template>
