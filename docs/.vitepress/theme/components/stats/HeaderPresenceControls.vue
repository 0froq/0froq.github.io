<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import QCheckbox from '@/ui/base/QCheckbox.vue'
import PersonaEmojiBadge from '~/components/stats/PersonaEmojiBadge.vue'
import { useAnonPersona } from '~/composables/stats/useAnonPersona'
import { useGhostPresenceState } from '~/composables/stats/useGhostPresence'
import { useGitHubAuth } from '~/composables/useGitHubAuth'

const props = withDefaults(defineProps<{
  /** Unique checkbox id when mounted in multiple headers. */
  checkboxId?: string
}>(), {
  checkboxId: 'ghost-ink-toggle-header',
})

const { t, locale } = useI18n({ useScope: 'global' })
const { isAuthenticated, user } = useGitHubAuth()
const {
  persona,
  presenceAsAnon,
  setPresenceAsAnon,
  reshufflePersona,
} = useAnonPersona()
const { ghostEnabled } = useGhostPresenceState()

const asGithub = computed(() => isAuthenticated.value && !presenceAsAnon.value)
const name = computed(() => {
  if (asGithub.value)
    return user.value?.login || t('stats.personaGuest')
  return persona.value.label(locale.value)
})
const fullName = computed(() => {
  if (asGithub.value)
    return user.value?.login || t('stats.personaGuest')
  return persona.value.fullLabel(locale.value)
})

const avatarHint = computed(() => {
  if (asGithub.value)
    return user.value?.login || ''
  return `${fullName.value} · ${t('stats.personaReshuffle')}`
})

function onAvatarClick() {
  if (asGithub.value)
    return
  reshufflePersona()
}

function modeClass(active: boolean) {
  return active
    ? 'text-neutral-950 dark:text-neutral-50'
    : 'text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-400'
}
</script>

<template>
  <div
    class="header-presence-controls"
    un-inline-flex
    un-items-center
    un-gap-3
    un-mr-2
    un-text="sm neutral-500 dark:neutral-500"
    un-font-mono
  >
    <template v-if="ghostEnabled">
      <span
        class="header-presence-name"
        :title="fullName"
        un-truncate
        un-max-w="28"
        un-text="sm neutral-600 dark:neutral-400"
        un-font-mono
        un-leading-tight
      >{{ name }}</span>

      <button
        type="button"
        class="header-presence-avatar"
        :title="avatarHint"
        :disabled="asGithub"
        un-border-0
        un-bg-transparent
        un-p-0
        un-inline-flex
        un-items-center
        un-shrink-0
        :un-cursor="asGithub ? 'default' : 'pointer'"
        @click="onAvatarClick"
      >
        <img
          v-if="asGithub && user?.avatar_url"
          :src="user.avatar_url"
          :alt="user.login"
          width="28"
          height="28"
          un-rounded-full
          un-opacity-90
        >
        <PersonaEmojiBadge
          v-else
          :emoji="persona.emoji"
          :color-hex="persona.colorHex"
          :label="fullName"
          :size="28"
        />
      </button>

      <div
        v-if="isAuthenticated"
        un-flex="~ col"
        un-shrink-0
      >
        <span
          un-text-sm
          un-leading-tight
          un-px-1
        >
          <button
            type="button"
            un-transition-colors
            un-duration-200
            un-bg-transparent
            un-border-0
            un-p-0
            un-cursor-pointer
            un-font-mono
            :class="modeClass(presenceAsAnon)"
            :aria-pressed="presenceAsAnon"
            :title="t('stats.personaAsAnon')"
            @click="setPresenceAsAnon(true)"
          >{{ t('stats.personaToggleAnon') }}</button>
        </span>
        <span
          un-text-sm
          un-leading-tight
          un-px-1
        >
          <button
            type="button"
            un-transition-colors
            un-duration-200
            un-bg-transparent
            un-border-0
            un-p-0
            un-cursor-pointer
            un-font-mono
            :class="modeClass(!presenceAsAnon)"
            :aria-pressed="!presenceAsAnon"
            :title="t('stats.personaAsGithub', { login: user?.login || '' })"
            @click="setPresenceAsAnon(false)"
          >{{ t('stats.personaToggleGh') }}</button>
        </span>
      </div>
    </template>

    <QCheckbox
      :id="checkboxId"
      v-model="ghostEnabled"
      class="header-presence-ink"
      :label-text="{
        checked: t('stats.ghostToggleOn'),
        unchecked: t('stats.ghostToggleOff'),
      }"
    />
  </div>
</template>

<style scoped>
.header-presence-avatar:not(:disabled):hover {
  opacity: 0.85;
}
.header-presence-ink :deep(input[type='checkbox']) {
  width: 0.875rem;
  height: 0.875rem;
}
.header-presence-ink :deep(input[type='checkbox']::before) {
  width: 0.5rem;
  height: 0.5rem;
}
.header-presence-ink :deep(label) {
  font-size: 0.875rem;
  line-height: 1.25;
}
</style>
