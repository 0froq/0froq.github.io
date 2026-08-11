<script setup lang="ts">
import { computed, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import PersonaEmojiBadge from '~/components/stats/PersonaEmojiBadge.vue'
import { useGhostPeekNotices } from '~/composables/stats/useGhostPeekNotices'

const { t } = useI18n({ useScope: 'global' })
const { notices, dismiss, noticeTtlMs } = useGhostPeekNotices()

const visible = computed(() => [...notices.value].sort((a, b) => a.at - b.at))

const timers = new Map<number, ReturnType<typeof setTimeout>>()

function schedule(id: number, ttl: number) {
  if (timers.has(id))
    return
  const t0 = setTimeout(() => {
    timers.delete(id)
    dismiss(id)
  }, ttl)
  timers.set(id, t0)
}

function githubUrl(login: string): string {
  return `https://github.com/${encodeURIComponent(login)}`
}

function messageKey(kind: string): string {
  if (kind === 'poke')
    return 'stats.ghostPokeThem'
  if (kind === 'disturb')
    return 'stats.ghostDisturbYou'
  if (kind === 'annoy')
    return 'stats.ghostAnnoyThem'
  return 'stats.ghostPeekYou'
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
    schedule(n.id, noticeTtlMs(n))
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
          :class="{
            'ghost-peek-toast--disturb': n.kind === 'disturb' || n.kind === 'annoy',
          }"
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
              <i18n-t
                :keypath="messageKey(n.kind)"
                tag="span"
              >
                <template #name>
                  <a
                    v-if="n.fromGhLogin"
                    class="ghost-peek-toast__link"
                    :href="githubUrl(n.fromGhLogin)"
                    target="_blank"
                    rel="noopener noreferrer"
                    @click.stop
                  >{{ n.label }}</a>
                  <span v-else>{{ n.label }}</span>
                </template>
              </i18n-t>
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
  transition:
    transform 0.28s ease,
    font-size 0.28s ease,
    padding 0.28s ease;
}

.ghost-peek-toast--disturb .ghost-peek-toast__bar {
  font-size: 0.95rem;
  padding: 0.7rem 1rem;
  max-width: min(94vw, 26rem);
  --uno: 'border-neutral-400/40 dark:border-neutral-500/40 text-neutral-800 dark:text-neutral-200';
  box-shadow:
    0 6px 18px -4px rgb(0 0 0 / 0.16),
    0 16px 40px -12px rgb(0 0 0 / 0.28);
}

:global(.dark) .ghost-peek-toast__bar {
  box-shadow:
    0 4px 16px -4px rgb(0 0 0 / 0.6),
    0 14px 40px -10px rgb(0 0 0 / 0.7);
}

:global(.dark) .ghost-peek-toast--disturb .ghost-peek-toast__bar {
  box-shadow:
    0 6px 20px -4px rgb(0 0 0 / 0.7),
    0 18px 48px -10px rgb(0 0 0 / 0.8);
}

.ghost-peek-toast__avatar {
  --uno: 'rounded-full shrink-0 opacity-90';
}

.ghost-peek-toast--disturb .ghost-peek-toast__avatar {
  width: 28px;
  height: 28px;
}

.ghost-peek-toast__text {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ghost-peek-toast__link {
  --uno: 'underline underline-offset-2 text-neutral-800 dark:text-neutral-100 hover:text-neutral-950 dark:hover:text-white';
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
  .ghost-peek-move,
  .ghost-peek-toast__bar {
    transition: none;
  }
}
</style>

<style>
/* Gentle full-page nudge when someone spam-pokes. */
html.ghost-peek-shake {
  animation: ghost-peek-shake 0.6s ease-in-out;
  transform-origin: center;
}

@keyframes ghost-peek-shake {
  0%,
  100% {
    transform: rotate(0deg) translate3d(0, 0, 0);
  }
  15% {
    transform: rotate(0.6deg) translate3d(1px, 0, 0);
  }
  30% {
    transform: rotate(-0.8deg) translate3d(-1px, 0, 0);
  }
  50% {
    transform: rotate(0.5deg) translate3d(1px, 0, 0);
  }
  70% {
    transform: rotate(-0.3deg) translate3d(-1px, 0, 0);
  }
  85% {
    transform: rotate(0.15deg) translate3d(0, 0, 0);
  }
}

@media (prefers-reduced-motion: reduce) {
  html.ghost-peek-shake {
    animation: none;
  }
}
</style>
