<script setup lang="ts">
import type { Activity } from '../../activity.d.ts'
import { onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import IconApp from './IconApp.vue'
import IconLoading from './IconLoading.vue'

// defineProps<{
//   activity: Activity | null
//   loading: boolean
//   error: string | null
// }>()

// Sync what I am doing
const R2_PUBLIC_URL = 'https://pub-d05ff6ec0ecf448ca7cc6c2f0c0a5bcc.r2.dev/activity.json'

const activity = ref<Activity>({ active: false })
const loading = ref(true)
const error = ref<string | null>(null)
const sleeping = ref(false)
let timer: number

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

onMounted(() => {
  fetchActivity()
  timer = setInterval(fetchActivity, 5000) as unknown as number
})

onUnmounted(() => {
  clearInterval(timer)
})

useI18n({
  useScope: 'global',
  messages: {
    en: {
      sleeping: 'Sleeping in {app}',
    },
    zh: {
      sleeping: '在 {app} 中眠了',
    },
  },
})

const appWithTitle = [
  'Zen',
  'Code',
  'Ghostty',
]
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
  >
    <span
      un-w-2
      un-h-2
      un-rounded-full
      un-bg="teal-400 dark:teal-600"
    />
    <span
      un-flex="~ row"
      un-items-center
      un-gap-1
      un-px-2
      un-py-0
      un-text="teal-600 dark:teal-400"
    >
      {{ activity.process?.name }}
      <IconApp
        v-if="activity.active"
        un-inline-block
        :app="activity.process?.name || ''"
        :alt="`${activity.process?.name} icon`"
      />
    </span>
    <span
      v-if="activity.process?.windowTitle && appWithTitle.includes(activity.process?.name || '')"
      un-flex="~ row"
      un-items-center
      un-gap-1
      un-text="neutral-500 dark:neutral-500"
    >
      - {{ activity.process?.windowTitle }}
      <IconApp
        v-if="activity.active"
        un-inline-block
        :app="activity.process?.windowTitle || ''"
        :alt="`${activity.process?.windowTitle} icon`"
      />
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
      un-before="content-empty bg-emerald-400/50 dark:bg-emerald-600/50 w-full h-1 absolute bottom-2 left-0 z-0"
    >
      <i18n-t
        keypath="sleeping"
      >
        <template #app>
          {{ activity.process?.name }}
          <IconApp
            v-if="activity.process?.name"
            un-inline-block
            :app="activity.process?.name || ''"
            :alt="`${activity.process?.name} icon`"
          />
        </template>
      </i18n-t>
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
