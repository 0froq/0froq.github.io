<script setup lang="ts">
import LinkUnderline from '@/ui/base/LinkUnderline.vue'
import SiteStatsLine from '~/components/stats/SiteStatsLine.vue'
</script>

<template>
  <un-page-content
    un-static
    un-w-full
    un-mx-auto
    un-py-10
  >
    <div
      xmlns:cc="http://creativecommons.org/ns#"
      xmlns:dct="http://purl.org/dc/terms/"
      un-flex="~ row wrap"
    >
      2024-PRESENT
      <LinkUnderline
        href="https://creativecommons.org/licenses/by-nc-sa/4.0/?ref=chooser-v1"
        text="CC BY-NC-SA 4.0"
        un-before="bg-neutral-900 dark:bg-neutral-100"
      />
      ©
      <LinkUnderline
        href="https://github.com/Fro-Q/blog"
        text="froQ"
        un-before="bg-neutral-900 dark:bg-neutral-100"
      />
    </div>
    <ClientOnly>
      <SiteStatsLine />
    </ClientOnly>
  </un-page-content>
</template>
