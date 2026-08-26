<script setup lang="ts">
const { data: page } = await useAsyncData('home', () => {
  return queryCollection('home').first()
})

const mastEl = ref<HTMLElement | null>(null)
const mastH = shallowRef(44)
const stuck = shallowRef(false)
const scrolled = shallowRef(false)
const toLanding = shallowRef(false)
let mastRo: ResizeObserver | undefined

function syncMast() {
  const el = mastEl.value
  if (!el)
    return
  mastH.value = el.offsetHeight
  const top = el.getBoundingClientRect().top
  stuck.value = top <= 0.5
  scrolled.value = window.scrollY > 8
  toLanding.value = scrolled.value && top < window.innerHeight * 0.55
}

function scrollToScraps() {
  mastEl.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function scrollToLanding() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function onMastNav() {
  if (toLanding.value)
    scrollToLanding()
  else
    scrollToScraps()
}

onMounted(() => {
  const el = mastEl.value
  if (el) {
    mastRo = new ResizeObserver(syncMast)
    mastRo.observe(el)
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

const routes = [
  {
    to: '/posts',
    label: 'Posts',
    note: 'Articles that I want to share',
    ink: 'underline',
  },
  {
    to: '/corpus',
    label: 'Corpus',
    note: 'Internal notes but feel free to read',
    ink: 'mark',
  },
  {
    to: '/dashboard',
    label: 'Dashboard',
    note: 'Spy on me if you want',
    ink: 'circle',
  },
] as const
</script>

<template>
  <div un-relative>
    <section
      un-sticky
      un-top-0
      un-z-1
      un-box-border
      un-flex
      un-h-svh
      un-max-h-svh
      un-flex-col
      un-justify-start
      un-overflow-hidden
      un-bg-paper
      un-pt="[clamp(1.25rem,4vh,3rem)] max-md:8"
      un-max-md:relative
      un-max-md:h-auto
      un-max-md:max-h-none
      un-max-md:overflow-visible
      :style="{ paddingBottom: `calc(${mastH}px + 0.75rem)` }"
    >
      <div
        un-box-border
        un-mx-0
        un-flex
        un-min-h-0
        un-w-full
        un-max-w="[1400px]"
        un-flex-1
        un-flex-col
        un-items-stretch
        un-justify-start
        un-gap="[clamp(1.25rem,3.5vh,2.75rem)] max-md:6"
        un-pl="[clamp(24px,8vw,120px)] max-md:4"
        un-pr="[clamp(24px,6vw,96px)] max-md:4"
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
          un-min-h-50vh
          un-w-full
          un-items-start
          un-justify-start
          un-gap="[clamp(2.5rem,5vw,5rem)] max-md:6"
          un-max-md:my-0
          un-max-md:flex-col
        >
          <article
            v-if="page"
            un-prose="~"
            un-min-h-0
            un-min-w-0
            un-max-w="[36em]"
            un-flex-1
            un-overflow-x-clip
            un-text="lg"
            un-leading="[1.6]"
          >
            <TextStream>
              <ContentRenderer :value="page" />
            </TextStream>
          </article>

          <aside
            un-m-0
            un-flex
            un-w="[15rem]"
            un-shrink-0
            un-flex-col
            un-gap="[clamp(1rem,2.5vh,1.5rem)] max-md:5"
            un-pt="[0.2em] max-md:0"
            un-max-md:w-auto
            un-max-md:flex-row
            un-max-md:overflow-x-auto
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
      un-mt="[-100svh] max-md:0"
      un-max-md:pointer-events-auto
    >
      <div
        aria-hidden="true"
        un-pointer-events-none
        un-max-md:hidden
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
        un-border-b="~ transparent data-[scrolled]:muted/35 data-[stuck]:muted"
        un-bg-paper
        un-px="[clamp(24px,8vw,120px)] max-md:4"
        un-py="[0.65rem] data-[stuck]:[0.75rem]"
        un-transition="colors,border-color,padding"
        un-duration-200
        un-ease="[var(--ease-out)]"
        :data-scrolled="scrolled && !stuck ? '' : undefined"
        :data-stuck="stuck ? '' : undefined"
      >
        <AppFooter flush>
          <button
            type="button"
            un-m-0
            un-inline-flex
            un-cursor-pointer
            un-items-baseline
            un-gap-1
            un-border-0
            un-bg-transparent
            un-p-0
            un-font-mono
            un-text="sm muted hover:colored-ink focus-visible:colored-ink"
            un-tracking="[0.08em]"
            un-uppercase
            :aria-label="toLanding ? 'Back to landing' : 'Scroll to scraps'"
            @click="onMastNav"
          >
            <span
              aria-hidden="true"
              un-inline-block
              un-origin-center
              un-transition-transform
              un-duration-200
              un-ease="[var(--ease-out)]"
              un-rotate="data-[up]:180"
              :data-up="toLanding ? '' : undefined"
            >↓</span>
            {{ toLanding ? 'landing' : 'scraps' }}
          </button>
        </AppFooter>
      </div>
      <div un-pointer-events-auto>
        <HomeScraps :chrome-height="mastH" />
      </div>
    </div>
  </div>
</template>
