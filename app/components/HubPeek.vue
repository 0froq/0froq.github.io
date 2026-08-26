<script setup lang="ts">
import { formatCompact } from '~/utils/formatStats'

const peek = useHubPeek()
const entry = computed(() => peek?.value ?? null)

const words = computed(() => {
  const n = entry.value?.words
  if (!n)
    return ''
  return n === 1 ? '1 word' : `${formatCompact(n)} words`
})

const statusMark = computed(() => {
  const status = entry.value?.status
  if (!status || status === 'form')
    return ''
  return status
})
</script>

<template>
  <aside
    class="hub-peek"
    aria-live="polite"
    :aria-hidden="entry ? undefined : 'true'"
  >
    <div
      v-if="entry"
      :key="entry.path"
      class="hub-peek-inner"
    >
      <p class="hub-peek-title">
        {{ entry.title }}
      </p>
      <p
        v-if="entry.created || words || entry.aigc || statusMark"
        class="hub-peek-meta"
      >
        <time v-if="entry.created">{{ issueDate(entry.created) }}</time>
        <span v-if="words">{{ words }}</span>
        <span
          v-if="entry.aigc"
          class="hub-peek-flag"
        >aigc</span>
        <span
          v-if="statusMark"
          class="hub-peek-flag"
        >{{ statusMark }}</span>
      </p>
      <hr
        v-if="entry.description || entry.tags?.length"
        class="hub-peek-rule"
      />
      <p
        v-if="entry.description"
        class="hub-peek-excerpt"
      >
        {{ entry.description }}
      </p>
      <p
        v-if="entry.tags?.length"
        class="hub-peek-tags"
      >
        {{ entry.tags.join(' · ') }}
      </p>
    </div>
  </aside>
</template>

<style scoped>
.hub-peek {
  padding-top: 0.2em;
  padding-inline: 0.25rem 0.75rem;
}

.hub-peek-inner {
  max-width: 22em;
  pointer-events: auto;
  animation: hub-peek-in 220ms var(--ease-out);
}

.hub-peek-title {
  margin: 0 0 0.35rem;
  font-family: var(--font-serif);
  font-size: 1.45em;
  font-weight: 400;
  font-style: italic;
  line-height: 1.22;
  letter-spacing: -0.03em;
  color: var(--ink);
}

.hub-peek-meta {
  margin: 0 0 0.9rem;
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.04em;
  color: var(--muted);
  font-variant-numeric: tabular-nums;
}

.hub-peek-meta > * + *::before {
  content: '·';
  margin-inline: 0.45em;
  color: color-mix(in srgb, var(--muted) 70%, transparent);
}

.hub-peek-flag {
  color: var(--colored-ink);
}

.hub-peek-rule {
  width: 2.25rem;
  height: 0;
  margin: 0 0 0.85rem;
  border: 0;
  border-top: 1px solid var(--line);
}

.hub-peek-excerpt {
  display: -webkit-box;
  margin: 0 0 0.75rem;
  overflow: hidden;
  font-family: var(--font-serif);
  font-size: 15px;
  font-style: italic;
  line-height: 1.65;
  color: color-mix(in srgb, var(--ink) 72%, var(--muted));
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 7;
}

.hub-peek-tags {
  display: -webkit-box;
  margin: 0;
  overflow: hidden;
  font-family: var(--font-mono);
  font-size: 11px;
  line-height: 1.7;
  letter-spacing: 0.02em;
  color: var(--muted);
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

@keyframes hub-peek-in {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hub-peek-inner {
    animation: none;
  }
}
</style>
