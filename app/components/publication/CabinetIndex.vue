<script setup lang="ts">
defineProps<{
  items: LayerEntry[]
}>()

function cabinetTouched(item: LayerEntry) {
  return isIssueEvergreen(item) ? issueTouchedDate(item) : ''
}
</script>

<template>
  <PublicationHubShell
    class="cabinet-index"
    title="Cabinet"
  >
    <p
      v-if="!items.length"
      un-m-0
      un-font-serif
      un-text="muted"
      un-italic
    >
      Nothing visible here yet.
    </p>

    <ol
      v-else
      un-m-0
      un-p-0
      un-list-none
      un-flex
      un-w-full
      un-flex-col
      un-gap-9
    >
      <li
        v-for="item in items"
        :key="item.path"
        :data-kind="item.kind"
        :class="item.kind === 'evergreen' ? 'cabinet-evergreen' : undefined"
      >
        <PublicationEntryLink
          v-slot="{ shown }"
          :entry="item"
          arrow="title"
          class="group/row ink-host"
          data-ink-frame
          un-flex
          un-flex-col
          un-text-inherit
          un-decoration-none
          :class="item.kind === 'evergreen' ? 'gap-3' : 'gap-2.5'"
        >
          <template v-if="isIssueEvergreen(item)">
            <span
              class="text-3xl text-ink leading-snug tracking-tight max-w-[18em] block italic font-serif md:text-4xl group-data-[rest]/row:text-ink group-data-[void]/row:text-muted/50 group-focus-visible/row:text-ink group-hover/row:text-ink"
              :data-ink="shown ? 'mark' : undefined"
              :data-hover-ink="shown ? undefined : 'mark'"
            >{{ item.title }}</span>
            <span
              class="cabinet-evergreen__rule"
              aria-hidden="true"
            />
            <span
              un-flex
              un-flex-wrap
              un-items-baseline
              un-gap-x-3
              un-font-mono
              un-text="xs muted"
              un-tracking-wide
              un-tabular-nums
              class="group-data-[rest]/row:text-ink group-focus-visible/row:text-ink group-hover/row:text-ink"
            >
              <time
                v-if="item.created"
                :datetime="item.created"
              >from {{ issueDate(item.created) }}</time>
              <time
                v-if="cabinetTouched(item)"
                :datetime="item.last_modified"
              >{{ cabinetTouched(item) }}</time>
            </span>
            <p
              v-if="item.slip"
              class="text-[0.95rem] text-muted leading-relaxed m-0 max-w-[28em] font-serif md:text-base group-data-[rest]/row:text-ink/80 group-data-[void]/row:text-muted/40 group-hover/row:text-ink/80"
            >
              {{ item.slip }}
            </p>
          </template>

          <template v-else>
            <span
              un-flex
              un-min-w-0
              un-flex-wrap
              un-items-baseline
              un-gap-x-4
              un-gap-y-1
            >
              <span
                class="text-xl text-ink/90 leading-snug tracking-tight min-w-0 md:text-2xl group-data-[rest]/row:text-ink group-data-[void]/row:text-muted/50 group-focus-visible/row:text-ink group-hover/row:text-ink"
                un-font-serif
                :data-ink="shown ? 'mark' : undefined"
                :data-hover-ink="shown ? undefined : 'mark'"
              >{{ item.title }}</span>
              <time
                v-if="item.created"
                class="text-xs text-muted tracking-wide shrink-0 tabular-nums font-mono group-data-[rest]/row:text-ink group-focus-visible/row:text-ink group-hover/row:text-ink"
                :datetime="item.created"
              >{{ issueDate(item.created) }}</time>
            </span>
            <span
              aria-hidden="true"
              class="bg-ink/25 h-px w-10 block group-data-[pin]/row:bg-colored-ink group-data-[rest]/row:bg-ink/55"
            />
            <p
              v-if="item.slip"
              class="text-[0.95rem] text-muted leading-relaxed m-0 max-w-[36em] font-serif md:text-base group-data-[rest]/row:text-ink/80 group-data-[void]/row:text-muted/40 group-hover/row:text-ink/80"
            >
              {{ item.slip }}
            </p>
          </template>
        </PublicationEntryLink>
      </li>
    </ol>
  </PublicationHubShell>
</template>

<style scoped>
.cabinet-index {
  min-height: 0;
}

.cabinet-evergreen {
  padding-bottom: 1.75rem;
}

.cabinet-evergreen__rule {
  display: block;
  width: min(12rem, 42%);
  height: 1px;
  background: var(--ink);
  opacity: 0.28;
  mask-image: linear-gradient(to right, #000 35%, transparent);
}

.cabinet-evergreen :deep(a[data-pin]) .cabinet-evergreen__rule,
.cabinet-evergreen :deep(a[data-rest]) .cabinet-evergreen__rule {
  background: var(--colored-ink);
  opacity: 0.7;
}
</style>
