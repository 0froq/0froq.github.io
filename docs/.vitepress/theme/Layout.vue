<script setup lang="ts">
import { defaultDocument } from '@vueuse/core'
import mediumZoom from 'medium-zoom'
import { useData, useRoute } from 'vitepress'
import { nextTick, onMounted, watch, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import ButtonVerticalNavigation from './components/ButtonVerticalNavigation.vue'
import PageContent from './components/PageContent.vue'
import PageFooter from './components/PageFooter.vue'
import PageHeader from './components/PageHeader.vue'

const route = useRoute()
const { frontmatter } = useData()
const { locale } = useI18n({
  useScope: 'global',
})

watchEffect(() => {
  if (frontmatter.value.locale) {
    defaultDocument!.documentElement.lang = frontmatter.value.locale as string
    locale.value = frontmatter.value.locale as string
  }
  else {
    defaultDocument!.documentElement.lang = 'zh'
    locale.value = 'zh'
  }
})

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
    un-text="neutral-700 dark:neutral-300"
    un-bg="neutral-50 dark:neutral-950"
    un-relative
    un-font-serif
  >
    <PageHeader />
    <PageContent :key="route.path" />
    <ButtonVerticalNavigation
      un-hidden
      un-md:flex
    />
    <PageFooter />
  </div>
</template>

<style scoped>

</style>
