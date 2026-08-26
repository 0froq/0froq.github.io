<script setup lang="ts">
import { prefersReducedStream, STREAM_INTERVAL_MS, streamDelayMs, wrapStreamChars } from '~/utils/textStream'

const props = withDefaults(defineProps<{
  stream?: boolean
  interval?: number
}>(), {
  stream: true,
  interval: STREAM_INTERVAL_MS,
})

type Phase = 'hold' | 'stream' | 'done'

const copy = ref<HTMLElement | null>(null)
const plain = shallowRef('')
const total = shallowRef(0)
const phase = ref<Phase>(props.stream ? 'hold' : 'done')
let chars: HTMLElement[] = []
let caret: HTMLSpanElement | null = null
let unwrapTimer = 0

function delayFor(index: number) {
  return streamDelayMs(
    index,
    i => chars[i]?.textContent ?? undefined,
    i => chars[i]?.dataset.break != null,
    props.interval,
  )
}

const { shown, streaming, play, stop } = useTextStream({
  enabled: () => props.stream,
  total,
  interval: () => props.interval,
  delayFor,
})

function ensureCaret() {
  if (caret)
    return caret
  const mark = document.createElement('span')
  mark.className = 'stream-caret'
  mark.setAttribute('aria-hidden', 'true')
  caret = mark
  return mark
}

function reveal(n: number, from = 0) {
  if (n < from) {
    for (const el of chars)
      delete el.dataset.on
    from = 0
  }
  for (let i = from; i < n; i++)
    chars[i]?.setAttribute('data-on', '')
  const last = chars[Math.min(n, chars.length) - 1]
  const mark = ensureCaret()
  if (streaming.value && last)
    last.after(mark)
  else
    mark.remove()
}

function unwrap() {
  if (unwrapTimer) {
    window.clearTimeout(unwrapTimer)
    unwrapTimer = 0
  }
  caret?.remove()
  caret = null
  for (const el of chars) {
    el.replaceWith(document.createTextNode(el.textContent ?? ''))
  }
  copy.value?.normalize()
  chars = []
  phase.value = 'done'
}

watch(shown, (n, prev) => {
  reveal(n, prev ?? 0)
})

watch(streaming, (active, wasActive) => {
  if (wasActive && !active)
    unwrapTimer = window.setTimeout(unwrap, 180)
})

onMounted(() => {
  const root = copy.value
  if (!root)
    return
  if (!props.stream || prefersReducedStream()) {
    phase.value = 'done'
    play()
    return
  }
  plain.value = root.textContent ?? ''
  chars = wrapStreamChars(root)
  total.value = chars.length
  phase.value = 'stream'
  play()
})

onUnmounted(() => {
  stop()
  if (unwrapTimer)
    window.clearTimeout(unwrapTimer)
  caret?.remove()
})
</script>

<template>
  <div
    class="group"
    :data-phase="phase"
    :aria-busy="streaming ? 'true' : undefined"
  >
    <span
      v-if="streaming"
      un-sr-only
    >{{ plain }}</span>
    <div
      ref="copy"
      class="text-stream-copy group-data-[phase=hold]:h-0 group-data-[phase=hold]:invisible group-data-[phase=hold]:overflow-hidden motion-reduce:!h-auto motion-reduce:!visible motion-reduce:!overflow-visible"
      :aria-hidden="streaming ? 'true' : undefined"
    >
      <slot />
    </div>
  </div>
</template>

<style scoped>
/* Glyphs are wrapped in JS, so they miss the scoped data attribute. */
:deep(.stream-ch[data-on]) {
  animation: stream-ch-in 160ms var(--ease-out) both;
}

:deep(.stream-ch:not([data-on])) {
  display: none;
}

:deep(.stream-caret) {
  display: inline-block;
  width: 0.4em;
  height: 0.1em;
  transform: translateY(0.1em);
  background: var(--colored-ink);
}

@keyframes stream-ch-in {
  from {
    opacity: 0;
    filter: blur(3px);
  }

  to {
    opacity: 1;
    filter: blur(0);
  }
}

@media (scripting: none) {
  .text-stream-copy {
    visibility: visible;
    height: auto;
    overflow: visible;
  }
}

@media (prefers-reduced-motion: reduce) {
  :deep(.stream-ch) {
    animation: none;
  }

  :deep(.stream-caret) {
    display: none;
  }
}
</style>
