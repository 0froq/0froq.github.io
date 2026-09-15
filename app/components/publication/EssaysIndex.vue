<script setup lang="ts">
defineProps<{
  items: LayerEntry[]
}>()
</script>

<template>
  <PublicationHubShell
    class="essays-index"
    title="Essays"
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
      un-w-full
    >
      <li
        v-for="item in items"
        :key="item.path"
      >
        <PublicationEntryLink
          v-slot="{ shown }"
          :entry="item"
          class="group/row ink-host"
          data-ink-frame
          un-grid
          un-grid-cols="[minmax(0,1fr)_auto]"
          un-gap-x-8
          un-gap-y-2
          un-items-baseline
          un-py-0
          un-text-inherit
          un-decoration-none
        >
          <span
            class="group-data-[void]/row:text-muted/50"
            un-min-w-0
            un-font-serif
            un-leading="[1.12]"
            un-tracking-tight
            un-text="xl md:2xl ink/90 group-hover/row:ink group-focus-visible/row:ink group-data-[rest]/row:ink"
            :data-ink="shown ? 'mark' : undefined"
            :data-hover-ink="shown ? undefined : 'mark'"
          >{{ item.title }}</span>
          <time
            un-shrink-0
            un-font-mono
            un-text="xs muted"
            un-tracking-wide
            un-tabular-nums
            :datetime="item.created"
          >{{ issueDate(item.created) }}</time>
        </PublicationEntryLink>
      </li>
    </ol>
  </PublicationHubShell>
</template>

<style scoped>
.essays-index {
  min-height: 0;
}
</style>
