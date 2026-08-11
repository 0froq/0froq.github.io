<script setup lang="ts">
import type {
  AnnotationReactionContent,
  AnnotationReactionGroup,
} from '~/types/annotation'
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useGitHubAuth } from '~/composables/useGitHubAuth'
import { useGitHubDiscussions } from '~/composables/useGitHubDiscussions'
import { useAnnotationStore } from '~/stores/annotation'

const props = withDefaults(defineProps<{
  commentId: string
  reactions: AnnotationReactionGroup[]
  /** Expand the full picker (card / row hovered). */
  expanded?: boolean
  /** Tighter indent for nested replies. */
  compact?: boolean
}>(), {
  expanded: false,
  compact: false,
})

const { t } = useI18n({ useScope: 'global' })
const store = useAnnotationStore()
const { isAuthenticated, token, startDeviceFlow } = useGitHubAuth()
const { toggleReaction } = useGitHubDiscussions()

const PENDING_REACTION_CONTENTS: AnnotationReactionContent[] = [
  'THUMBS_UP',
  'HEART',
  'ROCKET',
  'LAUGH',
  'HOORAY',
  'EYES',
  'CONFUSED',
  'THUMBS_DOWN',
]

const EMOJI: Record<AnnotationReactionContent, string> = {
  THUMBS_UP: '👍',
  THUMBS_DOWN: '👎',
  LAUGH: '😄',
  HOORAY: '🎉',
  CONFUSED: '😕',
  HEART: '❤️',
  ROCKET: '🚀',
  EYES: '👀',
}

const busy = ref<AnnotationReactionContent | null>(null)

const visible = computed(() => {
  if (props.expanded)
    return PENDING_REACTION_CONTENTS
  return PENDING_REACTION_CONTENTS.filter((c) => {
    const g = props.reactions.find(r => r.content === c)
    return g && g.count > 0
  })
})

const innerEl = ref<HTMLElement | null>(null)
const innerHeight = ref('0px')
const heightReady = ref(false)

async function syncHeight() {
  await nextTick()
  innerHeight.value = `${innerEl.value?.scrollHeight ?? 0}px`
  // Skip the enter-animation on first paint; only animate later changes.
  requestAnimationFrame(() => {
    heightReady.value = true
  })
}

watch(visible, syncHeight, { flush: 'post' })
onMounted(syncHeight)

function groupFor(content: AnnotationReactionContent): AnnotationReactionGroup | undefined {
  return props.reactions.find(r => r.content === content)
}

async function onToggle(content: AnnotationReactionContent) {
  if (!isAuthenticated.value || !token.value) {
    void startDeviceFlow()
    return
  }
  if (busy.value)
    return

  const existing = groupFor(content)
  const remove = !!existing?.viewerHasReacted
  busy.value = content
  try {
    const next = await toggleReaction(props.commentId, content, remove, token.value)
    store.patchReactions(props.commentId, next)
  }
  catch (e) {
    console.error('[annotation] reaction failed:', e)
  }
  finally {
    busy.value = null
  }
}
</script>

<template>
  <div
    class="annotation-reactions"
    :class="{
      'annotation-reactions--expanded': expanded,
      'annotation-reactions--compact': compact,
    }"
    @click.stop
  >
    <div
      class="annotation-reactions-height"
      :class="{ 'annotation-reactions-height--ready': heightReady }"
      :style="{ height: innerHeight }"
    >
      <div
        ref="innerEl"
        class="annotation-reactions-inner"
        un-flex
        un-flex-wrap
        un-items-center
        un-gap-1
      >
        <button
          v-for="content in visible"
          :key="content"
          type="button"
          class="annotation-reaction-btn"
          :class="{
            'annotation-reaction-btn--active': groupFor(content)?.viewerHasReacted,
            'annotation-reaction-btn--busy': busy === content,
          }"
          :title="t(`reaction.${content}`)"
          :disabled="busy !== null"
          un-inline-flex
          un-items-center
          un-gap-0.5
          un-px-1.5
          un-py-0.5
          un-rounded-xs
          un-text-xs
          un-border="~ neutral-400 dark:neutral-700 hover:neutral-700 dark:hover:neutral-400"
          un-bg="neutral-50/60 dark:neutral-800/60"
          un-cursor-pointer
          un-transition
          @click="onToggle(content)"
        >
          <span>{{ EMOJI[content] }}</span>
          <span
            v-if="groupFor(content)?.count"
            un-text="neutral-500 dark:neutral-400"
            un-font-mono
          >
            {{ groupFor(content)?.count }}
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.annotation-reactions {
  --uno: 'ml-8';
}
.annotation-reactions--compact {
  --uno: 'ml-6';
}

.annotation-reactions-height {
  overflow: hidden;
}
.annotation-reactions-height--ready {
  transition: height 0.25s ease;
}

.annotation-reactions-inner {
  opacity: 0;
  transition: opacity 0.2s ease;
}
.annotation-reactions--expanded .annotation-reactions-inner,
.annotation-reactions-inner:has(.annotation-reaction-btn) {
  opacity: 1;
  padding-top: 0.25rem;
}

.annotation-reaction-btn--active {
  --uno: 'border-neutral-950 dark:border-neutral-300 bg-neutral-50 dark:bg-neutral-800';
}
.annotation-reaction-btn--busy {
  --uno: 'opacity-50';
}
.annotation-reactions:not(.annotation-reactions--expanded) .annotation-reaction-btn {
  --uno: 'pointer-events-none';
}
.annotation-reactions--expanded .annotation-reaction-btn {
  --uno: 'pointer-events-auto';
}
</style>
