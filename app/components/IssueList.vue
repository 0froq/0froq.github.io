<script setup lang="ts">
import type { LayerEntry } from '~/utils/issueList'

const props = defineProps<{
  tone: 'posts' | 'corpus'
  items: LayerEntry[]
  showExcerpt?: boolean
}>()

const peek = useHubPeek()
const restPath = computed(() => peek?.value?.path)

const groups = computed(() => {
  const buckets = new Map<string, LayerEntry[]>()
  for (const item of props.items) {
    const year = issueYear(item.created) || '—'
    const list = buckets.get(year) ?? []
    list.push(item)
    buckets.set(year, list)
  }
  return Array.from(buckets.entries(), ([year, items]) => ({
    year,
    mark: issueYearMark(items[0]?.created, 'en'),
    items,
  }))
})

function metaFlags(item: LayerEntry) {
  const flags: string[] = []
  if (item.locale)
    flags.push(item.locale)
  if (item.aigc)
    flags.push('aigc')
  if (item.status === 'draft')
    flags.push('draft')
  if (item.status === 'void')
    flags.push('void')
  return flags
}

function restOn(item: LayerEntry) {
  if (peek)
    peek.value = item
}

onUnmounted(() => {
  if (peek)
    peek.value = null
})
</script>

<template>
  <p
    v-if="!items.length"
    un-m-0
    un-font-serif
    un-text="muted"
    un-italic
  >
    Nothing visible on this layer yet.
  </p>

  <div
    v-else
    class="issue-list"
    :data-tone="tone"
  >
    <section
      v-for="group in groups"
      :key="group.year"
      class="issue-year"
    >
      <h3
        v-if="groups.length > 1 || tone === 'posts'"
        class="issue-year-mark"
      >
        {{ group.mark }}
      </h3>

      <ol class="issue-ol">
        <li
          v-for="item in group.items"
          :key="item.path"
          @pointerenter="restOn(item)"
          @focusin="restOn(item)"
        >
          <NuxtLink
            :to="item.path"
            class="issue-row"
            :data-void="item.status === 'void' ? '' : undefined"
            :data-rest="restPath === item.path ? '' : undefined"
          >
            <span class="issue-line">
              <span class="issue-title">{{ item.title }}</span>
              <span
                class="issue-leader"
                aria-hidden="true"
              />
              <span
                v-for="flag in metaFlags(item)"
                :key="flag"
                class="issue-flag"
              >{{ flag }}</span>
              <time class="issue-date">{{ issueDate(item.created) }}</time>
            </span>
            <span
              v-if="showExcerpt && item.description"
              class="issue-excerpt"
            >{{ item.description }}</span>
          </NuxtLink>
        </li>
      </ol>
    </section>
  </div>
</template>

<style scoped>
.issue-list {
  display: flex;
  flex-direction: column;
  gap: 2.25rem;
}

.issue-list[data-tone='posts'] {
  gap: 2.75rem;
}

.issue-year-mark {
  margin: 0 0 0.35rem;
  font-family: var(--font-serif);
  font-weight: 400;
  letter-spacing: 0.08em;
  color: var(--muted);
}

.issue-list[data-tone='posts'] .issue-year-mark {
  font-size: 1.45em;
  font-style: italic;
  letter-spacing: -0.03em;
  color: var(--ink);
}

.issue-list[data-tone='corpus'] .issue-year-mark {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.issue-ol {
  margin: 0;
  padding: 0;
  list-style: none;
}

.issue-row {
  display: flex;
  flex-direction: column;
  gap: 0.28rem;
  padding-block: 0.7rem;
  color: inherit;
  text-decoration: none;
  outline: none;
}

.issue-list[data-tone='corpus'] .issue-row {
  padding-block: 0.55rem;
}

.issue-line {
  display: flex;
  min-width: 0;
  align-items: baseline;
  gap: 0.7rem;
}

.issue-title {
  min-width: 0;
  font-family: var(--font-serif);
  font-size: 1.2em;
  line-height: 1.28;
  letter-spacing: -0.03em;
}

.issue-list[data-tone='posts'] .issue-title {
  font-size: 1.32em;
  font-weight: 500;
}

.issue-list[data-tone='corpus'] .issue-title {
  font-size: 1.12em;
  font-style: italic;
  font-weight: 400;
}

.issue-row[data-void] .issue-title {
  color: var(--muted);
  text-decoration: line-through;
  text-decoration-thickness: 1px;
}

.issue-leader {
  flex: 1 1 1.25rem;
  min-width: 1.25rem;
  height: 1px;
  align-self: center;
  background-image: repeating-linear-gradient(
    90deg,
    var(--line) 0 1.5px,
    transparent 1.5px 5px
  );
  transform: translateY(-0.08em);
  opacity: 0.85;
}

.issue-flag {
  flex-shrink: 0;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.06em;
  color: var(--colored-ink);
  text-transform: lowercase;
}

.issue-date {
  flex-shrink: 0;
  font-family: var(--font-mono);
  font-size: 0.95em;
  letter-spacing: 0.02em;
  color: color-mix(in srgb, var(--ink) 82%, var(--muted));
  font-variant-numeric: tabular-nums;
}

.issue-excerpt {
  max-width: 46em;
  font-family: var(--font-serif);
  font-size: 0.95em;
  line-height: 1.55;
  color: color-mix(in srgb, var(--ink) 70%, var(--muted));
}

.issue-row:hover .issue-title,
.issue-row:focus-visible .issue-title,
.issue-row[data-rest] .issue-title {
  color: var(--colored-ink);
}

.issue-row:focus-visible {
  outline: 1px solid var(--colored-ink);
  outline-offset: 4px;
}

@media (max-width: 768px) {
  .issue-leader {
    display: none;
  }

  .issue-line {
    flex-wrap: wrap;
    justify-content: space-between;
  }
}
</style>
