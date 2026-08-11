<script setup lang="ts">
import type {
  AnnotationReactionContent,
  AnnotationReactionGroup,
} from '~/types/annotation'
import { storeToRefs } from 'pinia'
import { useData, useRoute } from 'vitepress'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useGitHubAuth } from '~/composables/useGitHubAuth'
import { useGitHubDiscussions } from '~/composables/useGitHubDiscussions'
import { useAnnotationStore } from '~/stores/annotation'

const SLASHES_RE = /^\/+|\/+$/g

const { t } = useI18n({ useScope: 'global' })
const route = useRoute()
const { page } = useData()
const store = useAnnotationStore()
const { discussionId, discussionReactions } = storeToRefs(store)
const { isAuthenticated, token, startDeviceFlow } = useGitHubAuth()
const { findOrCreateDiscussion, toggleReaction } = useGitHubDiscussions()

const REACTION_CONTENTS: AnnotationReactionContent[] = [
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

const pagePath = computed(() => {
  let p = route.path.replace(SLASHES_RE, '')
  if (!p)
    p = 'index'
  return p
})

const pageTitle = computed(
  () => page.value.title || (typeof document !== 'undefined' ? document.title : '') || route.path,
)

const reactions = computed(() => discussionReactions.value)

function groupFor(content: AnnotationReactionContent): AnnotationReactionGroup | undefined {
  return reactions.value.find(r => r.content === content)
}

async function ensureDiscussionId(): Promise<string | null> {
  if (discussionId.value)
    return discussionId.value
  if (!token.value)
    return null
  const discussion = await findOrCreateDiscussion(
    pagePath.value,
    t('discussionTitle', { title: pageTitle.value }),
    token.value,
  )
  store.setDiscussion(discussion.id, discussion.reactions)
  return discussion.id
}

async function onToggle(content: AnnotationReactionContent) {
  if (!isAuthenticated.value || !token.value) {
    void startDeviceFlow()
    return
  }
  if (busy.value)
    return

  busy.value = content
  try {
    const id = await ensureDiscussionId()
    if (!id)
      return
    const existing = groupFor(content)
    const remove = !!existing?.viewerHasReacted
    const next = await toggleReaction(id, content, remove, token.value)
    store.patchDiscussionReactions(next)
  }
  catch (e) {
    console.error('[annotation] discussion reaction failed:', e)
  }
  finally {
    busy.value = null
  }
}
</script>

<template>
  <div
    class="discussion-reactions"
    un-flex
    un-flex-wrap
    un-items-center
    un-gap-1
  >
    <button
      v-for="content in REACTION_CONTENTS"
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
</template>

<style scoped>
.annotation-reaction-btn--active {
  --uno: 'border-neutral-950 dark:border-neutral-300 bg-neutral-50 dark:bg-neutral-800';
}
.annotation-reaction-btn--busy {
  --uno: 'opacity-50';
}
</style>
