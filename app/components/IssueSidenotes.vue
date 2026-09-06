<script setup lang="ts">
import { mqMin } from '~/utils/breakpoints'

interface Sidenote {
  id: string
  n: string
  html: string
  top: number
}

const GAP = 12
const notes = ref<Sidenote[]>([])
const rootRef = ref<HTMLElement | null>(null)
const route = useRoute()
const flashId = ref<string | null>(null)

let flashTimer: ReturnType<typeof setTimeout> | undefined

let resizeObserver: ResizeObserver | undefined
let mutationObserver: MutationObserver | undefined
let raf = 0

function stripBackrefs(li: HTMLElement) {
  const clone = li.cloneNode(true) as HTMLElement
  clone.querySelectorAll('a.data-footnote-backref, [data-footnote-backref]').forEach((el) => {
    el.remove()
  })
  return clone.innerHTML
}

function measureHeight(html: string, rail: HTMLElement, width: number) {
  const probe = document.createElement('div')
  probe.setAttribute('aria-hidden', 'true')
  probe.style.cssText = [
    'position:absolute',
    'visibility:hidden',
    'pointer-events:none',
    'font:inherit',
    'left:0',
    `width:${Math.max(width, 0)}px`,
  ].join(';')
  probe.innerHTML = html
  const parent = rail.parentElement ?? rail
  parent.appendChild(probe)
  const height = probe.getBoundingClientRect().height
  probe.remove()
  return height
}

function flash(id: string) {
  flashId.value = id
  if (flashTimer)
    clearTimeout(flashTimer)
  flashTimer = setTimeout(() => {
    flashId.value = null
    flashTimer = undefined
  }, 1000)
}

function onRefClick(ev: Event) {
  if (!window.matchMedia(mqMin('lg')).matches)
    return
  const target = ev.target
  if (!(target instanceof Element))
    return
  const anchor = target.closest('a[href^="#user-content-fn-"]')
  if (!anchor?.closest('sup'))
    return
  ev.preventDefault()
  ev.stopImmediatePropagation()
  const href = anchor.getAttribute('href')
  if (!href || href.length < 2)
    return
  flash(decodeURIComponent(href.slice(1)))
}

function collect() {
  const host = rootRef.value
  if (!host || !window.matchMedia(mqMin('lg')).matches) {
    notes.value = []
    return
  }

  const article = host.closest('.issue-read')
  const prose = article?.querySelector<HTMLElement>('.issue-read__prose')
  const rail = article?.querySelector<HTMLElement>('.issue-read__rail')
  if (!article || !prose || !rail) {
    notes.value = []
    return
  }

  const railTop = rail.getBoundingClientRect().top
  const width = rail.clientWidth
  const seen = new Set<string>()
  const pending: { id: string, n: string, html: string, desired: number }[] = []

  const refs = prose.querySelectorAll<HTMLAnchorElement>('sup a[href^="#user-content-fn-"]')
  for (const anchor of refs) {
    const href = anchor.getAttribute('href')
    if (!href || href.length < 2)
      continue
    const id = decodeURIComponent(href.slice(1))
    if (seen.has(id))
      continue
    seen.add(id)
    const li = prose.querySelector<HTMLElement>(`section.footnotes li#${CSS.escape(id)}`)
    if (!li)
      continue
    pending.push({
      id,
      n: anchor.textContent?.trim() ?? '',
      html: stripBackrefs(li),
      desired: anchor.getBoundingClientRect().top - railTop,
    })
  }

  pending.sort((a, b) => a.desired - b.desired)

  let prevBottom = -GAP
  notes.value = pending.map((item) => {
    const height = measureHeight(item.html, rail, width)
    const top = Math.max(item.desired, prevBottom + GAP)
    prevBottom = top + height
    return {
      id: item.id,
      n: item.n,
      html: item.html,
      top,
    }
  })
}

function scheduleCollect() {
  if (raf)
    cancelAnimationFrame(raf)
  nextTick(() => {
    raf = requestAnimationFrame(() => {
      raf = 0
      collect()
    })
  })
}

function bindObservers() {
  resizeObserver?.disconnect()
  mutationObserver?.disconnect()

  const article = rootRef.value?.closest('.issue-read')
  const prose = article?.querySelector<HTMLElement>('.issue-read__prose')
  const rail = article?.querySelector<HTMLElement>('.issue-read__rail')
  if (!prose || !rail)
    return

  resizeObserver = new ResizeObserver(() => scheduleCollect())
  resizeObserver.observe(prose)

  mutationObserver = new MutationObserver(() => scheduleCollect())
  mutationObserver.observe(prose, {
    childList: true,
    subtree: true,
    characterData: true,
  })

  prose.removeEventListener('click', onRefClick, true)
  prose.addEventListener('click', onRefClick, true)
}

onMounted(() => {
  bindObservers()
  window.addEventListener('resize', scheduleCollect)
  scheduleCollect()
  requestAnimationFrame(() => scheduleCollect())
})

watch(() => route.fullPath, () => {
  const article = rootRef.value?.closest('.issue-read')
  const prose = article?.querySelector<HTMLElement>('.issue-read__prose')
  prose?.removeEventListener('click', onRefClick, true)
  scheduleCollect()
  nextTick(() => bindObservers())
})

onUnmounted(() => {
  if (flashTimer)
    clearTimeout(flashTimer)
  if (raf)
    cancelAnimationFrame(raf)
  resizeObserver?.disconnect()
  mutationObserver?.disconnect()
  const article = rootRef.value?.closest('.issue-read')
  const prose = article?.querySelector<HTMLElement>('.issue-read__prose')
  prose?.removeEventListener('click', onRefClick, true)
  window.removeEventListener('resize', scheduleCollect)
})
</script>

<template>
  <div
    ref="rootRef"
    class="issue-sidenotes"
    un-max-lg:hidden
    aria-hidden="true"
  >
    <div
      v-for="note in notes"
      :key="note.id"
      class="issue-sidenote"
      :class="{ 'is-flash': note.id === flashId }"
      un-flex
      un-items-start
      un-gap-1
      :style="{ top: `${note.top}px` }"
    >
      <sup
        un-font-mono
        un-not-italic
        un-text="[0.75em]"
        un-leading-none
        un-shrink-0
      >{{ note.n }}</sup>
      <div
        class="issue-sidenote__body"
        un-min-w-0
        un-flex-1
        v-html="note.html"
      />
    </div>
  </div>
</template>

<style scoped>
.issue-sidenote {
  position: absolute;
  left: 0;
  right: 0;
  color: var(--muted);
  transition: color 180ms ease;
}

.issue-sidenote.is-flash,
.issue-sidenote.is-flash :deep(.katex) {
  color: var(--ink);
}

.issue-sidenote__body :deep(p) {
  margin: 0;
}

.issue-sidenote__body :deep(a.data-footnote-backref),
.issue-sidenote__body :deep([data-footnote-backref]) {
  display: none;
}
</style>
