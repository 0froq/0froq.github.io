<script setup lang="ts">
defineProps<{
  entry: LayerEntry
}>()

const route = useRoute()
</script>

<template>
  <article
    class="issue-read group/read"
    :data-kind="isIssueEvergreen(entry) ? 'evergreen' : undefined"
    un-box-border
    un-pt-8
    un-pb-16
  >
    <TableOfContents />
    <div class="issue-read__stage mx-auto w-[min(var(--read-prose),calc(100%-2*var(--gutter)))] lg:w-[min(var(--read-stage),calc(100%-2*var(--gutter)))] max-md:w-[min(var(--read-prose),calc(100%-2rem))]">
      <IssueEntryHead
        class="issue-read__mast"
        :entry="entry"
        variant="article"
        un-flex
        un-flex-col
        un-items-start
        un-gap="[clamp(1.5rem,3vw,2.25rem)] max-md:[1.1rem]"
      >
        <template #meta-after>
          <PagePresenceHint :page-path="route.path" />
          <SiteLikeButton
            people
            :page-path="route.path"
          />
        </template>
      </IssueEntryHead>

      <div class="issue-read__grid flex flex-col gap-[var(--read-gap)] lg:flex-row lg:items-start">
        <div
          data-md-content
          un-prose="~"
          class="issue-read__prose lg:[&_section.footnotes]:sr-only"
          un-relative
          un-min-w-0
          un-flex-1
          un-max-w="[var(--read-prose)]"
          un-text="lg ink"
          un-leading-loose
        >
          <slot />
        </div>
        <aside
          class="issue-read__rail hidden lg:block"
          aria-label="Margin"
          un-relative
          un-shrink-0
          un-min-w="[var(--read-rail)]"
          un-w="[var(--read-rail)]"
          un-pt="[0.15rem]"
          un-font-serif
          un-text="sm muted"
        >
          <slot name="rail" />
          <IssueSidenotes />
        </aside>
      </div>
    </div>
  </article>
</template>

<style scoped>
.issue-read[data-kind='evergreen'] :deep(.issue-read__prose [role='separator']) {
  justify-content: flex-start;
  margin-block: 2.5rem;
}

.issue-read[data-kind='evergreen'] :deep(.issue-read__prose [role='separator'] svg) {
  width: 4rem;
}

.issue-read[data-kind='evergreen'] :deep(.issue-read__prose h1) {
  margin-top: 0;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  font-weight: 400;
  letter-spacing: 0.12em;
  color: var(--muted);
}
</style>
