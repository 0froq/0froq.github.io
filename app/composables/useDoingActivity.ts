import {
  activityIsSleeping,
  parseActivity,
  type Activity,
} from '~/utils/activity'

const R2_PUBLIC_URL = 'https://pub-d05ff6ec0ecf448ca7cc6c2f0c0a5bcc.r2.dev/activity.json'

let pollTimer: ReturnType<typeof setInterval> | null = null
let inflight: Promise<void> | null = null

export function useDoingActivity() {
  const activity = useState<Activity>('doing-activity', () => ({ active: false }))
  const loading = useState('doing-loading', () => true)
  const sleeping = useState('doing-sleeping', () => false)
  const error = useState<string | null>('doing-error', () => null)
  const subscribers = useState('doing-subscribers', () => 0)

  async function fetchActivity() {
    if (!import.meta.client)
      return
    if (inflight)
      return inflight

    inflight = (async () => {
      try {
        const response = await fetch(`${R2_PUBLIC_URL}?t=${Date.now()}`, {
          mode: 'cors',
        })
        if (!response.ok)
          throw new Error(`HTTP ${response.status}`)
        const next = parseActivity(await response.json())
        const stale = activityIsSleeping(next)
        next.active = !stale
        activity.value = next
        sleeping.value = stale
        error.value = null
      }
      catch (err) {
        error.value = err instanceof Error ? err.message : 'Unknown error'
      }
      finally {
        loading.value = false
      }
    })().finally(() => {
      inflight = null
    })

    return inflight
  }

  onMounted(() => {
    subscribers.value += 1
    if (subscribers.value !== 1)
      return
    fetchActivity()
    pollTimer = setInterval(fetchActivity, 5000)
  })

  onUnmounted(() => {
    subscribers.value = Math.max(0, subscribers.value - 1)
    if (subscribers.value > 0)
      return
    if (pollTimer) {
      clearInterval(pollTimer)
      pollTimer = null
    }
  })

  return {
    activity,
    loading,
    sleeping,
    error,
    fetchActivity,
  }
}
