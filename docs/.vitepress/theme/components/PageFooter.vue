<script setup lang="ts">
import LinkUnderline from './LinkUnderline.vue'
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
        un-text="neutral-600 dark:neutral-400 hover:neutral-950 dark:hover:neutral-50"
        un-before="bg-neutral-800 dark:bg-neutral-200 h-px"
      />
      ©
      <LinkUnderline
        href="https://github.com/Fro-Q/blog"
        text="froQ"
        un-text="neutral-600 dark:neutral-400 hover:neutral-950 dark:hover:neutral-50"
        un-before="bg-neutral-800 dark:bg-neutral-200 h-px"
      />
    </div>
  </un-page-content>
</template>
