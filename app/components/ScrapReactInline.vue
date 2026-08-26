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

const emojis = computed(() => {
  if (props.picker) {
    const set = new Set<string>(SCRAP_REACTION_EMOJIS)
    for (const key of Object.keys(counts.value)) {
      if (SCRAP_REACTION_ICONS[key])
        set.add(key)
    }
    return [...set]
  }
  const order = new Map(SCRAP_REACTION_EMOJIS.map((emoji, i) => [emoji, i]))
  return Object.entries(counts.value)
    .filter(([key, n]) => n > 0 && SCRAP_REACTION_ICONS[key])
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
    class="scrap-react"
    :data-picker="picker ? '' : undefined"
    role="group"
    :aria-label="`React to ${scrap.id}`"
  >
    <button
      v-for="emoji in emojis"
      :key="emoji"
      type="button"
      class="scrap-react-btn"
      :data-on="mine === emoji ? '' : undefined"
      :aria-label="label(emoji)"
      :aria-pressed="mine === emoji"
      @click.stop="emit('react', emoji)"
    >
      <span
        class="scrap-react-icon"
        :class="iconClass(emoji)"
        aria-hidden="true"
      />
      <span
        v-if="counts[emoji]"
        class="scrap-react-count"
      >{{ counts[emoji] }}</span>
    </button>
  </div>
</template>

<style scoped>
.scrap-react {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.25rem;
}

.scrap-react[data-picker] {
  flex-wrap: nowrap;
}

.scrap-react-btn {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: 0.28rem;
  margin: 0;
  padding: 0.2em 0.3em;
  border: 0;
  border-bottom: 1px solid transparent;
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  line-height: 1;
}

.scrap-react-btn:hover,
.scrap-react-btn:focus-visible,
.scrap-react-btn[data-on] {
  color: var(--ink);
}

.scrap-react-btn[data-on] {
  border-bottom-color: var(--colored-ink);
}

.scrap-react-icon {
  display: block;
  flex: none;
  width: 1.15em;
  height: 1.15em;
}

.scrap-react-count {
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}
</style>
