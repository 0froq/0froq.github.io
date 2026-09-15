<script setup lang="ts">
import arrowDown from '@oreo-design/doodle-icons/icons/arrow-down.svg?raw'
import bookmark from '@oreo-design/doodle-icons/icons/bookmark.svg?raw'
import flag from '@oreo-design/doodle-icons/icons/flag.svg?raw'
import heart from '@oreo-design/doodle-icons/icons/heart.svg?raw'
import leaf from '@oreo-design/doodle-icons/icons/leaf.svg?raw'
import notebook from '@oreo-design/doodle-icons/icons/notebook.svg?raw'
import pencil from '@oreo-design/doodle-icons/icons/pencil.svg?raw'
import pin from '@oreo-design/doodle-icons/icons/pin.svg?raw'
import quote from '@oreo-design/doodle-icons/icons/quote.svg?raw'
import star from '@oreo-design/doodle-icons/icons/star.svg?raw'
import stickyNote from '@oreo-design/doodle-icons/icons/sticky-note.svg?raw'

type DoodleGlyph = JournalDoodleName | 'arrow-down'

const props = defineProps<{
  name: DoodleGlyph
}>()

const markup: Record<DoodleGlyph, string> = {
  'arrow-down': arrowDown,
  'bookmark': bookmark,
  'flag': flag,
  'heart': heart,
  'leaf': leaf,
  'notebook': notebook,
  'pencil': pencil,
  'pin': pin,
  'quote': quote,
  'star': star,
  'sticky-note': stickyNote,
}
</script>

<template>
  <span
    class="journal-doodle"
    aria-hidden="true"
    v-html="markup[props.name]"
  />
</template>

<style scoped>
.journal-doodle {
  display: block;
  width: 1em;
  height: 1em;
  color: currentColor;
}

.journal-doodle :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
}
</style>
