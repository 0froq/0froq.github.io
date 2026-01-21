<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import SvgFroqLogo from './SvgFroqLogo.vue'

const { locale } = useI18n()
</script>

<template>
  <div
    un-m-4
    un-top-0
    un-z-100
    un-sticky
  >
    <a
      class="group"
      un-text="5xl neutral-600 dark:neutral-400"
      :href="locale === 'zh' ? '/' : `/${locale}/`"
    >
      <SvgFroqLogo :animated="true" />
    </a>
  </div>
</template>
