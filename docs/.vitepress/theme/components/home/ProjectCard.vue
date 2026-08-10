<script setup lang="ts">
import { computed } from 'vue'
import { useRepoMeta } from '~/composables/home/useRepoMeta'

const props = defineProps<{
  name: string
  repo: string
}>()

const { meta, loading } = useRepoMeta(props.repo)

const desc = computed(() => meta.value?.description ?? '')
const stars = computed(() => {
  const n = meta.value?.stars
  if (n === null || n === undefined)
    return ''
  if (n < 1000)
    return String(n)
  return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`
})
</script>

<template>
  <a
    :href="`https://github.com/${repo}`"
    target="_blank"
    rel="noopener noreferrer"
    un-group
    un-flex="~ col"
    un-h-full
    un-rounded-lg
    un-border="~ neutral-200 dark:neutral-800"
    un-p-4
    un-bg="white dark:neutral-900/40"
    un-no-underline
    un-transition="colors duration-200"
    un-hover="border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900"
  >
    <div un-flex un-items-baseline un-justify-between un-gap-3>
      <span
        un-text="base neutral-800 dark:neutral-200"
        un-font="serif medium"
        un-truncate
        class="group-hover:underline"
        un-decoration="neutral-400/60 underline-offset-4"
      >
        {{ name }}
      </span>
      <span
        v-if="!loading && stars !== ''"
        un-flex
        un-items-center
        un-gap-1
        un-shrink-0
        un-text="xs amber-600 dark:amber-500"
        un-font-mono
        :title="`${meta?.stars} stars`"
      >
        ★ {{ stars }}
      </span>
    </div>
    <p
      v-if="desc"
      un-m-0
      un-mt-2
      un-text="sm neutral-500 dark:neutral-400"
      un-line-clamp-2
      un-leading-relaxed
    >
      {{ desc }}
    </p>
  </a>
</template>
