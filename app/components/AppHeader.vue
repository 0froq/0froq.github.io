<script setup lang="ts">
const { section } = useIssueFrame()
const route = useRoute()

const sectionLabel = computed(() => {
  switch (section.value) {
    case 'posts':
      return 'Posts'
    case 'corpus':
      return 'Corpus'
    case 'dashboard':
      return 'Dashboard'
    default:
      return ''
  }
})

const layerLabel = computed(() => {
  const parts = route.path.split('/').filter(Boolean)
  if (parts[0] === 'posts' && parts[1])
    return findPostLayer(parts[1])?.label ?? ''
  if (parts[0] === 'corpus' && parts[1])
    return findCorpusLayer(parts[1])?.label ?? ''
  return ''
})

const sectionTo = computed(() => {
  switch (section.value) {
    case 'posts':
      return '/posts'
    case 'corpus':
      return '/corpus'
    case 'dashboard':
      return '/dashboard'
    default:
      return '/'
  }
})
</script>

<template>
  <header
    un-box-border
    un-w-full
    un-flex="~"
    un-items-center
    un-gap-4
    un-py="3.5 max-md:3"
    data-fixed
  >
    <p
      v-if="sectionLabel"
      class="hub-label"
      un-m-0
      un-flex
      un-flex-1
      un-flex-wrap
      un-items-baseline
      un-gap-2
      un-font-mono
      un-text="11px muted"
      un-tracking="[0.04em]"
      un-uppercase
    >
      <NuxtLink
        :to="sectionTo"
        un-text="muted hover:colored-ink focus-visible:colored-ink"
      >
        {{ sectionLabel }}
      </NuxtLink>
      <template v-if="layerLabel">
        <span aria-hidden="true">/</span>
        <span>{{ layerLabel }}</span>
      </template>
    </p>
  </header>
</template>

<style scoped>
header[data-fixed] {
  position: sticky;
  top: 0;
  z-index: 30;
  box-sizing: border-box;
  min-height: var(--site-chrome);
  padding-inline: calc(var(--gutter) + var(--site-home-inset)) var(--gutter);
  border-bottom: 1px solid var(--line);
  background: color-mix(in srgb, var(--paper) 92%, transparent);
  backdrop-filter: blur(10px);
}

@media (max-width: 759px) {
  header[data-fixed] {
    padding-inline: calc(1rem + var(--site-home-inset)) 1rem;
  }
}
</style>
