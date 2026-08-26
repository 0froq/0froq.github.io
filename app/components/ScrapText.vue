<script setup lang="ts">
import ProseA from '~/components/content/ProseA.vue'
import {
  charsOf,
  parseScrapMarkdown,
  scrapCharCount,
  scrapPlainText,
  takeScrapChars,
} from '~/utils/scrapMarkdown'
import { streamDelayMs } from '~/utils/textStream'

const props = defineProps<{
  source: string
  stream?: boolean
}>()

const parts = computed(() => parseScrapMarkdown(props.source))
const total = computed(() => scrapCharCount(parts.value))
const plain = computed(() => scrapPlainText(props.source))
const glyphs = computed(() => charsOf(plain.value))
const { shown, streaming, play } = useTextStream({
  enabled: () => props.stream === true,
  total,
  delayFor: index => streamDelayMs(index, i => glyphs.value[i]),
})

const visible = computed(() => {
  if (shown.value >= total.value)
    return parts.value
  return takeScrapChars(parts.value, shown.value)
})

function onClick(event: MouseEvent) {
  const target = event.target
  if (!(target instanceof Element) || !target.closest('a'))
    return
  event.stopPropagation()
}

onMounted(play)
</script>

<template>
  <span
    class="scrap-md"
    :aria-busy="streaming ? 'true' : undefined"
    @click="onClick"
  >
    <span
      v-if="stream"
      un-sr-only
    >{{ plain }}</span>
    <span
      v-if="stream"
      aria-hidden="true"
    >
      <template
        v-for="(part, partIndex) in visible"
        :key="partIndex"
      >
        <ProseA
          v-if="part.type === 'link'"
          :href="part.href"
        >
          <span
            v-for="(char, charIndex) in charsOf(part.label)"
            :key="`${partIndex}-l-${charIndex}`"
            class="stream-ch"
          >{{ char }}</span>
        </ProseA>
        <span
          v-for="(char, charIndex) in charsOf(part.value)"
          v-else
          :key="`${partIndex}-t-${charIndex}`"
          class="stream-ch"
        >{{ char }}</span>
      </template>
      <span
        v-if="streaming"
        class="stream-caret"
        un-inline-block
        un-h="[0.1em]"
        un-w="[0.4em]"
        un-translate-y="[0.1em]"
        un-bg-colored-ink
        un-motion-reduce:hidden
      />
    </span>
    <template v-else>
      <template
        v-for="(part, index) in visible"
        :key="index"
      >
        <ProseA
          v-if="part.type === 'link'"
          :href="part.href"
        >{{ part.label }}</ProseA>
        <template v-else>{{ part.value }}</template>
      </template>
    </template>
  </span>
</template>

<style scoped>
.stream-ch {
  animation: stream-ch-in 160ms var(--ease-out) both;
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

@media (prefers-reduced-motion: reduce) {
  .stream-ch {
    animation: none;
  }
}
</style>
