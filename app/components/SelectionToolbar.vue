<script setup lang="ts">
const SKIP = 'input, textarea, select, [contenteditable]:not([contenteditable="false"])'

const shown = ref(false)
const copied = ref(false)
const x = ref(0)
const y = ref(0)
let copyTimer = 0

function hide() {
  shown.value = false
  copied.value = false
}

function sync(reveal: boolean) {
  const sel = window.getSelection()
  if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
    hide()
    return
  }
  const node = sel.anchorNode
  const host = node?.nodeType === Node.ELEMENT_NODE
    ? node as Element
    : node?.parentElement
  if (host?.closest(SKIP) || host?.closest('.selection-copy')) {
    hide()
    return
  }
  const text = (sel.toString() || '').trim()
  if (!text) {
    hide()
    return
  }
  const range = sel.getRangeAt(0)
  const rects = [...range.getClientRects()].filter(r => r.width > 1 && r.height > 1)
  const rect = rects[0] ?? range.getBoundingClientRect()
  if (rect.width < 2 && rect.height < 2) {
    hide()
    return
  }
  x.value = rect.left + Math.min(rect.width / 2, 72)
  y.value = Math.max(8, rect.top)
  if (reveal)
    shown.value = true
}

async function copy() {
  const text = (window.getSelection()?.toString() || '').trim()
  if (!text)
    return
  try {
    await navigator.clipboard.writeText(text)
  }
  catch {
    const hint = document.createElement('textarea')
    hint.value = text
    hint.setAttribute('readonly', '')
    hint.style.position = 'fixed'
    hint.style.left = '-9999px'
    document.body.appendChild(hint)
    hint.select()
    document.execCommand('copy')
    hint.remove()
  }
  copied.value = true
  window.clearTimeout(copyTimer)
  copyTimer = window.setTimeout(() => {
    copied.value = false
  }, 1400)
}

function onSelectionChange() {
  sync(false)
}

function onReveal() {
  sync(true)
}

function onScroll() {
  if (shown.value)
    sync(false)
}

onMounted(() => {
  document.addEventListener('selectionchange', onSelectionChange)
  document.addEventListener('mouseup', onReveal)
  document.addEventListener('keyup', onReveal)
  window.addEventListener('scroll', onScroll, true)
  window.addEventListener('resize', onScroll)
})

onUnmounted(() => {
  document.removeEventListener('selectionchange', onSelectionChange)
  document.removeEventListener('mouseup', onReveal)
  document.removeEventListener('keyup', onReveal)
  window.removeEventListener('scroll', onScroll, true)
  window.removeEventListener('resize', onScroll)
  window.clearTimeout(copyTimer)
})
</script>

<template>
  <Teleport to="body">
    <button
      v-if="shown"
      type="button"
      class="selection-copy"
      :data-on="copied ? '' : undefined"
      un-select-none
      un-fixed
      un-z-60
      un-m-0
      un-cursor-pointer
      un-border-0
      un-bg-transparent
      un-p-0
      :aria-label="copied ? 'Copied' : 'Copy'"
      :style="{
        left: `${x}px`,
        top: `${y}px`,
        transform: 'translate(-50%, calc(-100% - 0.28em))',
      }"
      @mousedown.prevent
      @click="copy"
    >
      <InkFloat>
        <InkClipboard
          seed="selection-copy"
          :done="copied"
        />
        <span
          un-font-mono
          un-text="sm"
          un-leading-none
        >
          {{ copied ? 'copied' : 'copy' }}
        </span>
      </InkFloat>
    </button>
  </Teleport>
</template>

<style scoped>
.selection-copy {
  color: var(--muted);
}

.selection-copy:hover,
.selection-copy:focus-visible {
  color: var(--ink);
}

.selection-copy[data-on] {
  color: var(--colored-ink);
}
</style>
