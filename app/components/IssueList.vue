<script setup lang="ts">
const props = defineProps<{
  items: LayerEntry[]
  showExcerpt?: boolean
}>()

const peek = useHubPeek()
const restPath = computed(() => peek?.value?.path)
const route = useRoute()
const { remember } = useIssueArticleReturn()
const { setRowRef, getOpacity, refresh } = useSeparatorOpacity()

const groups = computed(() => {
  const parts = buildCreatedParts(props.items.map(item => item.created))
  const buckets = new Map<string, LayerEntry[]>()
  for (const item of props.items) {
    const year = issueYear(item.created) || '—'
    const list = buckets.get(year) ?? []
    list.push(item)
    buckets.set(year, list)
  }
  let index = 0
  return Array.from(buckets.entries(), ([year, items]) => ({
    year,
    mark: issueYearMark(items[0]?.created, 'en'),
    items: items.map((item) => {
      const row = { item, index, parts: parts[index]! }
      index += 1
      return row
    }),
  }))
})

function bindRow(index: number, el: unknown) {
  setRowRef(index, el instanceof HTMLElement ? el : null)
}

watch(() => props.items.length, () => refresh())

function restOn(item: LayerEntry) {
  if (peek)
    peek.value = item
}

function disclose(item: LayerEntry) {
  if (!peek)
    return
  peek.value = peek.value?.path === item.path ? null : item
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
    class="group"
    un-flex
    un-flex-col
    un-gap-10
  >
    <section
      v-for="group in groups"
      :key="group.year"
    >
      <div
        un-m-0
        un-mb-4
        un-font-serif
        un-text="4xl ink"
        un-tracking-tight
        un-text-end
      >
        {{ group.mark }}
      </div>

      <ol
        un-m-0
        un-p-0
        un-list-none
      >
        <li
          v-for="row in group.items"
          :key="row.item.path"
          un-mb-4
        >
          <button
            type="button"
            class="group/row ink-host reach-hit"
            un-lg:hidden
            un-flex
            un-w-full
            un-min-w-0
            un-flex-col
            un-cursor-pointer
            un-border-0
            un-bg-transparent
            un-p-0
            un-text-left
            un-decoration-none
            un-outline-none
            :data-void="row.item.status === 'void' ? '' : undefined"
            :data-rest="restPath === row.item.path ? '' : undefined"
            :aria-expanded="restPath === row.item.path"
            aria-haspopup="dialog"
            aria-controls="issue-peek-float"
            @click="disclose(row.item)"
          >
            <span
              class="group-data-[void]/row:text-muted/50"
              un-font-medium
              un-not-italic
              un-min-w-0
              un-w-full
              un-font-serif
              un-text="xl ink/80 group-hover/row:ink group-focus-visible/row:ink group-data-[rest]/row:ink"
              un-transition-colors
              un-leading-snug
              un-tracking-tight
              :data-ink="restPath === row.item.path ? 'mark' : undefined"
              :data-hover-ink="restPath === row.item.path ? undefined : 'mark'"
            >{{ row.item.title }}</span>
          </button>
          <NuxtLink
            :to="row.item.path"
            class="group/row ink-host reach-hit"
            un-hidden
            un-lg="flex flex-col"
            un-text-inherit
            un-decoration-none
            un-outline-none
            :data-void="row.item.status === 'void' ? '' : undefined"
            :data-rest="restPath === row.item.path ? '' : undefined"
            @pointerenter="restOn(row.item)"
            @focusin="restOn(row.item)"
            @click="remember(route.fullPath)"
          >
            <span
              :ref="(el) => bindRow(row.index, el)"
              un-flex
              un-min-w-0
              un-items-center
              un-gap-2
            >
              <span
                class="group-data-[void]/row:text-muted/50"
                un-font-medium
                un-not-italic
                un-min-w-0
                un-max-w="[50%]"
                un-shrink-0
                un-font-serif
                un-text="xl ink/80 group-hover/row:ink group-focus-visible/row:ink group-data-[rest]/row:ink"
                un-transition-colors
                un-leading-snug
                un-tracking-tight
                un-truncate
                :data-ink="restPath === row.item.path ? 'mark' : undefined"
                :data-hover-ink="restPath === row.item.path ? undefined : 'mark'"
              >{{ row.item.title }}</span>
              <span
                aria-hidden="true"
                class="issue-sep"
                un-flex-1
                un-min-w-5
                un-h-px
                un-self-center
                :style="{ opacity: getOpacity(row.index) }"
              />
              <span
                v-for="flag in issueMetaFlags(row.item)"
                :key="flag"
                un-shrink-0
                un-font-mono
                un-text="sm colored-ink"
                un-tracking-wide
                un-lowercase
              >{{ flag }}</span>
              <time
                un-shrink-0
                un-font-mono
                un-text="sm muted group-hover/row:ink group-focus-visible/row:ink group-data-[rest]/row:ink"
                un-tracking-wide
                un-tabular-nums
                un-whitespace-nowrap
                un-transition-colors
                un-duration-200
                :datetime="row.item.created"
              >
                <span v-if="row.parts.month">{{ row.parts.month }}</span>
                <span
                  v-else
                  class="issue-date-gap"
                  aria-hidden="true"
                >……</span>/<span v-if="row.parts.day">{{ row.parts.day }}</span>
                <span
                  v-else
                  class="issue-date-gap"
                  aria-hidden="true"
                >……</span>
              </time>
            </span>
            <span
              v-if="showExcerpt && row.item.description"
              un-max-w="[46em]"
              un-font-serif
              un-text="xs muted"
              un-leading-relaxed
            >{{ row.item.description }}</span>
          </NuxtLink>
        </li>
      </ol>
    </section>
  </div>

  <IssuePeekFloat />
</template>

<style scoped>
.issue-sep {
  color: var(--line);
  background-image: repeating-linear-gradient(
    90deg,
    currentColor 0 8px,
    transparent 8px 16px
  );
  transition: opacity 140ms cubic-bezier(0.22, 1, 0.36, 1);
}

.issue-date-gap {
  color: var(--line);
}
</style>
