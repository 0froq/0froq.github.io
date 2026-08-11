import type { Ref } from 'vue'
import { useEventListener, useThrottleFn } from '@vueuse/core'
import { computed, onMounted, readonly, ref, watch } from 'vue'
import { useGitHubAuth } from '~/composables/useGitHubAuth'
import {
  PROGRESS_LOCAL_THROTTLE_MS,
  PROGRESS_STORAGE_PREFIX,
  PROGRESS_SYNC_DEBOUNCE_MS,
  READ_THRESHOLD,
  VISIT_THRESHOLD,
} from './constants'
import { froqApiConfigured, froqFetch } from './froqApi'
import { recordVisit } from './usePagePresence'

export interface LocalProgress {
  maxProgress: number
  read: boolean
  updatedAt: string
}

function storageKey(pagePath: string): string {
  return `${PROGRESS_STORAGE_PREFIX}${pagePath}`
}

function readLocal(pagePath: string): LocalProgress {
  if (typeof localStorage === 'undefined') {
    return { maxProgress: 0, read: false, updatedAt: new Date(0).toISOString() }
  }
  try {
    const raw = localStorage.getItem(storageKey(pagePath))
    if (!raw)
      return { maxProgress: 0, read: false, updatedAt: new Date(0).toISOString() }
    const parsed = JSON.parse(raw) as LocalProgress
    return {
      maxProgress: Math.min(1, Math.max(0, Number(parsed.maxProgress) || 0)),
      read: Boolean(parsed.read),
      updatedAt: parsed.updatedAt || new Date(0).toISOString(),
    }
  }
  catch {
    return { maxProgress: 0, read: false, updatedAt: new Date(0).toISOString() }
  }
}

function writeLocal(pagePath: string, progress: LocalProgress): void {
  if (typeof localStorage === 'undefined')
    return
  localStorage.setItem(storageKey(pagePath), JSON.stringify(progress))
}

/** Same scroll % formula as ScrollTopHeader.vue */
export function measureArticleProgress(): number {
  if (typeof window === 'undefined')
    return 0
  const articleWrapper = document.getElementById('content')
  if (!articleWrapper)
    return 0

  const rect = articleWrapper.getBoundingClientRect()
  const height = rect.height || articleWrapper.offsetHeight
  if (height <= 0)
    return 0

  const scrollY = window.scrollY
  // Document Y of content top — avoid offsetTop (relative to offsetParent).
  const wrapperOffsetY = rect.top + scrollY
  const windowHeight = window.innerHeight

  if (height <= windowHeight)
    return 1

  return Math.min(
    1,
    Math.max(
      0,
      (scrollY - wrapperOffsetY)
      / Math.max(0, height - windowHeight),
    ),
  )
}

function mergeProgress(a: LocalProgress, b: LocalProgress): LocalProgress {
  const maxProgress = Math.max(a.maxProgress, b.maxProgress)
  return {
    maxProgress,
    read: a.read || b.read || maxProgress >= READ_THRESHOLD,
    updatedAt: a.updatedAt > b.updatedAt ? a.updatedAt : b.updatedAt,
  }
}

/**
 * Per-page reading progress: always local; sync to froq-api when GitHub-authenticated.
 */
export function useReadingProgress(pagePath: Ref<string>) {
  const maxProgress = ref(0)
  const read = ref(false)
  const { token, user, isAuthenticated } = useGitHubAuth()

  let syncTimer: ReturnType<typeof setTimeout> | null = null

  function apply(p: LocalProgress) {
    maxProgress.value = p.maxProgress
    read.value = p.read || p.maxProgress >= READ_THRESHOLD
  }

  function maybeRecordVisit(path: string, progress: number) {
    if (progress >= VISIT_THRESHOLD)
      void recordVisit(path)
  }

  function persistLocal(path: string) {
    const record: LocalProgress = {
      maxProgress: maxProgress.value,
      read: read.value,
      updatedAt: new Date().toISOString(),
    }
    writeLocal(path, record)
    return record
  }

  async function fetchRemote(path: string): Promise<LocalProgress | null> {
    if (!froqApiConfigured() || !token.value)
      return null
    const res = await froqFetch(
      `/progress?pagePath=${encodeURIComponent(path)}`,
      {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token.value}`,
        },
      },
    )
    if (!res || !res.ok)
      return null
    try {
      const data = await res.json() as Partial<LocalProgress>
      return {
        maxProgress: Math.min(1, Math.max(0, Number(data.maxProgress) || 0)),
        read: Boolean(data.read),
        updatedAt: data.updatedAt || new Date(0).toISOString(),
      }
    }
    catch {
      return null
    }
  }

  async function pushRemote(path: string, record: LocalProgress): Promise<void> {
    if (!froqApiConfigured() || !token.value)
      return
    await froqFetch('/progress', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token.value}`,
      },
      body: JSON.stringify({
        pagePath: path,
        maxProgress: record.maxProgress,
        read: record.read,
      }),
    })
  }

  function scheduleSync(path: string) {
    if (!isAuthenticated.value)
      return
    if (syncTimer)
      clearTimeout(syncTimer)
    syncTimer = setTimeout(() => {
      const record = persistLocal(path)
      void pushRemote(path, record)
    }, PROGRESS_SYNC_DEBOUNCE_MS)
  }

  async function hydrate(path: string) {
    const local = readLocal(path)
    apply(local)
    maybeRecordVisit(path, maxProgress.value)

    if (isAuthenticated.value) {
      const remote = await fetchRemote(path)
      if (remote) {
        const merged = mergeProgress(local, remote)
        apply(merged)
        writeLocal(path, merged)
        maybeRecordVisit(path, maxProgress.value)
        if (
          merged.maxProgress > (remote.maxProgress || 0)
          || merged.read !== remote.read
        ) {
          void pushRemote(path, merged)
        }
      }
    }
  }

  const onScroll = useThrottleFn(() => {
    const path = pagePath.value
    if (!path)
      return
    const current = measureArticleProgress()
    if (current > maxProgress.value) {
      maxProgress.value = current
      if (current >= READ_THRESHOLD)
        read.value = true
      persistLocal(path)
      scheduleSync(path)
      maybeRecordVisit(path, current)
    }
  }, PROGRESS_LOCAL_THROTTLE_MS)

  onMounted(() => {
    if (pagePath.value)
      void hydrate(pagePath.value)
    onScroll()
  })

  watch(pagePath, (path) => {
    if (!path)
      return
    void hydrate(path)
  })

  watch(isAuthenticated, (ok) => {
    if (ok && pagePath.value)
      void hydrate(pagePath.value)
  })

  if (typeof window !== 'undefined') {
    useEventListener(window, ['scroll', 'resize'], onScroll, { passive: true })
  }

  const progressPercent = computed(() => Math.round(maxProgress.value * 100))

  return {
    maxProgress: readonly(maxProgress),
    read: readonly(read),
    progressPercent,
    /** Expose login for UI hints */
    synced: computed(() => Boolean(isAuthenticated.value && user.value)),
  }
}
