<script setup lang="ts">
import LinkUnderline from '@/ui/base/LinkUnderline.vue'
import SiteStatsLine from '~/components/stats/SiteStatsLine.vue'
</script>

<template>
  <div
    un-bg="neutral-50/50 dark:neutral-800/50"
    un-backdrop-blur-md
    un-border="t-1px solid neutral-400 dark:neutral-600"
    un-mt-10
    un-pt-10
    un-pb-16
  >
    <un-page-content
      un-static
      un-w-full
      un-mx-auto
    >
      <div
        xmlns:cc="http://creativecommons.org/ns#"
        xmlns:dct="http://purl.org/dc/terms/"
        un-flex="~ row wrap"
        un-text="neutral-600 dark:neutral-400"
      >
        2024-PRESENT
        <span
          un-font-serif
        >

          <LinkUnderline
            href="https://creativecommons.org/licenses/by-nc-sa/4.0/?ref=chooser-v1"
            text="CC BY-NC-SA 4.0"
            un-before="bg-neutral-900 dark:bg-neutral-100"
          />
        </span>
        ©
        <span
          un-font-serif
        >
          <LinkUnderline
            href="https://github.com/Fro-Q/blog"
            text="froQ"
            un-before="bg-neutral-900 dark:bg-neutral-100"
          />
        </span>
      </div>
      <ClientOnly>
        <SiteStatsLine />
      </ClientOnly>
    </un-page-content>
  </div>
</template>
