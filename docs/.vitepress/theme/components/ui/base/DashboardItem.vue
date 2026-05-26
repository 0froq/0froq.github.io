<script setup lang="ts">
import LinkUnderline from '@/ui/base/LinkUnderline.vue'

interface Note {
  text: string
  url?: string
}

interface Item {
  title: string
  description?: string
  dod?: string
  notes?: Note[]
  locale?: string
}

withDefaults(defineProps<{
  item: Item
  enableMarkdown?: boolean
  linkIndent?: 'sm' | 'md' | 'lg'
}>(), {
  enableMarkdown: false,
  linkIndent: 'md',
})

const linkIndentClass = {
  sm: 'un-ml-5',
  md: 'un-ml-8',
  lg: 'un-ml-10',
}
</script>

<template>
  <li :key="item.title">
    <div>{{ item.title }}</div>
    <div
      v-if="item.description || item.dod"
      un-ml-4
      un-text="stone-600 dark:stone-400"
    >
      {{ item.description || item.dod }}
    </div>

    <ul
      v-if="item.notes?.length"
      :class="linkIndentClass[linkIndent]"
      un-text-sm
      un-text-stone-500
    >
      <li
        v-for="note in item.notes"
        :key="`${note.text}:${note.url ?? ''}`"
        un-ml-10
      >
        <LinkUnderline
          v-if="note.url"
          :href="note.url"
          :text="note.text"
          un-before="bg-stone-700 dark:bg-stone-300"
        />
        <span
          v-else
          un-text="stone-600 dark:stone-400"
        >
          {{ note.text }}
        </span>
      </li>
    </ul>
  </li>
</template>
