<script lang="ts" setup>
import ContentNav from './ContentNav.vue'
import ProgressBarHeader from './ProgressBarHeader.vue'

const navItems = [
  [{ label: 'Home', url: '/' }],
  [
    { label: 'Corpus', url: '/corpus/', current: true },
    { label: 'Posts', url: '/posts/' },
    { label: 'Dashboard', url: '/dashboard/' },
    { label: 'Tags', url: '/tags/' },
  ],
  [
    { label: 'Autopsia', url: '/corpus/000_autopsia/' },
    { label: 'Ingesta', url: '/corpus/100_ingesta/' },
    { label: 'Neoplasma', url: '/corpus/200_neoplasma/' },
    { label: 'Putredo', url: '/corpus/300_putredo/' },
    { label: 'Delirium', url: '/corpus/400_delirium/' },
    { label: 'Vigil', url: '/corpus/500_vigil/' },
  ],
]
</script>

<template>
  <ContentNav
    :items="navItems"
  />
  <ProgressBarHeader
    title="Corpus"
    un-mb-8
    un-font="stylish"
  />
  <Content
    class="markdown-rendered"
    un-text="base/10"
  />
</template>

<style scoped>
[data-current='true'] {
  --uno: 'text-stone-950 dark:text-stone-50 font-semibold';
  --uno: 'before:(w-full bg-stone-950 dark:bg-stone-50)';
}
</style>
