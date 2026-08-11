<script setup lang="ts">
import { computed } from 'vue'
import PersonaEmojiBadge from '~/components/stats/PersonaEmojiBadge.vue'
import { useGhostPresenceState } from '~/composables/stats/useGhostPresence'

/**
 * Co-reader progress marks on the ScrollTopHeader reading bar.
 * Shown for progress mode, and as fallback when pointer viewports mismatch.
 */
const { progressPeers, ghostEnabled, otherCount, sendPeek } = useGhostPresenceState()

const show = computed(() => ghostEnabled.value && otherCount.value >= 1 && progressPeers.value.length > 0)

function markClass(peer: { p: number }) {
  return {
    'ghost-progress-mark--edge-left': peer.p < 0.06,
    'ghost-progress-mark--edge-right': peer.p > 0.94,
  }
}

function onMarkClick(peer: { id: string }) {
  sendPeek(peer.id)
}
</script>

<template>
  <div
    v-if="show"
    class="ghost-progress-marks"
    aria-hidden="true"
  >
    <span
      v-for="peer in progressPeers"
      :key="peer.id"
      class="ghost-progress-mark"
      :class="markClass(peer)"
      :style="{ left: `${peer.p * 100}%` }"
      role="button"
      tabindex="0"
      :aria-label="peer.label"
      @click="onMarkClick(peer)"
      @keydown.enter.prevent="onMarkClick(peer)"
    >
      <img
        v-if="peer.avatarUrl"
        class="ghost-progress-mark__icon ghost-progress-mark__avatar"
        :src="peer.avatarUrl"
        :alt="peer.label"
        width="14"
        height="14"
      >
      <PersonaEmojiBadge
        v-else
        class="ghost-progress-mark__icon"
        :emoji="peer.emoji"
        :color-hex="peer.colorHex"
        :size="14"
      />
      <span class="ghost-progress-mark__name">{{ peer.label }}</span>
    </span>
  </div>
</template>

<style scoped>
.ghost-progress-marks {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 2;
}

.ghost-progress-mark {
  position: absolute;
  top: 50%;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  margin-left: -7px;
  margin-top: -7px;
  pointer-events: auto;
  cursor: pointer;
  transition: left 0.35s ease-out;
}

.ghost-progress-mark__icon {
  transition: transform 0.15s ease;
  box-shadow: 0 0 0 1.5px rgb(255 255 255 / 0.55);
}

.ghost-progress-mark__avatar {
  border-radius: 9999px;
  display: block;
}

:global(.dark) .ghost-progress-mark__icon {
  box-shadow: 0 0 0 1.5px rgb(0 0 0 / 0.45);
}

.ghost-progress-mark__name {
  position: absolute;
  bottom: calc(100% + 2px);
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 10px;
  line-height: 1.2;
  color: rgb(115 115 115);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s ease;
}

.ghost-progress-mark--edge-left .ghost-progress-mark__name {
  left: 0;
  transform: none;
}

.ghost-progress-mark--edge-right .ghost-progress-mark__name {
  left: auto;
  right: 0;
  transform: none;
}

:global(.dark) .ghost-progress-mark__name {
  color: rgb(163 163 163);
}

.ghost-progress-mark:hover .ghost-progress-mark__icon {
  transform: scale(1.2);
}

.ghost-progress-mark:hover .ghost-progress-mark__name {
  opacity: 1;
}

/* Touch: no hover — keep labels readable on the progress bar. */
@media (hover: none), (pointer: coarse) {
  .ghost-progress-mark__name {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ghost-progress-mark,
  .ghost-progress-mark__icon,
  .ghost-progress-mark__name {
    transition: none;
  }
}
</style>
