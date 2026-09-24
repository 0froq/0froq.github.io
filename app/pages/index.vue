<script setup lang="ts">
const { data: page } = await useAsyncData('home', () => {
  return queryCollection('home').first()
})

const heroEl = ref<HTMLElement | null>(null)
const heroH = shallowRef(0)
const mastEl = ref<HTMLElement | null>(null)
const mastH = shallowRef(44)
const stuck = shallowRef(false)
const scrolled = shallowRef(false)
let mastRo: ResizeObserver | undefined

function syncMast() {
  const el = mastEl.value
  if (!el)
    return
  heroH.value = heroEl.value?.offsetHeight ?? 0
  mastH.value = el.offsetHeight
  const top = el.getBoundingClientRect().top
  stuck.value = top <= 0.5
  scrolled.value = window.scrollY > 8
}

onMounted(() => {
  const el = mastEl.value
  if (el) {
    mastRo = new ResizeObserver(syncMast)
    mastRo.observe(el)
    if (heroEl.value)
      mastRo.observe(heroEl.value)
  }
  syncMast()
  window.addEventListener('scroll', syncMast, { passive: true })
  window.addEventListener('resize', syncMast)
})

onBeforeUnmount(() => {
  mastRo?.disconnect()
  window.removeEventListener('scroll', syncMast)
  window.removeEventListener('resize', syncMast)
})

const routes = publicationSections.map(section => ({
  to: `/${section.slug}`,
  label: section.label,
  note: section.note,
  ink: section.ink,
}))
</script>

<template>
  <div un-relative>
    <section
      ref="heroEl"
      un-sticky
      un-z-1
      un-box-border
      un-flex
      un-min-h-svh
      un-flex-col
      un-justify-start
      un-overflow-hidden
      un-bg-paper
      un-pt="[clamp(1.25rem,4vh,3rem)] max-md:10"
      :style="{
        top: `min(0px, calc(100svh - ${heroH}px))`,
        paddingBottom: `calc(${mastH}px + 0.75rem)`,
      }"
    >
      <div
        un-box-border
        un-mx-auto
        un-flex
        un-min-h-0
        un-w-full
        un-max-w-7xl
        un-flex-1
        un-flex-col
        un-items-stretch
        un-justify-start
        un-gap="[clamp(1.25rem,3.5vh,2.75rem)] max-md:6"
        un-pl="[clamp(1.5rem,8vw,7.5rem)] max-md:8"
        un-pr="[clamp(1.5rem,6vw,6rem)] max-md:8"
      >
        <h1
          un-m-0
          un-inline-flex
          un-text-logo
          un-leading-none
        >
          <span un-sr-only>froQ</span>
          <SvgFroqLogo
            animated
            width="clamp(80px, 14vw, 140px)"
            un-text="hover:colored-ink"
            un-transition-colors
            un-duration-200
            un-ease-out
            un-cursor-pointer
          />
        </h1>

        <div
          un-my-auto
          un-flex
          un-min-h="[50vh] max-md:0"
          un-w-full
          un-items-start
          un-justify-start
          un-gap="[clamp(2.5rem,5vw,5rem)] max-md:[clamp(2.75rem,9vh,5rem)]"
          un-max-md:flex-col
        >
          <article
            v-if="page"
            data-md-content
            un-prose="~"
            un-min-h-0
            un-min-w-0
            un-max-w="[36em]"
            un-flex-1
            un-overflow-x-clip
            un-text="lg"
            un-leading-relaxed
          >
            <TextStream>
              <ContentRenderer :value="page" />
            </TextStream>
          </article>

          <aside
            un-m-0
            un-flex
            un-w-60
            un-shrink-0
            un-flex-col
            un-gap="[clamp(1rem,2.5vh,1.5rem)]"
            un-pt="[0.2em] max-md:0"
            un-max-md:w-full
            un-max-md:max-w="[20rem]"
            un-min-h-0
            aria-label="Sections"
          >
            <SiteRailLink
              v-for="route in routes"
              :key="route.to"
              :to="route.to"
              :label="route.label"
              :note="route.note"
              :ink="route.ink"
            />
          </aside>
        </div>
      </div>
    </section>

    <div
      un-relative
      un-z-3
      un-pointer-events-none
      un-mt="[-100svh]"
    >
      <div
        aria-hidden="true"
        un-pointer-events-none
        :style="{ height: `calc(100svh - ${mastH}px)` }"
      />
      <div
        ref="mastEl"
        un-sticky
        un-top-0
        un-z-4
        un-pointer-events-auto
        un-box-border
        un-flex
        un-w-full
        un-flex-nowrap
        un-items-baseline
        un-border-t="~ transparent data-[scrolled]:muted/35 data-[stuck]:transparent"
        un-border-b="~ transparent data-[scrolled]:muted/35 data-[stuck]:transparent"
        un-bg-paper
        un-px="[var(--gutter)] max-md:8"
        un-py="2.5 data-[stuck]:3"
        un-transition="colors,border-color,padding"
        un-duration-200
        un-ease-paper
        :data-scrolled="scrolled && !stuck ? '' : undefined"
        :data-stuck="stuck ? '' : undefined"
      >
        <AppFooter flush />
      </div>
      <div un-pointer-events-auto>
        <HomeScraps :chrome-height="mastH" />
      </div>
    </div>
  </div>
</template>
