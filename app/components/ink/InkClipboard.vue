<script setup lang="ts">
import { inkClipboardBoardPath, inkClipboardClipPath, inkClipboardLinesPath, inkClipboardTickPath } from '~/utils/inkDraw'

const props = withDefaults(defineProps<{
  seed: string
  done?: boolean
}>(), {
  done: false,
})

const board = computed(() => inkClipboardBoardPath(props.seed))
const clip = computed(() => inkClipboardClipPath(props.seed))
const lines = computed(() => inkClipboardLinesPath(props.seed))
const tick = computed(() => inkClipboardTickPath(props.seed))
</script>

<template>
  <span
    class="ink-clipboard"
    :data-on="done ? '' : undefined"
    un-inline-flex
    un-shrink-0
    aria-hidden="true"
  >
    <svg
      viewBox="0 0 18 18"
      un-block
      un-h="[1.1em]"
      un-w="[1.1em]"
      un-overflow-visible
    >
      <path
        :d="board"
        fill="none"
        stroke="currentColor"
        stroke-width="1.15"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        :d="clip"
        fill="none"
        stroke="currentColor"
        stroke-width="1.15"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        class="ink-clipboard-lines"
        :d="lines"
        fill="none"
        stroke="currentColor"
        stroke-width="1.05"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        class="ink-clipboard-tick"
        :d="tick"
        fill="none"
        stroke="currentColor"
        stroke-width="1.4"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </span>
</template>

<style scoped>
.ink-clipboard-lines,
.ink-clipboard-tick {
  transition: opacity 220ms var(--ease-out), stroke-dashoffset 340ms var(--ease-out);
}

.ink-clipboard-tick {
  stroke-dasharray: 18;
  stroke-dashoffset: 18;
}

.ink-clipboard[data-on] .ink-clipboard-lines {
  opacity: 0;
}

.ink-clipboard[data-on] .ink-clipboard-tick {
  color: var(--colored-ink);
  stroke-dashoffset: 0;
}

@media (prefers-reduced-motion: reduce) {
  .ink-clipboard-lines,
  .ink-clipboard-tick {
    transition: none;
  }

  .ink-clipboard-tick {
    stroke-dashoffset: 18;
  }

  .ink-clipboard[data-on] .ink-clipboard-tick {
    stroke-dashoffset: 0;
  }
}
</style>
