<script setup lang="ts">
const deck = useJournalDeck()
const moving = computed(() => deck?.moving.value ?? false)
const monthItems = computed(() => deck?.monthItems.value ?? [])
const monthId = computed(() => deck?.centerId.value ?? undefined)
const focusPath = computed(() => deck?.focusPath.value ?? null)
const hasCards = computed(() => monthItems.value.length > 0)
const holding = computed(() => moving.value && hasCards.value)
const cover = ref(false)

watch(holding, (on) => {
  if (on)
    cover.value = true
})

function onActive(entry: LayerEntry | null) {
  deck?.setActive(entry)
}
</script>

<template>
  <aside
    v-if="deck"
    class="journal-fan"
    un-relative
    un-flex
    un-flex-col
    un-pointer-events-none
    un-min-w-0
    un-w-full
    un-box-border
    un-h="[28rem]"
    un-min-h="[28rem]"
    un-shrink-0
    un-pb="[var(--site-footer)]"
    un-lg:h-full
    un-lg:min-h-full
    un-lg:w-96
    un-lg:min-w-96
    un-lg:max-w-96
    un-lg:flex-none
    un-lg:self-stretch
    un-lg:justify-center
    un-lg:pt="[calc(var(--hub-pad-top)+var(--hub-body-pad-top))]"
    un-lg:pb="[var(--hub-pad-bottom)]"
  >
    <div
      v-if="cover && hasCards"
      class="journal-fan__hold"
      aria-hidden="true"
    >
      <span class="journal-fan__sheet" />
    </div>
    <PublicationJournalMonthFolder
      v-if="hasCards && !moving"
      embedded
      :items="monthItems"
      :month="monthId"
      :focus-path="focusPath"
      @active="onActive"
      @inked="cover = false"
    />
  </aside>
</template>

<style scoped>
.journal-fan {
  pointer-events: none;
}

.journal-fan :deep(.month-folder) {
  position: relative;
  z-index: 1;
  pointer-events: auto;
}

.journal-fan__hold {
  position: absolute;
  inset: 0;
  z-index: 0;
  min-height: 28rem;
  pointer-events: none;
}

.journal-fan__sheet {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 16rem;
  height: 9rem;
  border: 1px solid var(--line);
  background: var(--paper);
  transform: translate(-50%, -50%);
}
</style>
