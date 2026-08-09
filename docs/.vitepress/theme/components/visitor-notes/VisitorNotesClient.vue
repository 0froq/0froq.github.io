<script setup lang="ts">
import { useEventListener, useResizeObserver } from '@vueuse/core'
import { useRoute } from 'vitepress'
import { nextTick, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  clampNotePosition,
  measureShell,
  useVisitorNotes,
  viewportCenterInShell,
} from '~/composables/useVisitorNotes'
import { VISITOR_NOTE_DEFAULT_HEIGHT, VISITOR_NOTE_DEFAULT_WIDTH } from '~/types/visitorNote'
import VisitorNoteCard from './VisitorNoteCard.vue'

const { t } = useI18n({
  useScope: 'global',
  messages: {
    en: {
      addTitle: 'New sticky note',
      clearTitle: 'Clear all notes on this page',
      limit: 'At most {count} notes on this page',
    },
    zh: {
      addTitle: '新建便签',
      clearTitle: '清除本页所有便签',
      limit: '本页最多 {count} 条便签',
    },
  },
})

const route = useRoute()
const shellEl = ref<HTMLElement | null>(null)
const focusNoteId = ref<string | null>(null)
const dockRef = ref<HTMLElement | null>(null)
const confirmClear = ref(false)

const {
  notes,
  limitReached,
  maxPerPath,
  createNote,
  updateText,
  updatePosition,
  updateSize,
  updateColor,
  bringToFront,
  removeNote,
  clearAllNotes,
  clearLimitHint,
  relayoutToShell,
} = useVisitorNotes()

function resolveShell(): HTMLElement | null {
  return document.querySelector('.site-shell') as HTMLElement | null
}

function relayout() {
  const shell = shellEl.value ?? resolveShell()
  if (!shell)
    return
  shellEl.value = shell
  const { w, h } = measureShell(shell)
  relayoutToShell(w, h)
}

onMounted(() => {
  shellEl.value = resolveShell()
  nextTick(() => relayout())
})

useResizeObserver(shellEl, () => {
  relayout()
})

useEventListener(window, 'resize', () => {
  relayout()
})

watch(() => route.path, async () => {
  focusNoteId.value = null
  clearLimitHint()
  confirmClear.value = false
  await nextTick()
  shellEl.value = resolveShell()
  relayout()
})

// Clear-all is a two-step confirm: first click arms (red), second executes.
// Clicking elsewhere or pressing Escape disarms.
useEventListener(document, 'pointerdown', (e) => {
  if (!confirmClear.value)
    return
  if (dockRef.value?.contains(e.target as Node))
    return
  confirmClear.value = false
})

useEventListener(window, 'keydown', (e) => {
  if (e.key === 'Escape')
    confirmClear.value = false
})

function onClearClick() {
  if (!confirmClear.value) {
    confirmClear.value = true
    return
  }
  confirmClear.value = false
  clearAllNotes()
}

watch(limitReached, (v) => {
  if (!v)
    return
  window.setTimeout(() => clearLimitHint(), 2400)
})

async function addNote() {
  const shell = shellEl.value ?? resolveShell()
  shellEl.value = shell
  if (!shell)
    return

  const center = viewportCenterInShell(shell)
  const { w: shellW, h: shellH } = measureShell(shell)
  const clamped = clampNotePosition(
    center.x + (Math.random() * 24 - 12),
    center.y + (Math.random() * 24 - 12),
    VISITOR_NOTE_DEFAULT_WIDTH,
    VISITOR_NOTE_DEFAULT_HEIGHT,
    shellW,
    shellH,
  )

  const note = createNote(clamped.x, clamped.y, shellW, shellH)
  if (!note)
    return
  focusNoteId.value = note.id
  await nextTick()
  window.setTimeout(() => {
    if (focusNoteId.value === note.id)
      focusNoteId.value = null
  }, 0)
}

function onPosition(id: string, x: number, y: number) {
  const shell = shellEl.value
  if (!shell)
    return
  const { w, h } = measureShell(shell)
  updatePosition(id, x, y, w, h)
}

function onSize(id: string, noteW: number, noteH: number) {
  const shell = shellEl.value
  if (!shell)
    return
  const { w, h } = measureShell(shell)
  updateSize(id, noteW, noteH, w, h)
}
</script>

<template>
  <!-- Page-relative overlay: scrolls with .site-shell; empty area ignores pointers -->
  <div
    class="visitor-notes-layer"
    un-absolute
    un-inset-x-0
    un-top-0
    un-bottom-0
    un-min-h-full
    un-w-full
    un-pointer-events-none
    style="z-index: 35"
    aria-hidden="false"
  >
    <VisitorNoteCard
      v-for="note in notes"
      :key="note.id"
      :note="note"
      :shell-el="shellEl"
      :focus-on-mount="focusNoteId === note.id"
      @update:text="updateText"
      @update:position="onPosition"
      @update:size="onSize"
      @update:color="updateColor"
      @bring-to-front="bringToFront"
      @remove="removeNote"
    />
  </div>

  <!-- Bottom-center dock: add note + clear all (flat, compact) -->
  <div
    ref="dockRef"
    class="visitor-notes-dock"
    un-fixed
    un-bottom-3
    un-left="1/2"
    un--translate-x="1/2"
    un-z-40
    un-pointer-events-auto
    un-flex
    un-items-center
    un-gap-0.5
    un-px-1
    un-py-0.5
    un-rounded-sm
    un-bg="neutral-50/85 dark:neutral-900/80"
    un-border="~ neutral-300/60 dark:neutral-700/60"
    un-backdrop-blur-md
  >
    <button
      type="button"
      class="visitor-notes-dock-btn"
      :title="t('addTitle')"
      :aria-label="t('addTitle')"
      @click="addNote"
    >
      <span
        class="visitor-notes-dock-icon"
        un-i-ph-plus-duotone
      />
    </button>
    <button
      type="button"
      class="visitor-notes-dock-btn visitor-notes-dock-clear"
      :class="{
        'visitor-notes-dock-btn-disabled': notes.length === 0,
        'visitor-notes-dock-armed': confirmClear,
      }"
      :disabled="notes.length === 0"
      :title="t('clearTitle')"
      :aria-label="t('clearTitle')"
      @click="onClearClick"
    >
      <span
        class="visitor-notes-dock-icon"
        un-i-ph-trash-duotone
      />
    </button>
  </div>

  <div
    v-if="limitReached"
    un-fixed
    un-left="1/2"
    un--translate-x="1/2"
    un-bottom-12
    un-z-40
    un-pointer-events-none
    un-text="xs neutral-600 dark:neutral-300"
    un-bg="neutral-50/95 dark:neutral-900/90"
    un-px-3
    un-py-1
    un-rounded-sm
    un-border="~ neutral-300/60 dark:neutral-700/60"
  >
    {{ t('limit', { count: maxPerPath }) }}
  </div>
</template>

<style scoped>
.visitor-notes-dock {
  box-shadow: 0 1px 3px rgb(0 0 0 / 0.08), 0 4px 12px -4px rgb(0 0 0 / 0.10);
}

.dark .visitor-notes-dock {
  box-shadow: 0 1px 3px rgb(0 0 0 / 0.4), 0 4px 12px -4px rgb(0 0 0 / 0.5);
}

.visitor-notes-dock-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border: none;
  border-radius: 2px;
  cursor: pointer;
  font-size: 0.95rem;
  color: var(--vp-c-text-2, #525252);
  background: transparent;
  transition: background 0.15s ease, color 0.15s ease;
}

.dark .visitor-notes-dock-btn {
  color: var(--vp-c-text-2, #a3a3a3);
}

.visitor-notes-dock-btn:hover {
  background: rgb(0 0 0 / 0.06);
}

.dark .visitor-notes-dock-btn:hover {
  background: rgb(255 255 255 / 0.08);
}

.visitor-notes-dock-clear:hover {
  color: #f43f5e;
}

.visitor-notes-dock-armed,
.visitor-notes-dock-armed:hover {
  color: #e11d48;
  background: rgb(225 29 72 / 0.12);
}

.dark .visitor-notes-dock-armed,
.dark .visitor-notes-dock-armed:hover {
  color: #fb7185;
  background: rgb(251 113 133 / 0.15);
}

.visitor-notes-dock-btn-disabled {
  opacity: 0.35;
  cursor: default;
  pointer-events: none;
}

.visitor-notes-dock-icon {
  display: inline-block;
}
</style>
