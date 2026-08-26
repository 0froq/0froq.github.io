<script setup lang="ts">
import { isExternalHref, isHttpExternalHref } from '~/utils/href'

const props = defineProps<{
  href?: string
  target?: '_blank' | '_parent' | '_self' | '_top' | (string & {}) | null
}>()

const origin = useRequestURL().origin
const href = computed(() => props.href ?? '')
const hashOnly = computed(() => href.value.startsWith('#'))
const inked = computed(() => Boolean(href.value) && !hashOnly.value)
const external = computed(() => isExternalHref(href.value, origin))
const httpExternal = computed(() => isHttpExternalHref(href.value, origin))
const target = computed(() => {
  if (props.target)
    return props.target
  if (httpExternal.value)
    return '_blank'
  return undefined
})
</script>

<template>
  <NuxtLink
    :href="href"
    :target="target"
    :rel="httpExternal ? 'noreferrer' : undefined"
    :external="httpExternal"
    :data-ink="inked ? 'underline' : undefined"
    :data-hover-ink="inked ? 'mark' : undefined"
    :data-external="external ? '' : undefined"
  >
    <slot />
  </NuxtLink>
</template>
