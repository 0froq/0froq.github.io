<script setup lang="ts">
import type { LayerEntry } from '~/utils/issueList'

defineProps<{
  entry: LayerEntry
}>()

const route = useRoute()
</script>

<template>
  <article
    class="issue-read"
    un-box-border
    un-w-full
    un-py-8
    un-pb-16
  >
    <TableOfContents />
    <div
      class="issue-read__stage"
      un-w="[min(62.5rem,calc(100%-2*var(--gutter)))] max-md:[min(62.5rem,calc(100%-2rem))]"
      un-ml="[max(var(--gutter),calc(50vw-31.25rem-2.5rem))] max-md:auto"
      un-mr-auto
      un-max-md:mx-auto
    >
      <IssueEntryHead
        class="issue-read__mast"
        :entry="entry"
        variant="article"
        un-flex
        un-flex-col
        un-md:flex-row
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

      <div
        class="issue-read__grid"
        un-grid
        un-items-stretch
        un-gap="[clamp(1.25rem,3vw,2rem)]"
        un-grid-cols="1 lg:[minmax(0,43.75rem)_minmax(0,1fr)]"
      >
        <div
          un-prose="~"
          class="issue-read__prose"
          un-relative
          un-min-w-0
          un-max-w-none
          un-text="lg ink"
          un-leading-loose
          un-lg="[&_section.footnotes]:sr-only"
        >
          <slot />
        </div>
        <aside
          class="issue-read__rail"
          aria-label="Margin"
          un-relative
          un-min-w-0
          un-pt="[0.15rem]"
          un-font-serif
          un-text="sm muted"
          un-max-lg:hidden
        >
          <slot name="rail" />
          <IssueSidenotes />
        </aside>
      </div>
    </div>
  </article>
</template>

<style scoped>
/* Row mast only. Below md the template is flex-col; a 36rem
   flex-basis would stretch the title block to ~576px tall. */
@media (min-width: 760px) {
  .issue-read__mast > :first-child {
    flex: 0 1 36rem;
    min-width: 0;
  }

  .issue-read__mast > :last-child:not(:only-child) {
    flex: 0 0 auto;
    max-width: 13rem;
  }
}
</style>
