<script setup lang="ts">
import type { VisitorNote, VisitorNoteColor } from '~/types/visitorNote'
import { useDraggable } from '@vueuse/core'
import { computed, nextTick, ref, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import PaperEdgeSurface from '@/ui/paper/PaperEdgeSurface.vue'
import { clampNotePosition } from '~/composables/useVisitorNotes'
import {
  VISITOR_NOTE_COLOR_LABELS,
  VISITOR_NOTE_COLOR_STYLES,
  VISITOR_NOTE_COLORS,
  VISITOR_NOTE_MIN_HEIGHT,
  VISITOR_NOTE_MIN_WIDTH,
} from '~/types/visitorNote'

const props = defineProps<{
  note: VisitorNote
  shellEl: HTMLElement | null
  focusOnMount?: boolean
}>()

const emit = defineEmits<{
  'update:text': [id: string, text: string]
  'update:position': [id: string, x: number, y: number]
  'update:size': [id: string, w: number, h: number]
  'update:color': [id: string, color: VisitorNoteColor]
  'bring-to-front': [id: string]
  'remove': [id: string]
}>()

const { t, locale } = useI18n({
  useScope: 'global',
  messages: {
    en: {
      placeholder: 'Write a note…',
      delete: 'Delete note',
      drag: 'Drag',
      color: 'Note color',
      resize: 'Resize',
    },
    zh: {
      placeholder: '写点什么…',
      delete: '删除便签',
      drag: '拖动',
      color: '便签颜色',
      resize: '调整大小',
    },
  },
})

const rootRef = useTemplateRef<HTMLElement>('rootRef')
const handleRef = useTemplateRef<HTMLElement>('handleRef')
const textareaRef = useTemplateRef<HTMLTextAreaElement>('textareaRef')

const palette = computed(() => VISITOR_NOTE_COLOR_STYLES[props.note.color])
const hovered = ref(false)

const draft = ref(props.note.text)
watch(() => props.note.text, (v) => {
  if (v !== draft.value)
    draft.value = v
})

watch(() => props.focusOnMount, async (v) => {
  if (!v)
    return
  await nextTick()
  textareaRef.value?.focus()
}, { immediate: true })

function onInput(e: Event) {
  const value = (e.target as HTMLTextAreaElement).value
  draft.value = value
  emit('update:text', props.note.id, value)
}

function onActivate() {
  emit('bring-to-front', props.note.id)
}

// ---- drag: VueUse useDraggable, clamped to .site-shell ----
// useDraggable works in viewport coordinates; notes persist in shell-relative
// coordinates, so convert through the shell's bounding rect on every move.
const dragPos = ref({ x: props.note.x, y: props.note.y })

watch(() => [props.note.x, props.note.y], ([x, y]) => {
  if (!isDragging.value)
    dragPos.value = { x, y }
})

const { isDragging } = useDraggable(rootRef, {
  handle: handleRef,
  initialValue: { x: props.note.x, y: props.note.y },
  preventDefault: true,
  stopPropagation: true,
  onStart: () => {
    onActivate()
    dragPos.value = { x: props.note.x, y: props.note.y }
  },
  onMove: (pos) => {
    const shell = props.shellEl
    if (!shell)
      return
    const rect = shell.getBoundingClientRect()
    const clamped = clampNotePosition(
      pos.x - rect.left,
      pos.y - rect.top,
      props.note.w,
      props.note.h,
      rect.width,
      Math.max(rect.height, shell.scrollHeight),
    )
    dragPos.value = clamped
    pos.x = clamped.x
    pos.y = clamped.y
  },
  onEnd: (pos) => {
    emit('update:position', props.note.id, Math.round(pos.x), Math.round(pos.y))
  },
})

// ---- resize: bottom-right corner grip ----
const resizing = ref(false)
const liveSize = ref<{ w: number, h: number } | null>(null)
let resizeStartX = 0
let resizeStartY = 0
let resizeStartW = 0
let resizeStartH = 0

function onResizePointerDown(e: PointerEvent) {
  if (e.button !== 0)
    return
  e.preventDefault()
  e.stopPropagation()
  onActivate()
  resizing.value = true
  resizeStartX = e.clientX
  resizeStartY = e.clientY
  resizeStartW = props.note.w
  resizeStartH = props.note.h
  liveSize.value = { w: props.note.w, h: props.note.h }
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
}

function onResizePointerMove(e: PointerEvent) {
  if (!resizing.value)
    return
  const shell = props.shellEl
  const shellW = shell ? shell.getBoundingClientRect().width : Number.POSITIVE_INFINITY
  const shellH = shell ? Math.max(shell.getBoundingClientRect().height, shell.scrollHeight) : Number.POSITIVE_INFINITY
  const w = Math.min(
    Math.max(VISITOR_NOTE_MIN_WIDTH, resizeStartW + (e.clientX - resizeStartX)),
    shellW - props.note.x,
  )
  const h = Math.min(
    Math.max(VISITOR_NOTE_MIN_HEIGHT, resizeStartH + (e.clientY - resizeStartY)),
    shellH - props.note.y,
  )
  liveSize.value = { w, h }
}

function onResizePointerUp(e: PointerEvent) {
  if (!resizing.value)
    return
  resizing.value = false
  try {
    ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
  }
  catch { /* already released */ }
  if (liveSize.value)
    emit('update:size', props.note.id, liveSize.value.w, liveSize.value.h)
  liveSize.value = null
}

const cardStyle = computed(() => {
  const size = liveSize.value ?? { w: props.note.w, h: props.note.h }
  return {
    left: `${dragPos.value.x}px`,
    top: `${dragPos.value.y}px`,
    width: `${size.w}px`,
    height: `${size.h}px`,
    zIndex: 35 + props.note.z,
  }
})

const strokeValue = computed(() =>
  (hovered.value || isDragging.value || resizing.value)
    ? palette.value.strokeActive
    : palette.value.stroke,
)

function colorLabel(c: VisitorNoteColor): string {
  const labels = VISITOR_NOTE_COLOR_LABELS[c]
  return locale.value === 'zh' ? labels.zh : labels.en
}

function colorStyle(c: VisitorNoteColor) {
  return VISITOR_NOTE_COLOR_STYLES[c]
}
</script>

<template>
  <div
    ref="rootRef"
    class="visitor-note-card"
    :class="{ 'visitor-note-active': isDragging || resizing }"
    :style="cardStyle"
    un-absolute
    un-pointer-events-auto
    un-backdrop-blur-md
    @pointerdown="onActivate"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
  >
    <!--
      UnoCSS scan anchors: static attributify so utilities enter the CSS build.
      Dynamic :un-fill / :un-bg below then resolve against those generated rules.
      Zero size — invisible on the page.
    -->
    <div
      un-w-0
      un-h-0
      un-overflow-hidden
      un-absolute
      un-pointer-events-none
      aria-hidden="true"
    >
      <i
        un-fill="amber-50/70 dark:amber-950/55"
        un-stroke="amber-300/50 dark:amber-700/50"
        un-bg="amber-300 dark:amber-500"
      />
      <i
        un-fill="rose-50/70 dark:rose-950/55"
        un-stroke="rose-300/50 dark:rose-700/50"
        un-bg="rose-300 dark:rose-500"
      />
      <i
        un-fill="sky-50/70 dark:sky-950/55"
        un-stroke="sky-300/50 dark:sky-700/50"
        un-bg="sky-300 dark:sky-500"
      />
      <i
        un-fill="emerald-50/70 dark:emerald-950/55"
        un-stroke="emerald-300/50 dark:emerald-700/50"
        un-bg="emerald-300 dark:emerald-500"
      />
      <!-- hover stroke (slightly brighter, same width) -->
      <i
        un-stroke="amber-400/80 dark:amber-500/80"
      />
      <i
        un-stroke="rose-400/80 dark:rose-500/80"
      />
      <i
        un-stroke="sky-400/80 dark:sky-500/80"
      />
      <i
        un-stroke="emerald-400/80 dark:emerald-500/80"
      />
    </div>

    <PaperEdgeSurface
      :edge-id="note.id"
      :un-fill="palette.fill"
      :un-stroke="strokeValue"
    />

    <div
      un-relative
      un-z-1
      un-flex="~ col"
      un-h-full
    >
      <!-- drag handle + color dots + delete -->
      <div
        ref="handleRef"
        class="visitor-note-handle"
        un-flex
        un-items-center
        un-gap-2
        un-px-2.5
        un-py-2
        un-cursor-grab
        un-touch-none
        un-select-none
        :title="t('drag')"
      >
        <span
          un-text="xs neutral-400/80 dark:neutral-500/80"
          un-tracking-widest
          un-leading-none
        >
          ∷
        </span>

        <div
          un-flex
          un-items-center
          un-gap-1.5
          un-ml-auto
          role="radiogroup"
          :aria-label="t('color')"
        >
          <button
            v-for="c in VISITOR_NOTE_COLORS"
            :key="c"
            type="button"
            role="radio"
            :aria-checked="note.color === c"
            :aria-label="colorLabel(c)"
            :title="colorLabel(c)"
            class="visitor-note-dot"
            :class="{ 'visitor-note-dot-active': note.color === c }"
            :un-bg="colorStyle(c).bg"
            @pointerdown.stop
            @click.stop="emit('update:color', note.id, c)"
          />
        </div>

        <button
          type="button"
          class="visitor-note-close"
          un-text="neutral-400 dark:neutral-500 hover:rose-500"
          un-bg-transparent
          un-border-none
          un-cursor-pointer
          un-leading-none
          un-px-0.5
          :aria-label="t('delete')"
          :title="t('delete')"
          @pointerdown.stop
          @click.stop="emit('remove', note.id)"
        >
          ×
        </button>
      </div>

      <textarea
        ref="textareaRef"
        :value="draft"
        :placeholder="t('placeholder')"
        un-w-full
        un-flex-1
        un-resize-none
        un-bg-transparent
        un-border-none
        un-outline-none
        un-px-3
        un-pb-3
        un-text="sm neutral-800 dark:neutral-200"
        un-leading-relaxed
        un-placeholder="neutral-400/80 dark:neutral-600"
        un-select-text
        un-font-serif
        @input="onInput"
        @pointerdown.stop="onActivate"
        @focus="onActivate"
      />

      <!-- resize grip -->
      <div
        class="visitor-note-resize"
        :class="{ 'visitor-note-resize-active': resizing }"
        un-absolute
        un-right-0
        un-bottom-0
        un-w-4
        un-h-4
        un-cursor-nwse-resize
        un-touch-none
        :title="t('resize')"
        :aria-label="t('resize')"
        @pointerdown="onResizePointerDown"
        @pointermove="onResizePointerMove"
        @pointerup="onResizePointerUp"
        @pointercancel="onResizePointerUp"
      />
    </div>
  </div>
</template>

<style scoped>
/* Idle: flat. Hover: lift + brighter stroke (same width). */
.visitor-note-card {
  transform: none;
  transition: box-shadow 0.25s ease;
  border-radius: 3px;
}

.visitor-note-card:hover {
  box-shadow:
    0 1px 2px rgb(0 0 0 / 0.05),
    0 4px 12px -3px rgb(0 0 0 / 0.1),
    0 10px 24px -8px rgb(0 0 0 / 0.12);
}

.dark .visitor-note-card:hover {
  box-shadow:
    0 1px 2px rgb(0 0 0 / 0.3),
    0 5px 14px -3px rgb(0 0 0 / 0.4),
    0 12px 28px -8px rgb(0 0 0 / 0.45);
}

.visitor-note-active {
  transition: none;
  box-shadow:
    0 2px 5px rgb(0 0 0 / 0.07),
    0 8px 20px -5px rgb(0 0 0 / 0.15),
    0 16px 36px -10px rgb(0 0 0 / 0.17);
}

.dark .visitor-note-active {
  box-shadow:
    0 2px 6px rgb(0 0 0 / 0.35),
    0 10px 24px -5px rgb(0 0 0 / 0.5),
    0 18px 40px -10px rgb(0 0 0 / 0.55);
}

.visitor-note-card :deep(.paper-edge-fill) {
  stroke-width: 1;
  transition: stroke 0.2s ease;
}

.visitor-note-active .visitor-note-handle {
  cursor: grabbing;
}

.visitor-note-dot {
  width: 11px;
  height: 11px;
  border-radius: 9999px;
  border: 1px solid rgb(0 0 0 / 0.15);
  cursor: pointer;
  padding: 0;
  opacity: 0.75;
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.dark .visitor-note-dot {
  border-color: rgb(255 255 255 / 0.25);
}

.visitor-note-dot:hover {
  opacity: 1;
  transform: scale(1.15);
}

.visitor-note-dot-active {
  opacity: 1;
  box-shadow:
    0 0 0 2px rgb(255 255 255 / 0.9),
    0 0 0 3.5px rgb(0 0 0 / 0.25);
}

.dark .visitor-note-dot-active {
  box-shadow:
    0 0 0 2px rgb(0 0 0 / 0.6),
    0 0 0 3.5px rgb(255 255 255 / 0.35);
}

.visitor-note-close {
  font-size: 15px;
}

.visitor-note-resize {
  opacity: 0;
  transition: opacity 0.15s ease;
  background:
    linear-gradient(135deg, transparent 50%, currentColor 50%) bottom right / 8px 8px no-repeat,
    linear-gradient(135deg, transparent 50%, currentColor 50%) bottom right / 13px 13px no-repeat;
  color: rgb(120 113 108 / 0.5);
  border-bottom-right-radius: 3px;
}

.dark .visitor-note-resize {
  color: rgb(168 162 158 / 0.45);
}

.visitor-note-card:hover .visitor-note-resize,
.visitor-note-resize-active {
  opacity: 1;
}

.visitor-note-card textarea {
  scrollbar-width: thin;
}
</style>
