<script setup lang="ts">
import { useRoute } from 'vitepress'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import PersonaEmojiBadge from '~/components/stats/PersonaEmojiBadge.vue'
import { useGhostPresenceSession } from '~/composables/stats/useGhostPresence'

/**
 * Pointer-mode ghosts (auto when viewports match).
 * Progress marks live on ScrollTopHeader. Owns WS lifecycle.
 * Mounted from Layout on home + article paths only.
 */
const route = useRoute()
const { locale } = useI18n({ useScope: 'global' })
const pagePath = computed(() => route.path)
const localeRef = computed(() => locale.value)

const {
  pointerProjections,
  ghostEnabled,
  connected,
  otherCount,
  sendPeek,
} = useGhostPresenceSession(pagePath, localeRef)

const show = computed(() =>
  ghostEnabled.value && pointerProjections.value.length > 0,
)
</script>

<template>
  <Teleport to="body">
    <div
      v-if="ghostEnabled"
      class="ghost-pointer-layer"
      :data-ghost-connected="connected ? '1' : '0'"
      :data-ghost-peers="otherCount"
      aria-hidden="true"
    >
      <div
        v-for="peer in pointerProjections"
        v-show="show"
        :key="peer.id"
        class="ghost-pointer-marker"
        :class="{ 'ghost-pointer-marker--edge': peer.edge }"
        :style="{
          'left': `${peer.left}px`,
          'top': `${peer.top}px`,
          'color': peer.colorHex,
          '--ghost-angle': `${peer.angle}deg`,
        }"
        role="button"
        tabindex="0"
        :aria-label="peer.label"
        @click="sendPeek(peer.id)"
        @keydown.enter.prevent="sendPeek(peer.id)"
      >
        <span
          v-if="peer.edge"
          class="ghost-pointer-arrow"
        />
        <img
          v-else-if="peer.avatarUrl"
          class="ghost-pointer-icon ghost-pointer-avatar"
          :src="peer.avatarUrl"
          :alt="peer.label"
          width="16"
          height="16"
        >
        <PersonaEmojiBadge
          v-else
          class="ghost-pointer-icon"
          :emoji="peer.emoji"
          :color-hex="peer.colorHex"
          :size="16"
        />
        <span class="ghost-pointer-name">{{ peer.label }}</span>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.ghost-pointer-layer {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 40;
}

.ghost-pointer-marker {
  position: absolute;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  margin-left: -8px;
  margin-top: -8px;
  pointer-events: auto;
  cursor: pointer;
  transition:
    top 0.08s linear,
    left 0.08s linear,
    opacity 0.2s ease;
}

.ghost-pointer-marker--edge {
  margin-left: -7px;
  margin-top: -7px;
}

.ghost-pointer-icon {
  opacity: 0.85;
  transition:
    transform 0.15s ease,
    opacity 0.15s ease;
  box-shadow: 0 0 8px color-mix(in srgb, currentColor 45%, transparent);
}

.ghost-pointer-avatar {
  border-radius: 9999px;
  display: block;
}

.ghost-pointer-arrow {
  display: block;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 5px 0 5px 10px;
  border-color: transparent transparent transparent currentColor;
  opacity: 0.75;
  filter: drop-shadow(0 0 4px color-mix(in srgb, currentColor 45%, transparent));
  transform: rotate(var(--ghost-angle, 0deg));
  transform-origin: center;
  transition:
    transform 0.15s ease,
    opacity 0.15s ease;
}

.ghost-pointer-name {
  position: absolute;
  bottom: calc(100% + 4px);
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 10px;
  line-height: 1.2;
  padding: 1px 5px;
  border-radius: 4px;
  color: rgb(82 82 82);
  background: rgb(250 250 250 / 0.92);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s ease;
}

:global(.dark) .ghost-pointer-name {
  color: rgb(212 212 212);
  background: rgb(23 23 23 / 0.92);
}

.ghost-pointer-marker:hover .ghost-pointer-icon {
  opacity: 1;
  transform: scale(1.2);
}

.ghost-pointer-marker:hover .ghost-pointer-arrow {
  opacity: 1;
  transform: rotate(var(--ghost-angle, 0deg)) scale(1.2);
}

.ghost-pointer-marker:hover .ghost-pointer-name {
  opacity: 1;
}

@media (hover: none), (pointer: coarse) {
  .ghost-pointer-name {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ghost-pointer-marker,
  .ghost-pointer-icon,
  .ghost-pointer-arrow,
  .ghost-pointer-name {
    transition: none;
  }
}
</style>
