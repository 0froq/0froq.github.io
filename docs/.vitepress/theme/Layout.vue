<script setup lang="ts">
import { defaultDocument } from '@vueuse/core'
import mediumZoom from 'medium-zoom'
import { useRoute } from 'vitepress'
import { nextTick, onMounted, watch } from 'vue'
import { usePaperCustomBlocks } from '~/composables/usePaperCustomBlocks'
import AnnotationClient from './components/annotation/AnnotationClient.vue'
import PageContent from './components/PageContent.vue'
import PageFooter from './components/PageFooter.vue'
import PageHeader from './components/PageHeader.vue'
import ScrollTopHeader from './components/ui/article/ScrollTopHeader.vue'
import ButtonVerticalNavigation from './components/ui/nav/ButtonVerticalNavigation.vue'
import VisitorNotesClient from './components/visitor-notes/VisitorNotesClient.vue'

const route = useRoute()
usePaperCustomBlocks()

function initZoom() {
  mediumZoom('#content figure img', {
    margin: 24,
    background: 'var(--image-mask-bg)',
    container: defaultDocument!.body,
  })
}

onMounted(() => {
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
    <ButtonVerticalNavigation
      un-hidden
      un-md:flex
    />
    <PageFooter />
    <ClientOnly>
      <AnnotationClient />
      <VisitorNotesClient />
    </ClientOnly>
  </div>
</template>

<style scoped>

</style>
