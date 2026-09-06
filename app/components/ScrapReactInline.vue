<script setup lang="ts">
import type { Scrap, ScrapReactionState } from '~/utils/scraps'
import { SCRAP_REACTION_EMOJIS, SCRAP_REACTION_ICONS, SCRAP_REACTION_LABELS } from '~/utils/scraps'

const props = withDefaults(defineProps<{
  scrap: Scrap
  reactions?: ScrapReactionState
  /** Full palette (context menu). Off: only emojis that already have counts. */
  picker?: boolean
}>(), {
  picker: true,
})

const emit = defineEmits<{
  react: [emoji: string]
}>()

const counts = computed(() => props.reactions?.counts ?? {})
const mine = computed(() => props.reactions?.mine ?? null)

type ReactionEmoji = (typeof SCRAP_REACTION_EMOJIS)[number]

function isReactionEmoji(key: string): key is ReactionEmoji {
  return (SCRAP_REACTION_EMOJIS as readonly string[]).includes(key)
}

const emojis = computed(() => {
  if (props.picker) {
    const set = new Set<string>(SCRAP_REACTION_EMOJIS)
    for (const key of Object.keys(counts.value)) {
      if (isReactionEmoji(key))
        set.add(key)
    }
    return [...set]
  }
  const order = new Map<string, number>(
    SCRAP_REACTION_EMOJIS.map((emoji, i) => [emoji, i]),
  )
  return Object.entries(counts.value)
    .filter((entry): entry is [ReactionEmoji, number] =>
      entry[1] > 0 && isReactionEmoji(entry[0]))
    .sort((a, b) => (order.get(a[0]) ?? 99) - (order.get(b[0]) ?? 99))
    .map(([emoji]) => emoji)
})

function iconClass(emoji: string) {
  return SCRAP_REACTION_ICONS[emoji] ?? ''
}

function label(emoji: string) {
  return SCRAP_REACTION_LABELS[emoji] ?? emoji
}
</script>

<template>
  <div
    v-if="emojis.length"
    un-flex="~ wrap items-center data-[picker]:nowrap"
    un-gap-1
    role="group"
    :aria-label="`React to ${scrap.id}`"
    :data-picker="picker ? '' : undefined"
  >
    <button
      v-for="emoji in emojis"
      :key="emoji"
      type="button"
      un-inline-flex
      un-shrink-0
      un-items-center
      un-gap-1
      un-m-0
      un-cursor-pointer
      un-border-0
      un-border-b="transparent data-[on]:colored-ink"
      un-bg-transparent
      un-px-1
      un-py-0.5
      un-leading-none
      un-text="muted hover:ink focus-visible:ink data-[on]:ink"
      :aria-label="label(emoji)"
      :aria-pressed="mine === emoji"
      @click.stop="emit('react', emoji)"
    >
      <span
        :class="iconClass(emoji)"
        un-block
        un-h="[1.15em]"
        un-w="[1.15em]"
        un-shrink-0
        aria-hidden="true"
      />
      <span
        v-if="counts[emoji]"
        un-font-mono
        un-text-xs
        un-tabular-nums
        un-leading-none
      >{{ counts[emoji] }}</span>
    </button>
  </div>
</template>
