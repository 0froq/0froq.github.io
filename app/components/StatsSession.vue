<script setup lang="ts">
import { HEARTBEAT_MS, VISIT_THRESHOLD } from '~/utils/siteConstants'

function normalizePath(path: string) {
  if (!path || path === '/')
    return '/'
  return path.replace(/\/$/, '') || '/'
}

const route = useRoute()
const anonId = useAnonId()
const { pingSession, leaveSession, configured } = useFroqApi()
const stats = useSiteStats()
const counted = new Set<string>()
let timer: ReturnType<typeof setInterval> | null = null
let active = ''

const pagePath = computed(() => normalizePath(route.path))

async function ping(countVisit: boolean) {
  if (!configured.value || !anonId.value || !active)
    return
  if (typeof document !== 'undefined' && document.visibilityState === 'hidden')
    return
  const data = await pingSession({
    pagePath: active,
    anonId: anonId.value,
    countVisit,
  })
  if (data)
    stats.apply(data)
}

async function leave(path = active) {
  if (!configured.value || !anonId.value || !path)
    return
  const data = await leaveSession({
    pagePath: path,
    anonId: anonId.value,
  })
  if (data)
    stats.apply(data)
}

function stop() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

function start() {
  stop()
  timer = setInterval(() => {
    void ping(false)
  }, HEARTBEAT_MS)
}

async function enter(path: string) {
  if (active && active !== path)
    await leave(active)
  active = path
  await ping(false)
  start()
}

async function maybeCountVisit() {
  const path = active
  if (!path || counted.has(path) || path === '/')
    return
  const doc = document.documentElement
  const span = doc.scrollHeight - window.innerHeight
  const ratio = span <= 0 ? 1 : window.scrollY / span
  if (ratio < VISIT_THRESHOLD)
    return
  counted.add(path)
  await ping(true)
}

function onVis() {
  if (document.visibilityState === 'visible')
    void ping(false)
  else
    void leave()
}

function onHide() {
  void leave()
}

onMounted(() => {
  void stats.refresh(pagePath.value)
  void enter(pagePath.value)
  window.addEventListener('scroll', maybeCountVisit, { passive: true })
  document.addEventListener('visibilitychange', onVis)
  window.addEventListener('pagehide', onHide)
})

watch(pagePath, (path) => {
  void enter(path)
})

onBeforeUnmount(() => {
  stop()
  window.removeEventListener('scroll', maybeCountVisit)
  document.removeEventListener('visibilitychange', onVis)
  window.removeEventListener('pagehide', onHide)
  void leave()
  active = ''
})
</script>

<template>
  <span hidden />
</template>
