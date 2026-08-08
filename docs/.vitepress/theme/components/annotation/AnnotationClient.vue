<script setup lang="ts">
import type { AnnotationAnchor } from '../../types/annotation'
import { useRoute } from 'vitepress'
import { onBeforeUnmount, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { resolveAnnotationMessage } from '~/i18n/annotation'
import { useAnnotationHighlight } from '../../composables/useAnnotationHighlight'
import { useAnnotationHover } from '../../composables/useAnnotationHover'
import { useAnnotationPage } from '../../composables/useAnnotationPage'
import { useAnnotationSelection } from '../../composables/useAnnotationSelection'
import { useAnnotationStore } from '../../stores/annotation'
import AnnotationPopover from './AnnotationPopover.vue'

const { t, te } = useI18n({ useScope: 'global' })
const route = useRoute()
const store = useAnnotationStore()
const { clearAllHighlights, clearPendingHighlight } = useAnnotationHighlight()

const {
  submitting,
  loading,
  error,
  pendingAnchor,
  loadAnnotations,
  handleSubmit,
  bindRouteAndAuthWatchers,
  isAuthenticated,
} = useAnnotationPage()

const {
  selectionRect,
  showPopover,
  pendingText,
  prepareFromRange,
  closePopoverUi,
  bindSelectionLifecycle,
  clearPendingHighlight: clearPending,
} = useAnnotationSelection({
  pendingAnchor,
  onOpenPopover: () => {},
  onClearPopover: () => {},
})

const {
  hoveredCommentId,
  hoverPosition,
  isNarrowScreen,
  hoveredAnnotations,
  bindHoverLifecycle,
} = useAnnotationHover({ prepareFromRange })

bindRouteAndAuthWatchers()
bindSelectionLifecycle()
bindHoverLifecycle()

watch(() => route.path, () => {
  closePopoverUi()
})

async function onSubmit(
  text: string,
  anchorOverride?: AnnotationAnchor | null,
  replyToId?: string,
  replyToSnapshot?: { commentId: string, author: string, text: string },
) {
  showPopover.value = false
  selectionRect.value = null
  await handleSubmit(text, anchorOverride, replyToId, replyToSnapshot)
  closePopoverUi()
}

onMounted(() => {
  store.setSubmitHandler((text, anchor, replyToId, replyToSnapshot) =>
    handleSubmit(text, anchor, replyToId, replyToSnapshot))

  if (isAuthenticated.value)
    loadAnnotations()
})

onBeforeUnmount(() => {
  store.setSubmitHandler(null)
  clearAllHighlights()
  clearPendingHighlight()
  clearPending()
})
</script>

<template>
  <AnnotationPopover
    v-if="showPopover"
    :rect="selectionRect"
    :submitting="submitting"
    :selected-preview="pendingText"
    @submit="onSubmit"
    @close="closePopoverUi"
  />

  <div
    v-if="hoveredCommentId && hoverPosition && isNarrowScreen"
    class="annotation-hover-tip garden-float-panel"
    :style="{
      left: `${hoverPosition.x + 12}px`,
      top: `${hoverPosition.y + 12}px`,
    }"
    un-fixed
    un-z-50
    un-max-w-xs
    un-p-3
    un-text-sm
    un-text="stone-700 dark:stone-300"
    un-leading-relaxed
    un-pointer-events-none
  >
    <div
      v-for="ann in hoveredAnnotations"
      :key="ann.commentId"
      class="un-mb-2 last:un-mb-0"
      un-flex
      un-items-start
      un-gap-2
    >
      <img
        v-if="ann.author.avatarUrl"
        :src="ann.author.avatarUrl"
        un-w-5
        un-h-5
        un-rounded-full
        un-shrink-0
      >
      <div>
        <div
          un-text="xs stone-400 dark:stone-500"
          un-mb-0.5
        >
          {{ ann.author.login }}
        </div>
        <div un-whitespace-pre-wrap>
          {{ ann.data.text }}
        </div>
      </div>
    </div>
  </div>

  <div
    v-if="loading"
    un-fixed
    un-top-4
    un-right-4
    un-z-50
    un-text-xs
    un-text="stone-400 dark:stone-500"
    un-bg="white/80 dark:stone-800/80"
    un-rounded
    un-px-3
    un-py-1
  >
    {{ t('loading') }}
  </div>

  <div
    v-if="error"
    un-fixed
    un-top-4
    un-right-4
    un-z-50
    un-text-xs
    un-text="red-500"
    un-bg="white dark:stone-800"
    un-rounded
    un-px-3
    un-py-1
    un-border="~ red-300 dark:red-700"
  >
    {{ resolveAnnotationMessage(t, te, error) }}
    <button
      un-ml-2
      un-underline
      @click="error = null"
    >
      ×
    </button>
  </div>
</template>
