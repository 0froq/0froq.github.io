<script setup lang="ts">
import { defaultDocument } from '@vueuse/core'
import mediumZoom from 'medium-zoom'
import { useRoute } from 'vitepress'
import { nextTick, onMounted, watch } from 'vue'
import AnnotationClient from './components/annotation/AnnotationClient.vue'
import PageContent from './components/PageContent.vue'
import PageFooter from './components/PageFooter.vue'
import PageHeader from './components/PageHeader.vue'
import ButtonVerticalNavigation from './components/ui/nav/ButtonVerticalNavigation.vue'

const route = useRoute()

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
    un-min-h-100vh
    un-text="stone-600 dark:stone-400"
    un-bg="stone-100 dark:stone-950"
    un-relative
    un-font-sans
  >
    <PageHeader />
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
    </ClientOnly>
  </div>
</template>

<style scoped>

</style>
