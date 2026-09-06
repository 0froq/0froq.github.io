<script setup lang="ts">
defineProps<{
  app: string
}>()
</script>

<template>
  <span
    v-if="app === 'Cursor'"
    un-i-simple-cursor
    un-inline-block
    un-size="1em"
    un-shrink-0
  />
  <span
    v-else-if="app === 'ChatGPT'"
    un-i-selfhst-chatgpt-light
    un-inline-block
    un-size="1em"
    un-shrink-0
  />
  <span
    v-else-if="app === 'Code'"
    un-i-skill-vscode-light
    un-inline-block
    un-size="1em"
    un-shrink-0
  />
  <span
    v-else-if="app === 'Ghostty'"
    un-i-solar-ghost-line-duotone
    un-inline-block
    un-size="1em"
    un-shrink-0
  />
  <span
    v-else-if="app === 'Vivaldi'"
    un-i-simple-vivaldi
    un-inline-block
    un-size="1em"
    un-shrink-0
  />
  <span
    v-else-if="app === 'Notion'"
    un-i-skill-notion-light
    un-inline-block
    un-size="1em"
    un-shrink-0
  />
  <span
    v-else-if="app === 'Obsidian'"
    un-i-skill-obsidian-light
    un-inline-block
    un-size="1em"
    un-shrink-0
  />
  <span
    v-else-if="app === 'Zen'"
    un-i-simple-zenbrowser
    un-inline-block
    un-size="1em"
    un-shrink-0
  />
  <span
    v-else-if="app === 'nvim'"
    un-i-skill-neovim-light
    un-inline-block
    un-size="1em"
    un-shrink-0
  />
  <span
    v-else-if="app === '网易云音乐'"
    un-i-simple-neteasecloudmusic
    un-inline-block
    un-size="1em"
    un-shrink-0
  />
  <span
    v-else-if="app === '音乐'"
    un-i-simple-applemusic
    un-inline-block
    un-size="1em"
    un-shrink-0
  />
  <span
    v-else-if="app === '哔哩哔哩'"
    un-i-simple-bilibili
    un-inline-block
    un-size="1em"
    un-shrink-0
  />
</template>
