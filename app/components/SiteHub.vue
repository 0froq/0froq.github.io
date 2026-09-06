<script setup lang="ts">
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
const titleHover = shallowRef(false)
const layersOpen = shallowRef(false)

const homeTo = computed(() => {
  if (props.tone === 'corpus')
    return '/corpus'
  return '/posts'
})

const titleSeed = computed(() => `hub-title:${props.tone ?? 'posts'}`)

const currentLayerLabel = computed(() => props.layer?.label ?? 'Layers')

watch(() => String(route.params.layer || ''), () => {
  peek.value = null
  titleHover.value = false
  layersOpen.value = false
})

function toggleLayers() {
  layersOpen.value = !layersOpen.value
}
</script>

<template>
  <div
    class="group [--hub-pad:min(var(--gutter),2.5rem)] [--hub-side:clamp(12.5rem,15vw,18rem)] [--hub-side-gap:clamp(1.5rem,2.5vw,2.5rem)] [--hub-sheet:min(48rem,calc(100vw-2*var(--hub-side)-2*var(--hub-side-gap)-2*var(--hub-pad)))] [--hub-chrome-inset:max(var(--hub-pad),calc(50%-0.5*var(--hub-sheet)-var(--hub-side)-var(--hub-side-gap)))] max-md:[--hub-pad:1rem]"
    :data-tone="tone"
    :data-mast="layer ? 'layer' : 'hub'"
    un-box-border
    un-mb="[12vh]"
    un-mt="0 lg:[8vh]"
    un-flex
    un-w-full
    un-flex-col
    un-items-stretch
    un-gap="0 lg:8"
    un-px="[var(--hub-pad)]"
  >
    <aside
      class="[&_.label]:text-[clamp(1.05rem,2.2vw,1.25rem)] [&_.note]:hidden lg:[&_.label]:text-[clamp(1.15rem,1.5vw,1.4rem)] lg:[&_.note]:block"
      un-sticky
      un-top-0
      un-z-20
      un-bg-paper
      un-m-0
      un-flex
      un-w-auto
      un-min-h="[var(--site-chrome)]"
      un-flex-col
      un-gap-2
      un-border-b
      un-border-line
      un-py-3
      un-mx="[calc(-1*var(--hub-pad))]"
      un-px="[var(--hub-pad)]"
      un-lg="fixed top-[8vh] right-[var(--hub-chrome-inset)] left-auto z-10 items-start gap-6 w-[var(--hub-side)] min-h-0 max-h-[calc(100dvh-8vh-6rem)] m-0 p-0 overflow-x-hidden overflow-y-auto border-0 bg-transparent backdrop-blur-none"
    >
      <header
        un-flex
        un-flex-col
        un-shrink-0
        un-items="center lg:start"
        un-text="center lg:left"
        un-pb="3 lg:2"
      >
        <h1 un-sr-only>
          {{ layer ? layer.label : title }}
        </h1>
        <p
          class="[-webkit-text-stroke:1px_var(--ink)] ease-paper group-data-[mast=layer]:text-paper [&_a]:text-inherit group-data-[tone=corpus]:tracking-[0.02em] motion-reduce:duration-120 [&_a]:[-webkit-text-stroke:inherit] group-data-[tone=corpus]:font-serif"
          un-text="[clamp(2rem,4vw,2.5rem)] ink"
          un-leading-none
          un-font-black
          un-italic
          un-m-0
          un-text-balance
          un-transition-colors
          un-duration-400
          :aria-hidden="layer ? undefined : true"
        >
          <span
            v-if="layer"
            un-relative
            un-inline-block
            @mouseenter="titleHover = true"
            @mouseleave="titleHover = false"
            @focusin="titleHover = true"
            @focusout="titleHover = false"
          >
            <NuxtLink
              :to="homeTo"
              un-transition
              un-text="inherit hover:muted focus-visible:muted"
              un-decoration-none
            >
              {{ title }}
            </NuxtLink>
            <span
              un-absolute
              un-left-full
              un-top="[50%]"
              un-translate-y="-50%"
              un-pointer-events-none
              aria-hidden="true"
            >
              <InkPointer
                v-if="titleHover"
                :seed="titleSeed"
                dir="right"
                size="md"
                draw
              />
            </span>
          </span>
          <template v-else>
            {{ title }}
          </template>
        </p>
      </header>

      <button
        type="button"
        un-lg:hidden
        un-mx-auto
        un-flex
        un-items-center
        un-justify-center
        un-gap-1.5
        un-border-0
        un-bg-transparent
        un-p-0
        un-font-serif
        un-italic
        un-text="[clamp(1.15rem,1.7vw,1.45rem)] ink"
        un-leading-none
        un-cursor-pointer
        :aria-expanded="layersOpen"
        aria-controls="hub-layers"
        @click="toggleLayers"
      >
        <span>{{ currentLayerLabel }}</span>
        <span
          aria-hidden="true"
          un-inline-block
          un-text="xs muted"
          un-not-italic
          un-transition-transform
          un-duration-200
          :style="{ transform: layersOpen ? 'rotate(180deg)' : 'none' }"
        >▾</span>
      </button>

      <div
        id="hub-layers"
        class="hub-layers"
        aria-label="Layers"
        :data-open="layersOpen ? '' : undefined"
        un-grid
        un-w-full
        un-grid-rows="[0fr] data-[open]:[1fr] lg:[1fr]"
        un-transition="[grid-template-rows] motion-reduce:none"
        un-duration="320ms data-[open]:420ms"
        un-ease-paper
      >
        <div
          class="hub-layers__clip"
          un-min-h-0
          un-overflow-hidden
        >
          <div
            un-flex
            un-flex-col
            un-items-center
            un-gap-3
            un-w-full
            un-py-1
            un-lg="items-start gap-4 py-0"
          >
            <slot name="routes" />
          </div>
        </div>
      </div>
      <slot name="filters" />
    </aside>

    <div
      un-flex
      un-w-full
      un-min-h-0
      un-justify-center
      un-lg:px="[calc(var(--hub-side)+var(--hub-side-gap))]"
    >
      <article
        un-prose="~"
        un-flex
        un-min-w-0
        un-w-full
        un-max-w-none
        un-flex-1
        un-flex-col
        un-text="lg muted"
        un-leading-relaxed
        un-lg="flex-none w-[min(var(--hub-sheet),100%)] max-w-[var(--hub-sheet)] mx-auto"
      >
        <slot />
      </article>

      <HubPeek />
    </div>
  </div>
</template>

<style scoped>
@media (max-width: 1199px) {
  .hub-layers__clip {
    opacity: 0;
    transform: translateY(-0.4rem);
    -webkit-mask-image: linear-gradient(
      to bottom,
      #000 0%,
      #000 48%,
      transparent 100%
    );
    mask-image: linear-gradient(
      to bottom,
      #000 0%,
      #000 48%,
      transparent 100%
    );
    -webkit-mask-repeat: no-repeat;
    mask-repeat: no-repeat;
    -webkit-mask-size: 100% 0%;
    mask-size: 100% 0%;
    transition:
      -webkit-mask-size 0.42s var(--ease-out),
      mask-size 0.42s var(--ease-out),
      opacity 0.28s var(--ease-out) 0.08s,
      transform 0.28s var(--ease-out) 0.08s;
  }

  .hub-layers[data-open] .hub-layers__clip {
    opacity: 1;
    transform: none;
    -webkit-mask-image: linear-gradient(to bottom, #000, #000);
    mask-image: linear-gradient(to bottom, #000, #000);
    -webkit-mask-size: 100% 100%;
    mask-size: 100% 100%;
  }

  @media (prefers-reduced-motion: reduce) {
    .hub-layers__clip,
    .hub-layers[data-open] .hub-layers__clip {
      opacity: 1;
      transform: none;
      transition: none;
      -webkit-mask-image: none;
      mask-image: none;
      -webkit-mask-size: auto;
      mask-size: auto;
    }
  }
}

@media (min-width: 1200px) {
  .hub-layers__clip {
    opacity: 1;
    transform: none;
    -webkit-mask-image: none;
    mask-image: none;
  }
}
</style>
