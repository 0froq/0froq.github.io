<script setup lang="ts">
import type { Scrap, ScrapReactionState } from '~/utils/scraps'

const props = defineProps<{
  scraps: Scrap[]
  reactions: Record<string, ScrapReactionState>
}>()

const emit = defineEmits<{
  react: [id: string, emoji: string]
}>()

const menu = shallowRef<{ id: string, x: number, y: number } | null>(null)
const menuEl = ref<HTMLElement | null>(null)
const menuScrap = computed(() => {
  const id = menu.value?.id
  if (!id)
    return null
  return props.scraps.find(scrap => scrap.id === id) ?? null
})

const pinned = computed(() => props.scraps.filter(scrap => scrap.pinned))
const rest = computed(() => props.scraps.filter(scrap => !scrap.pinned))

function hasDetail(scrap: Scrap) {
  return Boolean(scrap.detail)
}

function closeMenu() {
  menu.value = null
}

function clampMenu() {
  const el = menuEl.value
  if (!el || !menu.value)
    return
  const rect = el.getBoundingClientRect()
  const pad = 8
  let x = menu.value.x
  let y = menu.value.y
  if (x + rect.width > window.innerWidth - pad)
    x = window.innerWidth - pad - rect.width
  if (y + rect.height > window.innerHeight - pad)
    y = window.innerHeight - pad - rect.height
  menu.value = {
    id: menu.value.id,
    x: Math.max(pad, x),
    y: Math.max(pad, y),
  }
}

async function openMenu(event: MouseEvent, id: string) {
  event.preventDefault()
  menu.value = { id, x: event.clientX, y: event.clientY }
  await nextTick()
  clampMenu()
}

function onMenuReact(emoji: string) {
  const id = menu.value?.id
  if (!id)
    return
  emit('react', id, emoji)
  closeMenu()
}

function onChipReact(id: string, emoji: string) {
  emit('react', id, emoji)
}

function onPointerDown(event: PointerEvent) {
  const el = menuEl.value
  if (!el || !(event.target instanceof Node) || el.contains(event.target))
    return
  closeMenu()
}

function onKey(event: KeyboardEvent) {
  if (event.key === 'Escape')
    closeMenu()
}

onMounted(() => {
  window.addEventListener('pointerdown', onPointerDown)
  window.addEventListener('keydown', onKey)
  window.addEventListener('scroll', closeMenu, true)
  window.addEventListener('resize', clampMenu)
})

onUnmounted(() => {
  window.removeEventListener('pointerdown', onPointerDown)
  window.removeEventListener('keydown', onKey)
  window.removeEventListener('scroll', closeMenu, true)
  window.removeEventListener('resize', clampMenu)
})
</script>

<template>
  <div
    un-flex
    un-flex-col
    un-gap-12
  >
    <ul
      v-if="pinned.length"
      un-m-0
      un-flex
      un-flex-col
      un-pl-6
      un-pr-0
      un-py-0
      un-list-none
      aria-label="Pinned scraps"
    >
      <li
        v-for="scrap in pinned"
        :key="scrap.id"
        un-py-2.5
        @contextmenu="openMenu($event, scrap.id)"
      >
        <div
          un-relative
          un-text="lg ink"
          un-leading-snug
          un-text-pretty
        >
          <span
            un-absolute
            un-left="[-1.5rem]"
            un-top="[0.3em]"
            un-inline-flex
            un-items-center
            un-justify-center
            un-leading-none
            un-text="colored-ink"
            aria-hidden="true"
          >
            <InkDots
              :seed="scrap.id"
              :count="1"
            />
          </span>
          <ScrapText :source="scrap.text" />
        </div>
        <p
          v-if="scrap.detail"
          un-m-0
          un-mt-2
          un-text="sm muted"
          un-leading-normal
          un-text-pretty
        >
          <ScrapText :source="scrap.detail ?? ''" />
        </p>
        <time
          v-if="scrap.date"
          un-mt-1
          un-block
          un-font-mono
          un-text="xs muted"
          un-tabular-nums
          :datetime="scrap.date"
        >{{ scrap.date }}</time>
        <ScrapReactInline
          un-mt-1.5
          :scrap="scrap"
          :reactions="reactions[scrap.id]"
          :picker="false"
          @react="onChipReact(scrap.id, $event)"
        />
      </li>
    </ul>

    <ul
      v-if="rest.length"
      un-m-0
      un-flex
      un-flex-col
      un-pl-6
      un-pr-0
      un-py-0
      un-list-none
      aria-label="More scraps"
    >
      <li
        v-for="scrap in rest"
        :key="scrap.id"
        un-py-2.5
        @contextmenu="openMenu($event, scrap.id)"
      >
        <InkFold
          v-if="hasDetail(scrap)"
          :seed="scrap.id"
          :label="scrap.text"
          :panel-id="`scrap-fold-${scrap.id}`"
          un-m-0
          un-font-inherit
          un-text="left lg ink"
          un-leading-snug
          un-text-pretty
        >
          <template #trigger>
            <ScrapText :source="scrap.text" />
          </template>
          <p
            un-m-0
            un-mt-2
            un-text="sm muted"
            un-leading-normal
            un-text-pretty
          >
            <ScrapText
              :source="scrap.detail ?? ''"
              stream
            />
          </p>
        </InkFold>
        <div
          v-else
          un-text="lg ink"
          un-leading-snug
          un-text-pretty
        >
          <ScrapText :source="scrap.text" />
        </div>
        <time
          v-if="scrap.date"
          un-mt-1
          un-block
          un-font-mono
          un-text="xs muted"
          un-tabular-nums
          :datetime="scrap.date"
        >{{ scrap.date }}</time>
        <ScrapReactInline
          un-mt-1.5
          :scrap="scrap"
          :reactions="reactions[scrap.id]"
          :picker="false"
          @react="onChipReact(scrap.id, $event)"
        />
      </li>
    </ul>
  </div>

  <Teleport to="body">
    <div
      v-if="menu"
      ref="menuEl"
      un-fixed
      un-z-50
      un-inline-flex
      role="menu"
      aria-label="Reply"
      :style="{ left: `${menu.x}px`, top: `${menu.y}px` }"
      @contextmenu.prevent
    >
      <InkFloat>
        <ScrapReactInline
          v-if="menuScrap"
          :scrap="menuScrap"
          :reactions="reactions[menuScrap.id]"
          @react="onMenuReact"
        />
      </InkFloat>
    </div>
  </Teleport>
</template>
