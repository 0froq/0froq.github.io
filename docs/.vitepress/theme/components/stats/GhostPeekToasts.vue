<script setup lang="ts">
import { computed, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import PersonaEmojiBadge from '~/components/stats/PersonaEmojiBadge.vue'
import { useGhostPeekNotices } from '~/composables/stats/useGhostPeekNotices'

const { t } = useI18n({ useScope: 'global' })
const { notices, dismiss, ttlMs } = useGhostPeekNotices()

const visible = computed(() => [...notices.value].sort((a, b) => a.at - b.at))

const timers = new Map<number, ReturnType<typeof setTimeout>>()

function schedule(id: number) {
  if (timers.has(id))
    return
  const t0 = setTimeout(() => {
    timers.delete(id)
    dismiss(id)
  }, ttlMs)
  timers.set(id, t0)
}

watch(visible, (list) => {
  const ids = new Set(list.map(n => n.id))
  for (const [id, timer] of timers) {
    if (!ids.has(id)) {
      clearTimeout(timer)
      timers.delete(id)
    }
  }
  for (const n of list)
    schedule(n.id)
}, { immediate: true, deep: false })

onUnmounted(() => {
  for (const timer of timers.values())
    clearTimeout(timer)
  timers.clear()
})
</script>

<template>
  <Teleport to="body">
    <div
      class="ghost-peek-toasts"
      role="status"
      aria-live="polite"
    >
      <TransitionGroup name="ghost-peek">
        <div
          v-for="n in visible"
          :key="n.id"
          class="ghost-peek-toast"
          @click="dismiss(n.id)"
        >
          <div class="ghost-peek-toast__bar">
            <img
              v-if="n.avatarUrl"
              class="ghost-peek-toast__avatar"
              :src="n.avatarUrl"
              :alt="n.label"
              width="22"
              height="22"
            >
            <PersonaEmojiBadge
              v-else
              :emoji="n.emoji"
              :color-hex="n.colorHex"
              :size="22"
            />
            <span class="ghost-peek-toast__text">
              {{ t('stats.ghostPeekYou', { name: n.label }) }}
            </span>
            <button
              type="button"
              class="ghost-peek-toast__close"
              :aria-label="t('stats.dismissNotice')"
              @click.stop="dismiss(n.id)"
            >
              ×
            </button>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.ghost-peek-toasts {
  position: fixed;
  left: 50%;
  bottom: max(1rem, env(safe-area-inset-bottom));
  transform: translateX(-50%);
  z-index: 60;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  pointer-events: none;
  max-width: min(92vw, 22rem);
  padding: 0 0.5rem;
}

.ghost-peek-toast {
  pointer-events: auto;
  width: 100%;
  display: flex;
  justify-content: center;
}

.ghost-peek-toast__bar {
  --uno: 'flex items-center gap-2 px-2.5 py-2 rounded-full border border-black/6 dark:border-white/12 bg-neutral-50/88 dark:bg-neutral-900/92 backdrop-blur-md font-mono text-xs leading-snug text-neutral-700 dark:text-neutral-300';
  box-shadow:
    0 4px 14px -4px rgb(0 0 0 / 0.12),
    0 12px 32px -12px rgb(0 0 0 / 0.2);
}

:global(.dark) .ghost-peek-toast__bar {
  box-shadow:
    0 4px 16px -4px rgb(0 0 0 / 0.6),
    0 14px 40px -10px rgb(0 0 0 / 0.7);
}

.ghost-peek-toast__avatar {
  --uno: 'rounded-full shrink-0 opacity-90';
}

.ghost-peek-toast__text {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ghost-peek-toast__close {
  --uno: 'border-none bg-transparent px-0.5 text-base leading-none cursor-pointer text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300';
}

.ghost-peek-enter-active,
.ghost-peek-leave-active {
  transition:
    opacity 0.28s ease,
    transform 0.28s ease;
}

.ghost-peek-enter-from,
.ghost-peek-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.98);
}

.ghost-peek-move {
  transition: transform 0.28s ease;
}

@media (prefers-reduced-motion: reduce) {
  .ghost-peek-enter-active,
  .ghost-peek-leave-active,
  .ghost-peek-move {
    transition: none;
  }
}
</style>
