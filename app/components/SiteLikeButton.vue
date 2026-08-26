<script setup lang="ts">
import { inkHeartPath } from '~/utils/inkDraw'
import { formatCompact } from '~/utils/formatStats'

const props = withDefaults(defineProps<{
  pagePath?: string
  people?: boolean
}>(), {
  people: false,
})

const { like, configured } = useFroqApi()
const anonId = useAnonId()
const stats = useSiteStats()
const local = ref<number | null>(null)
const busy = ref(false)

function normalize(path: string) {
  if (!path || path === '/')
    return '/'
  return path.replace(/\/$/, '') || '/'
}

const count = computed(() => {
  if (local.value != null)
    return local.value
  if (!props.pagePath)
    return stats.siteLikes.value
  const target = normalize(props.pagePath)
  const row = stats.pageLikes.value.find(item => normalize(item.pagePath) === target)
  return row?.likes ?? (stats.loaded.value ? 0 : null)
})

const label = computed(() => {
  if (props.people) {
    if (count.value == null)
      return 'like this page'
    if (count.value === 1)
      return '1 like'
    return `${formatCompact(count.value)} likes`
  }
  if (count.value == null)
    return 'like'
  return formatCompact(count.value)
})

const seed = computed(() => props.pagePath || 'site')
const heart = computed(() => inkHeartPath(seed.value))

async function onLike() {
  if (busy.value || !configured.value || !anonId.value)
    return
  busy.value = true
  try {
    const result = await like(anonId.value, props.pagePath)
    if (result && typeof result.likes === 'number') {
      local.value = result.likes
      if (typeof result.siteLikes === 'number')
        stats.siteLikes.value = result.siteLikes
    }
  }
  finally {
    busy.value = false
  }
}
</script>

<template>
  <button
    v-if="configured"
    type="button"
    class="site-like"
    un-m-0
    un-inline-flex
    un-cursor-pointer
    un-items-center
    un-gap-1.5
    un-border-0
    un-bg-transparent
    un-p-0
    un-font-mono
    un-text="11px muted hover:colored-ink"
    un-leading-none
    :disabled="busy"
    :aria-label="people ? 'Like this page' : 'Like this site'"
    @click="onLike"
  >
    <svg
      viewBox="0 0 18 18"
      aria-hidden="true"
      un-block
      un-h="[1.05em]"
      un-w="[1.05em]"
      un-overflow-visible
    >
      <path
        :d="heart"
        fill="none"
        stroke="currentColor"
        stroke-width="1.35"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
    <span>{{ label }}</span>
  </button>
</template>
