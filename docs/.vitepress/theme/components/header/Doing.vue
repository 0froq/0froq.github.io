<script setup lang="ts">
import type { DoingPhrasePick } from '~/composables/doing/appPhrases'
import type { Activity } from '~/types'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import IconApp from '@/ui/icon/IconApp.vue'
import IconLoading from '@/ui/icon/IconLoading.vue'
import {
  pickDoingPhrase,
  splitDoingPhrase,
} from '~/composables/doing/appPhrases'

// Sync what I am doing
const R2_PUBLIC_URL = 'https://pub-d05ff6ec0ecf448ca7cc6c2f0c0a5bcc.r2.dev/activity.json'

const activity = ref<Activity>({ active: false })
const loading = ref(true)
const error = ref<string | null>(null)
const sleeping = ref(false)
const phrase = ref<DoingPhrasePick>({ text: '{app}' })
let timer: number

const { locale } = useI18n({ useScope: 'global' })

const appName = computed(() => activity.value.process?.name || '')
const mode = computed(() => (sleeping.value ? 'sleeping' : 'working') as const)
const phraseParts = computed(() => splitDoingPhrase(phrase.value.text))

function reshufflePhrase(opts?: { avoidCurrent?: boolean }) {
  if (!appName.value) {
    phrase.value = { text: '{app}' }
    return
  }
  const current = phrase.value.text
  let next = pickDoingPhrase(appName.value, mode.value, locale.value)
  if (opts?.avoidCurrent && next.text === current) {
    for (let i = 0; i < 8; i++) {
      next = pickDoingPhrase(appName.value, mode.value, locale.value)
      if (next.text !== current)
        break
    }
  }
  phrase.value = next
}

function onPhraseClick() {
  reshufflePhrase({ avoidCurrent: true })
}

async function fetchActivity() {
  try {
    const response = await fetch(`${R2_PUBLIC_URL}?t=${Date.now()}`, {
      mode: 'cors',
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    activity.value = await response.json()
    error.value = null
    // Detect if the activity is sleeping (`timestamp` older than 5 minute)
    if (!activity.value.timestamp) {
      sleeping.value = true
      return
    }
    const timestamp = new Date(activity.value.timestamp).getTime()
    const now = Date.now()
    sleeping.value = now - timestamp > 5 * 60 * 1000
    activity.value.active = !sleeping.value
  }
  catch (err) {
    console.error('Failed to fetch activity:', err)
    error.value = err instanceof Error ? err.message : 'Unknown error'
    activity.value = { active: false }
  }
  finally {
    loading.value = false
  }
}

// Re-roll only when app / active↔sleep / locale changes — not every 5s poll.
watch(
  [appName, mode, locale],
  () => reshufflePhrase(),
  { immediate: true },
)

onMounted(() => {
  fetchActivity()
  timer = setInterval(fetchActivity, 5000) as unknown as number
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>

<template>
  <div
    v-if="activity && activity.active"
    un-h-8
    un-text-sm
    un-flex="~ row"
    un-items-center
    un-gap-2
    un-relative
    un-z-1
    un-overflow-x-hidden
  >
    <span
      un-w-2
      un-h-2
      un-rounded-full
      un-shrink-0
      un-bg="neutral-800 dark:neutral-100"
    />
    <span
      un-flex="~ row"
      un-items-center
      un-gap-1
      un-px-2
      un-py-0
      un-text="neutral-800 dark:neutral-100"
      un-font-mono
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
          un-items-center
          un-gap-1
          un-text="neutral-800 dark:neutral-100"
          un-underline
          un-underline-offset-2
          un-decoration-neutral-400
        >
          {{ appName }}
          <IconApp
            un-inline-block
            :app="appName"
            :alt="`${appName} icon`"
          />
        </a>
        <span
          v-else
          un-inline-flex
          un-items-center
          un-gap-1
        >
          {{ appName }}
          <IconApp
            un-inline-block
            :app="appName"
            :alt="`${appName} icon`"
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
        <span>-</span>
        <a
          v-if="phrase.url"
          :href="phrase.url"
          target="_blank"
          rel="noopener noreferrer"
          un-inline-flex
          un-items-center
          un-gap-1
          un-text="neutral-800 dark:neutral-100"
          un-underline
          un-underline-offset-2
          un-decoration-neutral-400
        >
          {{ appName }}
          <IconApp
            un-inline-block
            :app="appName"
            :alt="`${appName} icon`"
          />
        </a>
        <span
          v-else
          un-inline-flex
          un-items-center
          un-gap-1
        >
          {{ appName }}
          <IconApp
            un-inline-block
            :app="appName"
            :alt="`${appName} icon`"
          />
        </span>
      </template>
    </span>
  </div>

  <div
    v-else-if="sleeping"
    un-h-8
    un-text-sm
    un-flex="~ row"
    un-items-center
    un-gap-2
  >
    <span
      un-w-2
      un-h-2
      un-rounded-full
      un-border="~ 1 neutral-400 dark:neutral-600"
    />
    <span
      class="pulse-slow"
      un-flex="~ row"
      un-items-center
      un-gap-1
      un-px-2
      un-py-0
      un-font-mono
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
          un-items-center
          un-gap-1
          un-underline
          un-underline-offset-2
          un-decoration-neutral-400
        >
          {{ appName }}
          <IconApp
            un-inline-block
            :app="appName"
            :alt="`${appName} icon`"
          />
        </a>
        <span
          v-else
          un-inline-flex
          un-items-center
          un-gap-1
        >
          {{ appName }}
          <IconApp
            un-inline-block
            :app="appName"
            :alt="`${appName} icon`"
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
        <span>-</span>
        <a
          v-if="phrase.url"
          :href="phrase.url"
          target="_blank"
          rel="noopener noreferrer"
          un-inline-flex
          un-items-center
          un-gap-1
          un-underline
          un-underline-offset-2
          un-decoration-neutral-400
        >
          {{ appName }}
          <IconApp
            un-inline-block
            :app="appName"
            :alt="`${appName} icon`"
          />
        </a>
        <span
          v-else
          un-inline-flex
          un-items-center
          un-gap-1
        >
          {{ appName }}
          <IconApp
            un-inline-block
            :app="appName"
            :alt="`${appName} icon`"
          />
        </span>
      </template>
      <un-i-solar-sleeping-circle-bold-duotone />
    </span>
  </div>

  <div
    v-else-if="loading"
    un-h-8
    un-text-sm
    un-flex="~ row"
    un-items-center
    un-gap-2
  >
    <IconLoading />
  </div>
</template>

<style scoped>
.pulse-slow {
  animation: pulse 3s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}
</style>
