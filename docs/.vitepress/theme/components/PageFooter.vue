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
        un-text="stone-600 dark:stone-400 hover:stone-950 dark:hover:stone-50"
        un-before="bg-stone-800 dark:bg-stone-200 h-px"
      />
      ©
      <LinkUnderline
        href="https://github.com/Fro-Q/blog"
        text="froQ"
        un-text="stone-600 dark:stone-400 hover:stone-950 dark:hover:stone-50"
        un-before="bg-stone-800 dark:bg-stone-200 h-px"
      />
    </div>
  </un-page-content>
</template>
