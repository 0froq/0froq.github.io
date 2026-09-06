<script setup lang="ts">
const props = defineProps<{
  kind: 'corpus' | 'posts'
}>()

const { showAigc, showDraft, showVoid, showExcerpt } = useIssueVisibility(props.kind)
</script>

<template>
  <div
    un-flex
    un-shrink-0
    un-w-full
    un-justify-center
    un-pt-1
    un-lg="block justify-start pt-2"
  >
    <div
      un-grid
      un-grid-cols-2
      un-items-center
      un-gap-x-5
      un-gap-y-2
      un-w-max
      un-max-w-full
      un-lg="flex flex-col items-start gap-2 w-full"
    >
      <IssueFilter
        v-if="kind === 'corpus'"
        :id="`${kind}-filter-aigc`"
        v-model="showAigc"
        prefix="AIGC"
      />
      <IssueFilter
        :id="`${kind}-filter-draft`"
        v-model="showDraft"
        prefix="draft"
      />
      <IssueFilter
        :id="`${kind}-filter-void`"
        v-model="showVoid"
        prefix="void"
      />
      <IssueFilter
        :id="`${kind}-filter-excerpt`"
        v-model="showExcerpt"
        prefix="excerpts"
      />
    </div>
  </div>
</template>
