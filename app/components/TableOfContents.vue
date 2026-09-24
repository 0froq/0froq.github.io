<script setup lang="ts">
import { useMouseInElement } from '@vueuse/core'

interface TocItem {
  id: string
  text: string
  level: number
  el: HTMLElement
}

const items = ref<TocItem[]>([])
const activeId = ref('')
const marqueeId = ref('')
const marqueeDist = ref(0)
const marqueeDuration = ref(0)
const open = ref(false)
const openerRef = ref<HTMLButtonElement | null>(null)
const navRef = ref<HTMLElement | null>(null)
const { isOutside } = useMouseInElement(navRef)
const route = useRoute()
const wide = useMin('lg')
const listed = useMin('sm')
const compact = ref(false)

let observer: IntersectionObserver | undefined

function collect() {
  observer?.disconnect()
  const root = document.querySelector<HTMLElement>('.issue-read__prose')
  if (!root) {
    items.value = []
    return
  }
  const headings = Array.from(
    root.querySelectorAll<HTMLElement>('h2, h3, h4'),
  ).filter(el => el.id && el.textContent?.trim())

  items.value = headings.map(el => ({
    id: el.id,
    text: el.textContent?.trim() ?? '',
    level: Number(el.tagName.slice(1)),
    el,
  }))

  const visible = new Set<string>()
  observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting)
        visible.add(entry.target.id)
      else
        visible.delete(entry.target.id)
    }
    const first = items.value.find(i => visible.has(i.id))
    if (first)
      activeId.value = first.id
  }, { rootMargin: '-64px 0px -70% 0px' })
  headings.forEach(el => observer!.observe(el))
}

function onScrollFallback() {
  if (items.value.length && !activeId.value)
    activeId.value = items.value[0]!.id
}

function hideFloat() {
  open.value = false
  openerRef.value?.focus()
}

function go(item: TocItem) {
  activeId.value = item.id
  item.el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  if (!wide.value)
    hideFloat()
}

async function showFloat() {
  if (wide.value)
    return
  open.value = true
  await nextTick()
  navRef.value?.querySelector<HTMLElement>('ul button')?.focus()
}

function getLabelText(ev: MouseEvent) {
  const li = (ev.currentTarget as HTMLElement).closest('li')
  return li?.querySelector<HTMLElement>('.issue-toc-label-text')
}

function onItemEnter(item: TocItem, ev: MouseEvent) {
  if (!(wide.value || open.value))
    return
  const text = getLabelText(ev)
  const label = text?.parentElement
  if (!text || !label)
    return
  text.style.transition = ''
  text.style.transform = ''
  const overflow = text.scrollWidth - label.clientWidth
  if (!(overflow > 0))
    return
  marqueeId.value = item.id
  marqueeDist.value = overflow + 8
  marqueeDuration.value = Math.max(1.6, overflow / 40)
}

function onItemLeave(item: TocItem, ev: MouseEvent) {
  const text = getLabelText(ev)
  if (text && item.id === marqueeId.value) {
    const current = getComputedStyle(text).transform
    text.style.transition = 'none'
    text.style.transform = current === 'none' ? 'translateX(0)' : current
    void text.offsetWidth
    text.style.transition = 'transform .35s ease'
    text.style.transform = 'translateX(0)'
    window.setTimeout(() => {
      text.style.transition = ''
      text.style.transform = ''
    }, 400)
  }
  marqueeId.value = ''
}

function eventInNav(target: EventTarget | null) {
  return !!(navRef.value && target instanceof Node && navRef.value.contains(target))
}

function onKeydown(event: KeyboardEvent) {
  if (!open.value || wide.value)
    return
  if (event.key === 'Escape') {
    event.preventDefault()
    hideFloat()
    return
  }
  if (event.key !== 'Tab' || !navRef.value)
    return
  const nodes = [...navRef.value.querySelectorAll<HTMLElement>(
    'ul button:not([disabled])',
  )]
  const first = nodes[0]
  const last = nodes.at(-1)
  if (!first || !last)
    return
  const active = document.activeElement
  if (event.shiftKey && active === first) {
    event.preventDefault()
    last.focus()
  }
  else if (!event.shiftKey && active === last) {
    event.preventDefault()
    first.focus()
  }
}

function wheelScale(event: WheelEvent) {
  if (event.deltaMode === 1)
    return 16
  if (event.deltaMode === 2)
    return window.innerHeight
  return 1
}

function onWheel(event: WheelEvent) {
  if (!open.value || wide.value || event.ctrlKey)
    return
  const scale = wheelScale(event)
  const nav = navRef.value
  if (!isOutside.value && nav) {
    event.preventDefault()
    const max = Math.max(0, nav.scrollHeight - nav.clientHeight)
    nav.scrollTop = Math.min(max, Math.max(0, nav.scrollTop + event.deltaY * scale))
    return
  }
  if (!isOutside.value)
    return
  event.preventDefault()
  hideFloat()
  const root = document.scrollingElement
  if (!root)
    return
  root.scrollTop += event.deltaY * scale
  root.scrollLeft += event.deltaX * scale
}

function onPointerDown(event: PointerEvent) {
  if (!open.value || wide.value)
    return
  if (eventInNav(event.target))
    return
  hideFloat()
}

function bindWheel(on: boolean) {
  window.removeEventListener('wheel', onWheel, { capture: true })
  if (on)
    window.addEventListener('wheel', onWheel, { passive: false, capture: true })
}

watch(open, isOpen => bindWheel(isOpen && !wide.value))

watch([wide, listed], () => {
  compact.value = !wide.value
  if (wide.value || !listed.value)
    open.value = false
})

onMounted(() => {
  compact.value = !wide.value
  nextTick(collect)
  window.addEventListener('scroll', onScrollFallback, { passive: true })
  window.addEventListener('keydown', onKeydown)
  document.addEventListener('pointerdown', onPointerDown, true)
})

onUnmounted(() => {
  observer?.disconnect()
  window.removeEventListener('scroll', onScrollFallback)
  window.removeEventListener('keydown', onKeydown)
  document.removeEventListener('pointerdown', onPointerDown, true)
  bindWheel(false)
})

watch(() => route.path, () => {
  open.value = false
  nextTick(collect)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="issue-toc">
      <div
        v-if="open && !wide"
        class="issue-toc-scrim"
        un-fixed
        un-inset-0
        un-z-40
        aria-hidden="true"
      />
    </Transition>
    <nav
      v-if="items.length > 1"
      id="issue-toc"
      ref="navRef"
      class="group/toc data-[open]:p-5 data-[open]:overscroll-contain data-[open]:border-b data-[open]:border-muted data-[open]:bg-float data-[open]:shadow-[0_0_12px_2px_var(--float-shadow),0_8px_20px_var(--float-shadow)] data-[open]:z-50 data-[open]:backdrop-blur-sm"
      :data-open="open ? '' : undefined"
      un-hidden
      un-fixed
      un-left-4
      un-top="1/3"
      :class="open ? 'z-50' : 'z-30'"
      un-font-serif
      un-sm:block
      un-max-h="lg:[calc(100vh-33.3333vh-2rem)] data-[open]:[min(70dvh,28rem)]"
      un-overflow-y="lg:auto data-[open]:auto"
      un-lg="[scrollbar-width:none]"
      un-py-3
      un-pr-5
      aria-label="Table of contents"
    >
      <button
        ref="openerRef"
        type="button"
        class="reach-hit group-data-[open]/toc:hidden"
        un-absolute
        un-inset-0
        un-z-1
        un-lg:hidden
        un-bg-transparent
        un-border-none
        un-p-0
        un-cursor-pointer
        aria-haspopup="dialog"
        :aria-expanded="open"
        aria-controls="issue-toc"
        aria-label="Open table of contents"
        @click="showFloat"
      />
      <ul
        un-relative
        un-list-none
        un-m-0
        un-p-0
        un-flex="~ col"
        un-gap-2
        un-items-start
        :inert="compact && !open"
      >
        <li
          v-for="item in items"
          :key="item.id"
          class="group/item"
          :data-active="item.id === activeId ? '' : undefined"
          :data-marquee="item.id === marqueeId ? '' : undefined"
          :style="{
            '--toc-indent': `${(item.level - 2) * 10}px`,
            '--marquee-dist': `${marqueeDist}px`,
            '--marquee-duration': `${marqueeDuration}s`,
          }"
        >
          <button
            type="button"
            class="group/btn"
            un-bg-transparent
            un-border-none
            un-p-0
            un-cursor-pointer
            un-flex="~ row"
            un-items-center
            un-gap-2
            :aria-label="item.text"
            @click="go(item)"
            @mouseenter="onItemEnter(item, $event)"
            @mouseleave="onItemLeave(item, $event)"
          >
            <span
              un-block
              un-h="[2px]"
              un-w="4 group-data-[active]/item:6 group-hover/toc:2.5 group-focus-within/toc:2.5 group-hover/toc:group-data-[active]/item:2.5 group-focus-within/toc:group-data-[active]/item:2.5 group-data-[open]/toc:2.5 group-data-[open]/toc:group-data-[active]/item:2.5"
              un-ml="[var(--toc-indent,0px)]"
              un-rounded-full
              un-bg="muted group-data-[active]/item:colored-ink group-hover/toc:[color-mix(in_srgb,var(--muted)_80%,transparent)] group-focus-within/toc:[color-mix(in_srgb,var(--muted)_80%,transparent)] group-hover/toc:group-data-[active]/item:colored-ink group-focus-within/toc:group-data-[active]/item:colored-ink group-data-[open]/toc:[color-mix(in_srgb,var(--muted)_80%,transparent)] group-data-[open]/toc:group-data-[active]/item:colored-ink"
              un-transition-all
              un-duration-300
              un-shrink-0
            />
            <span
              class="issue-toc-label opacity-0 max-w-0 group-data-[open]/toc:opacity-100 group-data-[open]/toc:max-w-[min(20rem,calc(100vw-3rem))] -translate-x-1 group-data-[open]/toc:translate-x-0 lg:group-focus-within/toc:bg-paper lg:group-hover/toc:bg-paper lg:group-data-[active]/item:opacity-100 lg:group-focus-within/toc:opacity-100 lg:group-hover/toc:opacity-100 lg:group-data-[active]/item:max-w-[max(0px,calc(var(--toc-label)-var(--toc-indent)))] lg:group-focus-within/toc:max-w-[max(0px,calc(var(--toc-label)-var(--toc-indent)))] lg:group-hover/toc:max-w-[max(0px,calc(var(--toc-label)-var(--toc-indent)))] lg:group-data-[active]/item:translate-x-0 lg:group-focus-within/toc:translate-x-0 lg:group-hover/toc:translate-x-0"
              un-whitespace-nowrap
              un-overflow-hidden
              un-text="base muted group-hover/btn:ink group-hover/toc:group-data-[active]/item:ink group-focus-within/toc:group-data-[active]/item:ink group-data-[open]/toc:group-data-[active]/item:ink"
              un-font="group-hover/toc:group-data-[active]/item:medium group-focus-within/toc:group-data-[active]/item:medium group-data-[open]/toc:group-data-[active]/item:medium"
              un-transition-all
              un-duration-300
            >
              <span
                class="issue-toc-label-text"
                un-inline-block
              >{{ item.text }}</span>
            </span>
          </button>
        </li>
      </ul>
    </nav>
  </Teleport>
</template>

<style scoped>
nav {
  /* prose left edge, then nav's left-4. Tick width flips on hover so the text's right edge stays put. */
  --toc-edge: calc(var(--gutter) + (100vw - 2 * var(--gutter) - min(var(--read-stage), 100vw - 4 * var(--gutter))) / 2);
  --toc-room: calc(var(--toc-edge) - 1rem);
  --toc-tick: 1.5rem;
  --toc-label: max(0px, calc(var(--toc-room) - var(--toc-tick) - 1rem));
}

nav:hover,
nav:focus-within {
  --toc-tick: 0.625rem;
}

nav::-webkit-scrollbar {
  display: none;
}

[data-marquee] .issue-toc-label-text {
  animation: toc-marquee var(--marquee-duration, 3s) ease-in-out infinite alternate;
}

@keyframes toc-marquee {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(calc(-1 * var(--marquee-dist, 0px)));
  }
}

.issue-toc-scrim {
  background: color-mix(in srgb, var(--ink) 42%, transparent);
  -webkit-backdrop-filter: blur(10px) saturate(0.72) brightness(0.88);
  backdrop-filter: blur(10px) saturate(0.72) brightness(0.88);
}

.issue-toc-enter-active,
.issue-toc-leave-active {
  transition: opacity 0.28s var(--ease-out);
}

.issue-toc-enter-from,
.issue-toc-leave-to {
  opacity: 0;
}

@media (prefers-reduced-transparency: reduce) {
  .issue-toc-scrim {
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
    background: color-mix(in srgb, var(--ink) 62%, var(--paper));
  }
}
</style>
