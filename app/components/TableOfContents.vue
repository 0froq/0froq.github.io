<script setup lang="ts">
interface TocItem {
  id: string
  text: string
  level: number
  el: HTMLElement
}

const LABEL_MAX = 200

const items = ref<TocItem[]>([])
const activeId = ref('')
const marqueeId = ref('')
const marqueeDist = ref(0)
const marqueeDuration = ref(0)
const route = useRoute()

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

function go(item: TocItem) {
  activeId.value = item.id
  item.el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function getLabelText(ev: MouseEvent) {
  const li = (ev.currentTarget as HTMLElement).closest('li')
  return li?.querySelector<HTMLElement>('.issue-toc-label-text')
}

function onItemEnter(item: TocItem, ev: MouseEvent) {
  const text = getLabelText(ev)
  const label = text?.parentElement
  if (!text || !label)
    return
  text.style.transition = ''
  text.style.transform = ''
  const overflow = label.scrollWidth - LABEL_MAX
  if (overflow <= 0)
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

onMounted(() => {
  nextTick(collect)
  window.addEventListener('scroll', onScrollFallback, { passive: true })
})

onUnmounted(() => {
  observer?.disconnect()
  window.removeEventListener('scroll', onScrollFallback)
})

watch(() => route.path, () => nextTick(collect))
</script>

<template>
  <nav
    v-if="items.length > 1"
    class="group/toc"
    un-hidden
    un-fixed
    un-left-6
    un-top="1/3"
    un-z-30
    un-font-serif
    un-lg:block
    un-max-h="lg:[calc(100vh-33.3333vh-2rem)]"
    un-overflow-y="lg:auto"
    un-lg="[scrollbar-width:none]"
    aria-label="Table of contents"
  >
    <ul
      un-list-none
      un-m-0
      un-p-0
      un-flex="~ col"
      un-gap-2
      un-items-start
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
            un-w="4 group-data-[active]/item:6 group-hover/toc:2.5 group-focus-within/toc:2.5 group-hover/toc:group-data-[active]/item:2.5 group-focus-within/toc:group-data-[active]/item:2.5"
            un-ml="[var(--toc-indent,0px)]"
            un-rounded-full
            un-bg="muted group-data-[active]/item:colored-ink group-hover/toc:[color-mix(in_srgb,var(--muted)_80%,transparent)] group-focus-within/toc:[color-mix(in_srgb,var(--muted)_80%,transparent)] group-hover/toc:group-data-[active]/item:colored-ink group-focus-within/toc:group-data-[active]/item:colored-ink"
            un-transition-all
            un-duration-300
            un-shrink-0
          />
          <span
            un-max-w="0 group-hover/toc:[200px] group-focus-within/toc:[200px]"
            un-opacity="0 group-hover/toc:100 group-focus-within/toc:100"
            un-translate-x="-1 group-hover/toc:0 group-focus-within/toc:0"
            un-text="base muted group-hover/btn:ink group-hover/toc:group-data-[active]/item:ink group-focus-within/toc:group-data-[active]/item:ink"
            un-font="group-hover/toc:group-data-[active]/item:medium group-focus-within/toc:group-data-[active]/item:medium"
            un-whitespace-nowrap
            un-overflow-hidden
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
</template>

<style scoped>
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
</style>
