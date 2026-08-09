<script setup lang="ts">
import type { ResolvedAnnotation } from '../../types/annotation'
import { storeToRefs } from 'pinia'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { setHoverHighlight } from '~/composables/useAnnotationHighlight'
import { groupReplies, repliesOf } from '~/composables/useAnnotationThreads'
import { useAnnotationStore } from '~/stores/annotation'
import AnnotationCard from './AnnotationCard.vue'

const { t } = useI18n({ useScope: 'global' })
const store = useAnnotationStore()
const { annotations, activeCommentId } = storeToRefs(store)
const { openReplyFloat, setActiveCommentId } = store

const cardEls = ref<Record<string, HTMLElement | null>>({})
const railEl = ref<HTMLElement | null>(null)
const railContainer = ref<HTMLElement | null>(null)
const animReady = ref(false)
const cardHeights = ref<Record<string, number>>({})

function openReply(ann: ResolvedAnnotation, el?: HTMLElement | null) {
  openReplyFloat(ann, el)
}

let cardObserver: ResizeObserver | null = null
let rafId = 0

function onCardResize() {
  cancelAnimationFrame(rafId)
  rafId = requestAnimationFrame(measureHeights)
}

function setCardEl(commentId: string) {
  return (el: unknown) => {
    if (el instanceof HTMLElement) {
      cardEls.value[commentId] = el
      cardObserver?.observe(el)
    }
    else {
      const prev = cardEls.value[commentId]
      if (prev)
        cardObserver?.unobserve(prev)
      delete cardEls.value[commentId]
    }
  }
}

function measureHeights() {
  const next: Record<string, number> = {}
  for (const [id, el] of Object.entries(cardEls.value)) {
    if (el)
      next[id] = el.offsetHeight
  }
  cardHeights.value = next
}

const anchored = computed(() => annotations.value.filter(a => a.matchState === 'exact' || a.matchState === 'approximate'))
const unanchored = computed(() => annotations.value.filter(a => a.matchState === 'ambiguous' || a.matchState === 'stale'))

interface AnchoredGroup {
  key: string
  anns: ResolvedAnnotation[]
}

const anchoredGroups = computed<AnchoredGroup[]>(() => {
  const groups = new Map<string, ResolvedAnnotation[]>()
  for (const ann of anchored.value) {
    const sel = ann.data.anchor?.selected ?? `__noanchor__${ann.commentId}`
    const list = groups.get(sel) ?? []
    list.push(ann)
    groups.set(sel, list)
  }
  return Array.from(groups.values(), anns => ({
    key: anns[0].commentId,
    anns: [...anns].sort((a, b) =>
      new Date(a.data.createdAt).getTime() - new Date(b.data.createdAt).getTime(),
    ),
  }))
    .sort((a, b) => anchorTop(a.anns[0]) - anchorTop(b.anns[0]))
})

const CARD_GAP = 12

const cardPositions = computed<Record<string, { top: number }>>(() => {
  const positions: Record<string, { top: number }> = {}
  let cursor = 0
  for (const group of anchoredGroups.value) {
    const docTop = anchorTop(group.anns[0])
    const height = cardHeights.value[group.key] ?? 80
    const top = Math.max(docTop, cursor)
    positions[group.key] = { top }
    cursor = top + height + CARD_GAP
  }
  return positions
})

function anchorTop(ann: ResolvedAnnotation): number {
  if (!ann.domRange)
    return 0
  try {
    const rect = ann.domRange.getBoundingClientRect()
    const containerTop = railContainer.value?.getBoundingClientRect().top ?? 0
    return rect.top - containerTop
  }
  catch {
    return 0
  }
}

const unanchoredTop = computed(() => {
  if (anchored.value.length === 0)
    return 0
  const last = anchoredGroups.value.at(-1)
  const pos = cardPositions.value[last?.key ?? '']
  const height = cardHeights.value[last?.key ?? ''] ?? 80
  if (!pos)
    return 0
  return pos.top + height + 24
})

watch(annotations, () => {
  nextTick(measureHeights)
})

onMounted(() => {
  railContainer.value = railEl.value?.parentElement ?? null
  cardObserver = new ResizeObserver(onCardResize)
  measureHeights()
  window.addEventListener('resize', measureHeights)
  setTimeout(() => {
    measureHeights()
    nextTick(() => {
      animReady.value = true
    })
  }, 300)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', measureHeights)
  cardObserver?.disconnect()
  cancelAnimationFrame(rafId)
})
</script>

<template>
  <aside
    ref="railEl"
    class="annotation-rail"
    :style="{ left: 'calc(100% + 12px)' }"
    un-absolute
    un-top-0
    un-w-64
    un-z-40
    un-hidden
    un-lg:block
  >
    <div
      v-for="group in anchoredGroups"
      :key="group.key"
      :ref="setCardEl(group.key)"
      class="annotation-card"
      :class="{ 'no-anim': !animReady }"
      :style="{ position: 'absolute', right: '0', top: `${cardPositions[group.key]?.top ?? 0}px` }"
      un-w-full
      un-cursor-pointer
      @mouseenter="setHoverHighlight(group.anns[0].commentId); setActiveCommentId(group.anns[0].commentId)"
      @mouseleave="setHoverHighlight(null); setActiveCommentId(null)"
    >
      <AnnotationCard
        :anns="group.anns"
        :replies="groupReplies(annotations, group.anns.map(a => a.commentId))"
        :active-comment-id="activeCommentId"
        truncate
        @reply="openReply"
        @hover="setHoverHighlight"
      />
    </div>

    <div
      v-if="unanchored.length > 0"
      class="annotation-rail-una"
      :style="{ position: 'absolute', right: '0', top: `${unanchoredTop}px` }"
      un-w-full
    >
      <div
        un-text="xs neutral-400 dark:neutral-500"
        un-font-semibold
        un-uppercase
        un-tracking-wider
        un-mt-4
        un-mb-2
      >
        {{ t('rail.unanchored', { count: unanchored.length }) }}
      </div>

      <div
        v-for="ann in unanchored"
        :key="ann.commentId"
        class="annotation-card-una"
        un-mb-3
        un-opacity-80
      >
        <AnnotationCard
          :anns="[ann]"
          :replies="repliesOf(annotations, ann.commentId)"
          :active-comment-id="activeCommentId"
          truncate
          @reply="openReply"
          @hover="setHoverHighlight"
        />
      </div>
    </div>
  </aside>
</template>

<style scoped>
.annotation-card {
  will-change: top;
}
.annotation-card.no-anim {
  transition: none;
}
</style>
