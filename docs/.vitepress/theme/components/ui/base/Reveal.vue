<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import PaperEdgeSurface from '@/ui/paper/PaperEdgeSurface.vue'
import { paperEdgeFromId } from '~/composables/usePaperEdge'

const props = withDefaults(defineProps<{
  /** 写在胶带上的文字。 */
  label?: string
  /** 初始展开。 */
  open?: boolean
  /** 稳定纸边参数 id（同 id 每次一致）。 */
  edgeId?: string
  /** 纸面是否可点击切换（默认是）。 */
  clickable?: boolean
}>(), {
  label: '',
  open: false,
  edgeId: 'reveal-note',
  clickable: true,
})

const isOpen = ref(props.open)
const contentEl = ref<HTMLElement | null>(null)
const contentHeight = ref('0px')

const edge = computed(() => paperEdgeFromId(props.edgeId))

async function measure() {
  await nextTick()
  const el = contentEl.value
  if (!el)
    return
  contentHeight.value = isOpen.value ? `${el.scrollHeight}px` : '0px'
}

function toggle() {
  if (!props.clickable)
    return
  isOpen.value = !isOpen.value
}

watch(isOpen, () => {
  void measure()
})

onMounted(() => {
  void measure()
})
</script>

<template>
  <div
    class="reveal-note"
    :class="{ 'is-open': isOpen, 'is-clickable': clickable }"
    :style="{ '--card-tilt': edge.tilt }"
    un-relative
    un-w-fit
    un-min-w-280px
    un-max-w-full
    un-mr-auto
    un-ml-0
    un-my-8
    un-transition="transform 200ms ease"
  >
    <PaperEdgeSurface
      :edge-id="edgeId"
      :show-tape="false"
      :backdrop-blur="false"
      un-fill="neutral-50/90 dark:neutral-800/90"
      un-stroke="neutral-300 dark:neutral-700"
    />

    <!-- 胶带（可点击，展开/收起） -->
    <button
      type="button"
      class="reveal-note-tape"
      :style="{
        '--tape-offset': edge.tapeOffset,
        '--tape-tilt': edge.tapeTilt,
      }"
      :aria-expanded="isOpen"
      :aria-label="label"
      @click="toggle"
    >
      <span
        class="reveal-note-tape-label"
        un-pointer-events-none
        un-text="neutral-700 dark:neutral-200"
        un-font-serif
        un-font-medium
        un-text-sm
        un-whitespace-nowrap
      >
        {{ label }}
      </span>
    </button>

    <!-- 便签内容 -->
    <div
      class="reveal-note-panel"
      :class="{ 'is-open': isOpen }"
      :style="{ maxHeight: contentHeight }"
    >
      <div
        ref="contentEl"
        class="reveal-note-content"
        un-pt-6
        un-px-5
        un-pb-4
        un-text="sm neutral-700 dark:neutral-300"
        un-font-serif
        un-leading-relaxed
      >
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
.reveal-note {
  transform: rotate(var(--card-tilt, -0.4deg));
  transform-origin: 50% 0;
  isolation: isolate;
}

/* .reveal-note.is-clickable {
  cursor: pointer;
} */

.reveal-note.is-clickable:hover {
  transform: rotate(calc(var(--card-tilt, -0.4deg) * 0.6));
}

.reveal-note-tape {
  position: absolute;
  top: -35px;
  left: calc(20% + var(--tape-offset, 0px));
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  /* min-width: 72px;
  min-height: 72px; */
  --uno: 'min-w-12 min-h-12';
  padding: 8px 12px;
  --uno: 'border-(px dashed) border-neutral-700 dark:border-neutral-300';
  border-radius: 52% 68% 46% 74% / 68% 44% 72% 52%;
  transform: translateX(-50%) rotate(var(--tape-tilt, 0deg));
  cursor: pointer;
  transition:
    background 0.2s ease,
    transform 0.2s ease;

  --uno: 'bg-neutral-600/35 dark:bg-neutral-500/70 text-neutral-700 dark:text-neutral-200';
  --uno: 'hover:bg-neutral-500/35 dark:hover:bg-neutral-500/50';
}

.reveal-note.is-clickable .reveal-note-tape:hover {
  transform: translateX(-50%) rotate(var(--tape-tilt, 0deg)) scale(1.03);
}

.reveal-note-panel {
  position: relative;
  z-index: 1;
  overflow: hidden;
  max-height: 0;
  opacity: 0;
  transform: translateY(-8px);
  transition:
    max-height 0.5s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.4s ease,
    transform 0.4s ease;
}

.reveal-note-panel.is-open {
  opacity: 1;
  transform: translateY(0);
}
</style>
