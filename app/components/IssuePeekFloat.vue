<script setup lang="ts">
const peek = useHubPeek()
const entry = computed(() => peek?.value ?? null)
const overlayRef = ref<HTMLElement | null>(null)
const opener = shallowRef<HTMLElement | null>(null)
const scrollOrigin = shallowRef(0)

const wide = useMin('lg')

function dismiss() {
  if (peek)
    peek.value = null
}

function focusCta() {
  const node = overlayRef.value?.querySelector<HTMLElement>('[data-issue-peek-cta]')
  node?.focus()
}

function restoreFocus() {
  opener.value?.focus()
  opener.value = null
}

function isWide() {
  return wide.value
}

function eventInSheet(target: EventTarget | null) {
  const sheet = overlayRef.value?.querySelector('.issue-peek-sheet')
  return !!(sheet && target instanceof Node && sheet.contains(target))
}

function onKeydown(event: KeyboardEvent) {
  if (!entry.value || isWide())
    return
  if (event.key === 'Escape') {
    event.preventDefault()
    dismiss()
    return
  }
  if (event.key !== 'Tab' || !overlayRef.value)
    return
  const nodes = [...overlayRef.value.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled])',
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

function onScroll() {
  if (!entry.value || isWide())
    return
  if (Math.abs(window.scrollY - scrollOrigin.value) < 1)
    return
  dismiss()
}

function onPointerDown(event: PointerEvent) {
  if (!entry.value || isWide())
    return
  if (eventInSheet(event.target))
    return
  dismiss()
}

function bindDismissors(active: boolean) {
  if (active) {
    scrollOrigin.value = window.scrollY
    window.addEventListener('scroll', onScroll, { passive: true })
    document.addEventListener('pointerdown', onPointerDown, true)
    return
  }
  window.removeEventListener('scroll', onScroll)
  document.removeEventListener('pointerdown', onPointerDown, true)
}

watch(entry, async (next, prev) => {
  if (!import.meta.client)
    return
  if (isWide()) {
    bindDismissors(false)
    return
  }
  if (next && !prev) {
    const active = document.activeElement
    opener.value = active instanceof HTMLElement ? active : null
    bindDismissors(true)
    await nextTick()
    focusCta()
  }
  else if (!next && prev) {
    bindDismissors(false)
    restoreFocus()
  }
})

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  bindDismissors(false)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="issue-peek">
      <div
        v-if="entry"
        ref="overlayRef"
        un-fixed
        un-inset-0
        un-z-50
        un-flex
        un-flex-col
        un-justify-end
        un-pointer-events-none
        un-px="[var(--gutter)]"
        un-lg:hidden
      >
        <div
          class="issue-peek-scrim"
          un-absolute
          un-inset-0
          un-pointer-events-none
          aria-hidden="true"
        />
        <IssuePeekCard
          dialog
          :entry="entry"
          un-relative
          un-z-1
          un-pointer-events-auto
          un-mb="[max(1rem,env(safe-area-inset-bottom))]"
          un-max-h="[min(78dvh,36rem)]"
          @dismiss="dismiss"
        />
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.issue-peek-scrim {
  background: color-mix(in srgb, var(--ink) 42%, transparent);
  -webkit-backdrop-filter: blur(10px) saturate(0.72) brightness(0.88);
  backdrop-filter: blur(10px) saturate(0.72) brightness(0.88);
}

.issue-peek-enter-active,
.issue-peek-leave-active {
  transition: opacity 0.28s var(--ease-out);
}

.issue-peek-enter-active .issue-peek-scrim,
.issue-peek-leave-active .issue-peek-scrim {
  transition: opacity 0.28s var(--ease-out);
}

.issue-peek-enter-from,
.issue-peek-leave-to {
  opacity: 0;
}

.issue-peek-enter-active .issue-peek-sheet,
.issue-peek-leave-active .issue-peek-sheet {
  transition:
    -webkit-mask-size 0.42s var(--ease-out),
    mask-size 0.42s var(--ease-out),
    opacity 0.32s var(--ease-out),
    transform 0.42s var(--ease-out);
}

.issue-peek-enter-to .issue-peek-sheet,
.issue-peek-leave-from .issue-peek-sheet {
  opacity: 1;
  transform: translateY(0);
  -webkit-mask-image: linear-gradient(to top, #000, #000);
  mask-image: linear-gradient(to top, #000, #000);
  -webkit-mask-size: 100% 100%;
  mask-size: 100% 100%;
  -webkit-mask-position: bottom;
  mask-position: bottom;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
}

.issue-peek-enter-from .issue-peek-sheet {
  opacity: 0;
  transform: translateY(1.25rem);
  -webkit-mask-image: linear-gradient(
    to top,
    #000 0%,
    #000 55%,
    transparent 100%
  );
  mask-image: linear-gradient(
    to top,
    #000 0%,
    #000 55%,
    transparent 100%
  );
  -webkit-mask-size: 100% 0%;
  mask-size: 100% 0%;
  -webkit-mask-position: bottom;
  mask-position: bottom;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
}

.issue-peek-leave-to .issue-peek-sheet {
  opacity: 0;
  transform: translateY(1.5rem);
  -webkit-mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    #000 45%,
    #000 100%
  );
  mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    #000 45%,
    #000 100%
  );
  -webkit-mask-size: 100% 0%;
  mask-size: 100% 0%;
  -webkit-mask-position: bottom;
  mask-position: bottom;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
}

@media (prefers-reduced-transparency: reduce) {
  .issue-peek-scrim {
    background: color-mix(in srgb, var(--ink) 55%, var(--paper));
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .issue-peek-enter-active,
  .issue-peek-leave-active,
  .issue-peek-enter-active .issue-peek-sheet,
  .issue-peek-leave-active .issue-peek-sheet,
  .issue-peek-enter-active .issue-peek-scrim,
  .issue-peek-leave-active .issue-peek-scrim {
    transition: opacity 0.12s linear;
  }

  .issue-peek-enter-from .issue-peek-sheet,
  .issue-peek-leave-to .issue-peek-sheet {
    transform: none;
    -webkit-mask-image: none;
    mask-image: none;
    -webkit-mask-size: auto;
    mask-size: auto;
  }
}
</style>
