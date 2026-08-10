<script setup lang="ts">
import { defaultDocument } from '@vueuse/core'
import mediumZoom from 'medium-zoom'
import { useRoute } from 'vitepress'
import { nextTick, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePaperCustomBlocks } from '~/composables/usePaperCustomBlocks'
import AnnotationClient from './components/annotation/AnnotationClient.vue'
import PageContent from './components/PageContent.vue'
import PageFooter from './components/PageFooter.vue'
import PageHeader from './components/PageHeader.vue'
import StatsSessionClient from './components/stats/StatsSessionClient.vue'
import ScrollTopHeader from './components/ui/article/ScrollTopHeader.vue'
import ButtonVerticalNavigation from './components/ui/nav/ButtonVerticalNavigation.vue'
import VisitorNotesClient from './components/visitor-notes/VisitorNotesClient.vue'

const route = useRoute()
const { locale } = useI18n({ useScope: 'global' })
usePaperCustomBlocks()

function initZoom() {
  mediumZoom('#content figure img', {
    margin: 24,
    background: 'var(--image-mask-bg)',
    container: defaultDocument!.body,
  })
}

onMounted(() => {
  // Restore locale after hydrate to avoid SSR/client text mismatch.
  const saved = localStorage.getItem('locale')
  if (saved === 'en' || saved === 'zh')
    locale.value = saved

  initZoom()
})

watch(
  () => route.path,
  () => nextTick(() => initZoom()),
)
</script>

<template>
  <div
    class="site-shell"
    un-min-h-100vh
    un-text="neutral-600 dark:neutral-400"
    un-before="bg-neutral-200 dark:bg-neutral-900"
    un-relative
    un-font-sans
  >
    <PageHeader />
    <ScrollTopHeader />
    <PageContent
      :key="route.path"
    />
    <PageFooter />
    <ButtonVerticalNavigation
      un-hidden
      un-md:flex
    />
    <ClientOnly>
      <AnnotationClient />
      <VisitorNotesClient />
      <StatsSessionClient />
    </ClientOnly>
  </div>
</template>

<style scoped>

</style>
