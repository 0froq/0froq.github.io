<script setup lang="ts">
import { useRoute } from 'vitepress'
import { useI18n } from 'vue-i18n'
import LinkUnderline from './LinkUnderline.vue'
import PageContentNav from './PageContentNav.vue'
import ProgressBarHeader from './ProgressBarHeader.vue'

const route = useRoute()
const { t } = useI18n({
  useScope: 'global',
  messages: {
    en: {
      greeting: 'Greetings!',
    },
    zh: {
      greeting: '您好！',
    },
  },
})
</script>

<template>
  <un-page-content un-min-h-100vh>
    <!-- <LinkUnderline -->
    <!--   href="/" -->
    <!--   text="> cd" -->
    <!--   un-inline-block -->
    <!--   un-text-sm -->
    <!--   un-font-mono -->
    <!--   un-text="neutral-600 dark:neutral-400" -->
    <!--   un-before="h-px bg-neutral-950 dark:bg-neutral-50" -->
    <!--   :data-current="['/', '/en/'].includes(route.path) ? 'true' : ''" -->
    <!-- /> -->
    <!-- <div -->
    <!--   un-flex="~ row wrap" -->
    <!--   un-gap-2 -->
    <!-- > -->
    <!--   <LinkUnderline -->
    <!--     v-for="({ label, url }) in [ -->
    <!--       { label: 'Corpus', url: 'corpus/' }, -->
    <!--       { label: 'Posts', url: 'posts/' }, -->
    <!--       { label: 'Dashboard', url: 'dashboard/' }, -->
    <!--     ]" -->
    <!--     :key="url" -->
    <!--     :href="`/${url}`" -->
    <!--     :text="label" -->
    <!--     un-inline-block -->
    <!--     un-text-sm -->
    <!--     un-text="neutral-600 dark:neutral-400" -->
    <!--     un-before="h-px bg-neutral-950 dark:bg-neutral-50" -->
    <!--     :data-current="route.path.endsWith(url) ? 'true' : ''" -->
    <!--   /> -->
    <!-- </div> -->
    <ProgressBarHeader
      :key="$i18n.locale"
      :title="t('greeting')"
      un-mb-8
    />
    <Content
      :key="route.path"
      un-text="base/10"
      class="markdown-rendered"
    />
  </un-page-content>
</template>
