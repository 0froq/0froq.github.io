<script setup lang="ts">
defineProps<{
  kind: 'POST' | 'CORPUS'
  title?: string
  created?: string
  status?: string
  backTo: string
  backLabel: string
}>()

const route = useRoute()
</script>

<template>
  <article
    un-box-border
    un-w-full
    un-px="[var(--gutter)] max-md:4"
    un-py-6
    un-pb-16
  >
    <p
      un-mb="[1.6em]"
      un-flex
      un-flex-wrap
      un-gap-3.5
      un-font-mono
      un-text="11px muted"
    >
      <NuxtLink
        :to="backTo"
        un-text="muted hover:colored-ink focus-visible:colored-ink"
      >
        ← {{ backLabel }}
      </NuxtLink>
      <span v-if="created">{{ created }}</span>
      <span v-if="status">{{ status }}</span>
    </p>
    <h1
      class="issue-title"
      un-m-0
      un-mb="[0.4em]"
      un-text="[clamp(34px,5vw,52px)]"
      un-font-semibold
      un-leading="[1.05]"
      un-text-balance
      :data-kind="kind"
    >
      {{ title }}
    </h1>
    <div
      un-mb-8
      un-flex
      un-flex-wrap
      un-items-center
      un-gap-x-4
      un-gap-y-2
    >
      <PagePresenceHint :page-path="route.path" />
      <SiteLikeButton
        people
        :page-path="route.path"
      />
    </div>
    <div
      un-prose="~"
      un-max-w="[36em]"
      un-text="lg ink"
      un-leading="[1.8]"
    >
      <slot />
    </div>
  </article>
</template>

<style scoped>
.issue-title[data-kind='POST'] {
  font-style: italic;
  letter-spacing: -0.04em;
}

.issue-title[data-kind='CORPUS'] {
  font-family: var(--font-serif);
  letter-spacing: 0.01em;
}
</style>
