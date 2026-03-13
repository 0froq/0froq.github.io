<script setup lang="ts">
import { useRoute } from 'vitepress'
import LinkUnderline from './LinkUnderline.vue'

const route = useRoute()

const links = [
  '/',
  '/en/',
  '/corpus/',
  '/corpus/en/',
  '/posts/',
  '/posts/en/',
  '/dashboard/',
  '/dashboard/en/',
  '/tags/',
  '/tags/en/',
].includes(route.path)
  ? [
      { label: 'Corpus', url: '/corpus/' },
      { label: 'Posts', url: '/posts/' },
      { label: 'Dashboard', url: '/dashboard/' },
      { label: 'Tags', url: '/tags/' },
    ]
  : route.path.startsWith('/corpus/')
    ? [
        { label: 'Autopsia', url: '/corpus/000_autopsia/' },
        { label: 'Ingesta', url: '/corpus/100_ingesta/' },
        { label: 'Neoplasma', url: '/corpus/200_neoplasma/' },
        { label: 'Putredo', url: '/corpus/300_putredo/' },
        { label: 'Delirium', url: '/corpus/400_delirium/' },
        { label: 'Vigil', url: '/corpus/500_vigil/' },
      ]
    : []

const homeLink = ['/', '/en/'].includes(route.path)
  ? { label: 'cd', url: '/' }
  : ['/corpus/', '/posts/', '/dashboard/', '/tags/'].includes(route.path)
      ? { label: 'cd ..', url: '/' }
      // : route.path.startsWith('/corpus/')
      : route.path.match(/^\/corpus\/[0-5]00_[a-z]+\/$/)
        ? { label: 'cd ..', url: '/corpus/' }
        : route.path.startsWith('/corpus/')
          ? { label: 'cd ..', url: `${route.path.split('/').slice(0, -1).join('/')}/` }
          : route.path.startsWith('/posts/')
            ? { label: 'cd ..', url: '/posts/' }
            : route.path.startsWith('/dashboard/')
              ? { label: 'cd ..', url: '/dashboard/' }
              : route.path.startsWith('/tags/')
                ? { label: 'cd ..', url: '/tags/' }
                : null
</script>

<template>
  <LinkUnderline
    v-if="homeLink"
    :href="homeLink.url"
    :text="homeLink.label"
    un-inline-block
    un-text-sm
    un-font-mono
    un-text="neutral-600 dark:neutral-400"
    un-before="h-px bg-neutral-950 dark:bg-neutral-50"
    :data-current="['/', '/en/'].includes(route.path) ? 'true' : ''"
  />
  <div
    un-flex="~ row wrap"
    un-gap-2
  >
    <LinkUnderline
      v-for="({ label, url }) in links"
      :key="url"
      :href="`${url}${route.path.endsWith('/en') ? '' : 'en/'}`"
      :text="label"
      un-inline-block
      un-text-sm
      un-text="neutral-600 dark:neutral-400"
      un-before="h-px bg-neutral-950 dark:bg-neutral-50"
      :data-current="route.path.startsWith(url) ? 'true' : ''"
    />
  </div>
</template>

<style scoped>
[data-current='true'] {
  --uno: 'text-neutral-950 dark:text-neutral-50 font-semibold';
  --uno: 'before:(w-full bg-neutral-950 dark:bg-neutral-50)';
}
</style>
