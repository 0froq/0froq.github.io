<script setup lang="ts">
import type { SiteLayer } from '~/utils/layers'

const props = withDefaults(defineProps<{
  title: string
  tone?: 'posts' | 'corpus'
  layer?: SiteLayer | null
}>(), {
  tone: undefined,
  layer: null,
})

const peek = provideHubPeek()
const route = useRoute()

const homeTo = computed(() => {
  if (props.tone === 'corpus')
    return '/corpus'
  return '/posts'
})

watch(() => String(route.params.layer || ''), () => {
  peek.value = null
})
</script>

<template>
  <div
    class="site-hub"
    :data-tone="tone"
    :data-layer="layer ? '' : undefined"
    un-box-border
    un-mb="[12vh]"
    un-flex
    un-w-full
    un-flex-col
    un-items-stretch
  >
    <aside
      class="site-hub-rail"
      un-m-0
      aria-label="Layers"
    >
      <slot name="routes" />
    </aside>

    <header class="site-hub-mast">
      <template v-if="layer">
        <p class="site-hub-crumb">
          <NuxtLink
            :to="homeTo"
            class="site-hub-crumb-link"
          >
            {{ title }}
          </NuxtLink>
          <span
            class="site-hub-crumb-sep"
            aria-hidden="true"
          >/</span>
        </p>
        <h1 class="site-hub-title">
          {{ layer.label }}
        </h1>
        <p
          v-if="layer.note"
          class="site-hub-note"
        >
          {{ layer.note }}
        </p>
      </template>
      <h1
        v-else
        class="site-hub-title"
      >
        {{ title }}
      </h1>
    </header>

    <div class="site-hub-body">
      <article
        class="site-hub-main"
        un-prose="~"
        un-flex
        un-min-w-0
        un-max-w-full
        un-flex-col
        un-text="[17px] muted"
        un-leading="[1.75]"
      >
        <slot />
      </article>

      <HubPeek />
    </div>
  </div>
</template>

<style scoped>
/* Compact below 1200px: rail as a sticky bar, peek off, main full width.
   Wide: peek + rail are fixed and out of flow so the article keeps its measure. */
.site-hub {
  --hub-pad: var(--gutter);
  --hub-side: min(16rem, max(13rem, calc((100vw - 48em) / 2 - var(--gutter) - 2rem)));
  --hub-side-gap: 2.5rem;
  gap: 0;
  margin-top: 0;
  padding-inline: var(--hub-pad);
}

.site-hub-mast {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: clamp(1.5rem, 5vh, 3rem);
  padding-bottom: 2rem;
  text-align: center;
}

.site-hub-crumb {
  margin: 0 0 0.45rem;
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.06em;
  color: var(--muted);
}

.site-hub-crumb-link {
  color: inherit;
  text-decoration: none;
}

.site-hub-crumb-link:hover,
.site-hub-crumb-link:focus-visible {
  color: var(--colored-ink);
}

.site-hub-crumb-sep {
  margin-inline: 0.45em;
  opacity: 0.55;
}

.site-hub-title {
  margin: 0;
  font-size: clamp(40px, 6vw, 64px);
  font-weight: 600;
  letter-spacing: -0.04em;
  line-height: 1;
  text-wrap: balance;
  color: var(--paper);
  -webkit-text-stroke: 1.15px var(--ink);
}

.site-hub-note {
  margin: 0.65rem 0 0;
  max-width: 28em;
  font-family: var(--font-serif);
  font-size: 1.05em;
  font-style: italic;
  line-height: 1.45;
  color: var(--muted);
}

.site-hub[data-tone='posts'] .site-hub-title {
  font-style: italic;
}

.site-hub[data-tone='corpus'] .site-hub-title {
  font-family: var(--font-serif);
  letter-spacing: 0.02em;
}

.site-hub-body {
  display: flex;
  width: 100%;
  min-height: 0;
  justify-content: center;
}

.site-hub-main {
  flex: 1 1 auto;
  width: 100%;
  max-width: none;
}

.site-hub-rail {
  position: sticky;
  top: 0;
  z-index: 25;
  display: flex;
  flex-flow: row nowrap;
  gap: 1.1rem 1.75rem;
  align-items: center;
  width: auto;
  margin-inline: calc(-1 * var(--hub-pad));
  padding-block: 0.7rem;
  padding-inline: calc(var(--hub-pad) + var(--site-home-inset)) var(--hub-pad);
  min-height: var(--site-chrome);
  overflow-x: auto;
  overscroll-behavior-x: contain;
  scrollbar-width: thin;
  border-bottom: 1px solid var(--line);
  background: color-mix(in srgb, var(--paper) 92%, transparent);
  backdrop-filter: blur(10px);
}

.site-hub-rail :deep(.label) {
  font-size: clamp(18px, 3.4vw, 26px);
}

.site-hub-rail :deep(.note) {
  display: none;
}

.site-hub :deep(.hub-peek) {
  display: none;
}

@media (max-width: 759px) {
  .site-hub {
    --hub-pad: 1rem;
  }
}

@media (min-width: 1200px) {
  .site-hub {
    --hub-aside-top: calc(8vh + clamp(40px, 6vw, 64px) + 2.25rem);
    gap: 2rem;
    margin-top: 8vh;
  }

  .site-hub[data-layer] {
    --hub-aside-top: calc(8vh + clamp(52px, 7vw, 78px) + 3.25rem);
  }

  .site-hub-mast {
    padding-top: 0;
    padding-bottom: 0;
  }

  .site-hub-body {
    padding-inline:
      calc(var(--hub-side) + var(--hub-side-gap))
      calc(var(--hub-side) + var(--hub-side-gap));
  }

  .site-hub-main {
    flex: 0 1 48em;
    width: min(48em, 100%);
    max-width: 48em;
    margin-inline: auto;
  }

  .site-hub-rail {
    position: fixed;
    top: var(--hub-aside-top);
    right: var(--gutter);
    left: auto;
    z-index: 10;
    flex-direction: column;
    gap: 1.35rem;
    align-items: flex-start;
    width: var(--hub-side);
    min-height: 0;
    margin: 0;
    padding: 0;
    overflow: visible;
    border: 0;
    background: none;
    backdrop-filter: none;
  }

  .site-hub-rail :deep(.label) {
    font-size: clamp(26px, 2.4vw, 34px);
  }

  .site-hub-rail :deep(.note) {
    display: block;
  }

  .site-hub :deep(.hub-peek) {
    display: block;
    position: fixed;
    top: var(--hub-aside-top);
    left: var(--gutter);
    z-index: 10;
    width: var(--hub-side);
    max-height: calc(100dvh - var(--hub-aside-top) - 2rem);
    overflow: auto;
    pointer-events: none;
    scrollbar-width: thin;
  }

  .site-hub :deep(.hub-peek-inner) {
    margin-inline-start: auto;
  }
}
</style>
