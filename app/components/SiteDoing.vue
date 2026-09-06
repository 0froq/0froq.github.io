<script setup lang="ts">
import { pickDoingPhrase, splitDoingPhrase } from '~/utils/doingPhrases'

defineOptions({ inheritAttrs: false })

const DOING_LOCALE = 'en'

const { activity, sleeping, loading } = useDoingActivity()

const appName = computed(() => activity.value.process?.name || '')
const iconUrl = computed(() => activity.value.process?.iconUrl || '')
const mode = computed(() => (sleeping.value ? 'sleeping' : 'working') as const)

const phrase = ref(pickDoingPhrase('', 'working', DOING_LOCALE))
const phraseParts = computed(() => splitDoingPhrase(phrase.value.text))

const show = computed(() => {
  if (loading.value || !appName.value)
    return false
  return sleeping.value || activity.value.active
})

function reshufflePhrase(opts?: { avoidCurrent?: boolean }) {
  if (!appName.value) {
    phrase.value = { text: '{app}' }
    return
  }
  const current = phrase.value.text
  let next = pickDoingPhrase(appName.value, mode.value, DOING_LOCALE)
  if (opts?.avoidCurrent && next.text === current) {
    for (let i = 0; i < 8; i++) {
      next = pickDoingPhrase(appName.value, mode.value, DOING_LOCALE)
      if (next.text !== current)
        break
    }
  }
  phrase.value = next
}

function onPhraseClick() {
  reshufflePhrase({ avoidCurrent: true })
}

watch(
  [appName, mode],
  () => reshufflePhrase(),
  { immediate: true },
)
</script>

<template>
  <div
    v-bind="$attrs"
    un-min-w-0
  >
    <div
      v-if="show"
      un-m-0
      un-flex
      un-min-w-0
      un-max-w-full
      un-items-center
      un-gap-2
      un-overflow-hidden
      un-font-mono
      un-text="xs muted"
      un-leading-none
    >
    <span
      v-if="sleeping"
      un-box-border
      un-h-2
      un-w-2
      un-shrink-0
      un-rounded-full
      un-border
      un-border-muted
      un-bg-transparent
    />
    <span
      v-else
      un-h-2
      un-w-2
      un-shrink-0
      un-rounded-full
      un-bg-ink
    />
    <span
      :class="sleeping ? 'doing-pulse' : undefined"
      un-flex
      un-min-w-0
      un-items-center
      un-gap-1
      un-truncate
    >
      <span
        un-cursor-pointer
        role="button"
        tabindex="0"
        title="reshuffle"
        @click="onPhraseClick"
        @keydown.enter.prevent="onPhraseClick"
      >{{ phraseParts.before }}</span>
      <template v-if="phraseParts.hasApp && appName">
        <a
          v-if="phrase.url"
          :href="phrase.url"
          target="_blank"
          rel="noopener noreferrer"
          un-inline-flex
          un-min-w-0
          un-items-center
          un-gap-1
          un-text="muted hover:colored-ink"
          un-underline
          un-underline-offset-2
          un-decoration-line
        >
          <span un-truncate>{{ appName }}</span>
          <img
            v-if="iconUrl"
            :src="iconUrl"
            alt=""
            width="16"
            height="16"
            un-h-4
            un-w-4
            un-shrink-0
          >
          <SiteDoingAppIcon
            v-else
            :app="appName"
          />
        </a>
        <span
          v-else
          un-inline-flex
          un-min-w-0
          un-items-center
          un-gap-1
        >
          <span un-truncate>{{ appName }}</span>
          <img
            v-if="iconUrl"
            :src="iconUrl"
            alt=""
            width="16"
            height="16"
            un-h-4
            un-w-4
            un-shrink-0
          >
          <SiteDoingAppIcon
            v-else
            :app="appName"
          />
        </span>
        <span
          v-if="phraseParts.after"
          un-cursor-pointer
          role="button"
          tabindex="0"
          title="reshuffle"
          @click="onPhraseClick"
          @keydown.enter.prevent="onPhraseClick"
        >{{ phraseParts.after }}</span>
      </template>
      <template v-else-if="appName">
        <span aria-hidden="true">·</span>
        <a
          v-if="phrase.url"
          :href="phrase.url"
          target="_blank"
          rel="noopener noreferrer"
          un-inline-flex
          un-min-w-0
          un-items-center
          un-gap-1
          un-text="muted hover:colored-ink"
          un-underline
          un-underline-offset-2
          un-decoration-line
        >
          <span un-truncate>{{ appName }}</span>
          <img
            v-if="iconUrl"
            :src="iconUrl"
            alt=""
            width="16"
            height="16"
            un-h-4
            un-w-4
            un-shrink-0
          >
          <SiteDoingAppIcon
            v-else
            :app="appName"
          />
        </a>
        <span
          v-else
          un-inline-flex
          un-min-w-0
          un-items-center
          un-gap-1
        >
          <span un-truncate>{{ appName }}</span>
          <img
            v-if="iconUrl"
            :src="iconUrl"
            alt=""
            width="16"
            height="16"
            un-h-4
            un-w-4
            un-shrink-0
          >
          <SiteDoingAppIcon
            v-else
            :app="appName"
          />
        </span>
      </template>
      <span
        v-if="sleeping"
        un-i-solar-sleeping-circle-bold-duotone
        un-inline-block
        un-size="1em"
        un-shrink-0
      />
    </span>
    </div>
  </div>
</template>

<style scoped>
.doing-pulse {
  animation: doing-pulse 3s infinite;
}

@keyframes doing-pulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}
</style>
