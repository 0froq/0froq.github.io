<script setup lang="ts">
import { useEventListener } from '@vueuse/core'
import { useRoute } from 'vitepress'
import { nextTick, onMounted, ref, watch } from 'vue'

interface TocItem {
  id: string
  text: string
  /** 2–4，对应 h2–h4 */
  level: number
  el: HTMLElement
}

const LABEL_MAX = 200

const items = ref<TocItem[]>([])
const activeId = ref<string>('')
const marqueeId = ref<string>('')
const marqueeDist = ref(0)
const marqueeDuration = ref(0)
const route = useRoute()

let observer: IntersectionObserver | undefined

function collect() {
  observer?.disconnect()
  const root = document.getElementById('content')
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

/** 标题过长时，hover 该项触发横向滚动播放（marquee） */
function getLabelText(ev: MouseEvent) {
  const li = (ev.currentTarget as HTMLElement).closest('li')
  return li?.querySelector<HTMLElement>('.garden-toc-label-text')
}

function onItemEnter(item: TocItem, ev: MouseEvent) {
  const text = getLabelText(ev)
  const label = text?.parentElement
  if (!text || !label)
    return
  // 清掉上一次回位用的内联样式，避免干扰新动画
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
    // 定格在动画当前帧，再平滑滑回原位
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

onMounted(() => nextTick(collect))
watch(() => route.path, () => nextTick(collect))
if (typeof window !== 'undefined')
  useEventListener(window, 'scroll', onScrollFallback, { passive: true })
</script>

<template>
  <nav
    v-if="items.length > 1"
    class="garden-toc"
    un-fixed
    un-left-6
    un-top="1/3"
    un-z-30
    aria-label="Table of contents"
    un-font-serif
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
        class="garden-toc-item"
        :class="{ active: item.id === activeId, marquee: item.id === marqueeId }"
        :style="{
          '--toc-indent': `${(item.level - 2) * 10}px`,
          '--marquee-dist': `${marqueeDist}px`,
          '--marquee-duration': `${marqueeDuration}s`,
        }"
      >
        <button
          type="button"
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
          <span class="garden-toc-dash" />
          <span class="garden-toc-label">
            <span class="garden-toc-label-text">{{ item.text }}</span>
          </span>
        </button>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
/* 宽屏才显示；窄屏隐藏，避免与正文抢位 */
.garden-toc {
  display: none;
}
@media (min-width: 1280px) {
  .garden-toc {
    display: block;
    /* 高度不超过视口（垂直居中于 1/3 处，留出上下余量） */
    max-height: calc(100vh - 33.3333vh - 2rem);
    overflow-y: auto;
    scrollbar-width: none;
  }
  .garden-toc::-webkit-scrollbar {
    display: none;
  }
}

/* 静止态：只露一条短横线，缩进/长度随层级 */
.garden-toc-dash {
  --uno: 'block h-2px rounded-full bg-neutral-400/70 dark:bg-neutral-500/60 transition-all duration-300 shrink-0';
  width: 16px;
  margin-left: var(--toc-indent, 0px);
}
.garden-toc-item.active .garden-toc-dash {
  --uno: 'bg-neutral-700 dark:bg-neutral-300';
  width: 24px;
}

/* 标题文字默认收起：不占位、不显示 */
.garden-toc-label {
  --uno: 'text-xs text-neutral-500 dark:text-neutral-400 whitespace-nowrap overflow-hidden transition-all duration-300';
  max-width: 0;
  opacity: 0;
  transform: translateX(-4px);
}
.garden-toc-label-text {
  display: inline-block;
}

/* hover 整列时展开为标题列表 */
.garden-toc:hover .garden-toc-label,
.garden-toc:focus-within .garden-toc-label {
  max-width: 200px;
  opacity: 1;
  transform: translateX(0);
}
.garden-toc:hover .garden-toc-dash,
.garden-toc:focus-within .garden-toc-dash {
  --uno: 'bg-neutral-500/80 dark:bg-neutral-400/70';
  width: 10px;
}
.garden-toc:hover .garden-toc-item.active .garden-toc-dash {
  --uno: 'bg-neutral-800 dark:bg-neutral-200';
}
.garden-toc:hover .garden-toc-item.active .garden-toc-label {
  --uno: 'text-neutral-900 dark:text-neutral-100 font-medium';
}
.garden-toc-item button:hover .garden-toc-label {
  --uno: 'text-neutral-900 dark:text-neutral-100';
}

/* 长标题 hover：横向滚动播放 */
.garden-toc-item.marquee .garden-toc-label-text {
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
