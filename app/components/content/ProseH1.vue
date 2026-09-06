<script setup lang="ts">
const props = defineProps<{ id?: string }>()
const slots = useSlots()

function flattenSlotText(nodes: unknown[]): string {
  let out = ''
  for (const node of nodes) {
    if (typeof node === 'string' || typeof node === 'number') {
      out += String(node)
      continue
    }
    if (!node || typeof node !== 'object')
      continue
    const children = (node as { children?: unknown }).children
    if (typeof children === 'string' || typeof children === 'number') {
      out += String(children)
      continue
    }
    if (Array.isArray(children))
      out += flattenSlotText(children)
  }
  return out
}

const isTagLine = computed(() => {
  const nodes = slots.default?.() ?? []
  return isIssueTagLine(flattenSlotText(nodes).trim())
})
</script>

<template>
  <h1 v-if="!isTagLine" :id="props.id">
    <slot />
  </h1>
  <template v-else>
    <!-- -->
  </template>
</template>
