<script setup lang="ts">
defineProps<{
  app: string
}>()

const iconMap: Record<string, string> = {
  Zen: 'i-simple-zenbrowser',
  Ghostty: 'i-solar-ghost-line-duotone',
  网易云音乐: 'i-simple-neteasecloudmusic',
  音乐: 'i-simple-applemusic',
  Code: 'i-skill-vscode-light',
  哔哩哔哩: 'i-simple-bilibili',
  nvim: 'i-skill-neovim-light',
  Obsidian: 'i-skill-obsidian-light',
  Notion: 'i-skill-notion-light',
  tmux: 'i-simple-tmux',
  // "i-simple-discord",
  // "i-simple-facebook",
  // "i-simple-figma",
  // "i-simple-firefox",
  // "i-simple-git",
  // "i-simple-github",
  // "i-simple-githubcopilot",
  // "i-simple-googlechrome",
  // "i-simple-google",
  // "i-simple-instagram",
  // "i-simple-linkedin",
  // "i-simple-microsoftedge",
  // "i-simple-microsoftexcel",
  // "i-simple-microsoftpowerpoint",
  // "i-simple-microsoftword",
  // "i-simple-neovim",
  // "i-simple-notion",
  // "i-simple-nuxt",
  // "i-si-obsidian",
  // "i-simple-openai",
  // "i-simple-perplexity",
  // "i-simple-qq",
  // "i-simple-react",
  // "i-simple-rime",
  // "i-simple-slack",
  // "i-simple-stackoverflow",
  // "i-simple-swift",
  // "i-simple-svelte",
  // "i-simple-vuedotjs",
  // "i-simple-vite",
  // "i-simple-wechat",
  // "i-simple-x",
  // "i-simple-youtube"

}
</script>

<template>
  <div
    v-if="iconMap[app]"
    :class="iconMap[app]"
    un-text="sm"
  />
</template>
