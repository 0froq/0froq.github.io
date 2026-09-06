<script setup lang="ts">
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

const isHidden = computed(() => {
  const nodes = slots.default?.() ?? []
  const trimmed = flattenSlotText(nodes).trim()
  return trimmed === '[[toc]]' || isIssueTagLine(trimmed)
})
</script>

<template>
  <p v-if="!isHidden">
    <slot />
  </p>
  <template v-else>
    <!-- -->
  </template>
</template>
