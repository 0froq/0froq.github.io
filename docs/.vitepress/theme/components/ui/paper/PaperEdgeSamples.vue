<script setup lang="ts">
import { ref } from 'vue'

/**
 * 低频小位移纸边 + 随机 seed / 倾角。
 * 同一套 filter 参数族，每张卡噪声场不同。
 */
interface Sample {
  id: string
  seed: number
  /** 在基线附近微抖，仍属「低频小位移」 */
  frequency: number
  scale: number
  tilt: string
  tapeTilt: string
  tapeOffset: string
}

const BASE = {
  frequency: 0.03,
  octaves: 2,
  scale: 4,
} as const

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randFloat(min: number, max: number, digits = 3) {
  const v = min + Math.random() * (max - min)
  return Number(v.toFixed(digits))
}

function makeSample(i: number): Sample {
  const tilt = randFloat(-1.2, 1.2, 2)
  const tapeTilt = randFloat(-1.8, 1.8, 2)
  return {
    id: `n${i}-${Date.now().toString(36)}`,
    seed: randInt(1, 9999),
    frequency: randFloat(0.025, 0.035, 3),
    scale: randFloat(3, 5, 1),
    tilt: `${tilt}deg`,
    tapeTilt: `${tapeTilt}deg`,
    tapeOffset: `${randInt(-10, 10)}%`,
  }
}

const samples = ref<Sample[]>([0, 1, 2].map(makeSample))

function reshuffle() {
  samples.value = [0, 1, 2].map(makeSample)
}
</script>

<template>
  <section
    un-mt-14
    un-mb-10
    un-flex="~ col"
    un-gap-6
  >
    <header
      un-flex="~ row"
      un-items-end
      un-justify-between
      un-gap-4
      un-flex-wrap
    >
      <div
        un-flex="~ col"
        un-gap-1
      >
        <h3
          un-m-0
          un-font-serif
          un-text="lg neutral-800 dark:neutral-200"
        >
          Paper edge samples
        </h3>
        <p
          un-m-0
          un-text="sm neutral-500 dark:neutral-400"
        >
          低频小位移（f≈0.03 · scale≈4）+ 随机 seed / 倾角 / 胶带。刷新或点右侧重抽。
        </p>
      </div>
      <button
        type="button"
        un-text="xs neutral-600 dark:neutral-300"
        un-font-mono
        un-border="px solid neutral-300 dark:neutral-600"
        un-rounded-xs
        un-px-3
        un-py-1
        un-bg="transparent hover:neutral-100 dark:hover:neutral-800"
        un-transition
        un-cursor-pointer
        @click="reshuffle"
      >
        reshuffle
      </button>
    </header>

    <div
      un-flex="~ row wrap"
      un-gap-8
      un-items-start
    >
      <figure
        v-for="s in samples"
        :key="s.id"
        un-flex="~ col"
        un-gap-3
        un-w-full
        un-max-w-280px
      >
        <div
          class="paper-sample"
          :style="{
            '--tilt': s.tilt,
            '--tape-tilt': s.tapeTilt,
            '--tape-offset': s.tapeOffset,
          }"
        >
          <svg
            class="paper-svg"
            viewBox="0 0 280 160"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <filter
                :id="`paper-edge-${s.id}`"
                x="-12%"
                y="-12%"
                width="124%"
                height="124%"
                color-interpolation-filters="sRGB"
              >
                <feTurbulence
                  type="fractalNoise"
                  :baseFrequency="s.frequency"
                  :numOctaves="BASE.octaves"
                  :seed="s.seed"
                  result="noise"
                />
                <feDisplacementMap
                  in="SourceGraphic"
                  in2="noise"
                  :scale="s.scale"
                  xChannelSelector="R"
                  yChannelSelector="G"
                />
              </filter>
            </defs>
            <rect
              class="paper-fill"
              x="0"
              y="0"
              width="280"
              height="160"
              rx="2"
              ry="2"
              :filter="`url(#paper-edge-${s.id})`"
            />
          </svg>

          <span class="paper-tape" />

          <div class="paper-body">
            <p un-m-0>
              同一参数族，不同噪声场。
            </p>
            <p
              un-m-0
              un-mt-2
              un-text="xs neutral-500 dark:neutral-400"
              un-font-mono
            >
              seed={{ s.seed }} · f={{ s.frequency }} · scale={{ s.scale }}
            </p>
          </div>
        </div>

        <figcaption
          un-text="xs neutral-500 dark:neutral-400"
          un-font-mono
        >
          seed {{ s.seed }}
        </figcaption>
      </figure>
    </div>
  </section>
</template>

<style scoped>
.paper-sample {
  position: relative;
  width: 100%;
  aspect-ratio: 280 / 160;
  transform: rotate(var(--tilt, 0deg));
  transform-origin: 50% 0;
}

.paper-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  pointer-events: none;
  filter: drop-shadow(0 1px 1px rgb(28 25 23 / 0.08)) drop-shadow(0 10px 18px rgb(28 25 23 / 0.12));
}

:global(html.dark) .paper-svg {
  filter: drop-shadow(0 1px 1px rgb(0 0 0 / 0.35)) drop-shadow(0 10px 18px rgb(0 0 0 / 0.35));
}

.paper-fill {
  fill: rgb(245 245 244 / 0.92);
}

:global(html.dark) .paper-fill {
  fill: rgb(41 37 36 / 0.9);
}

.paper-tape {
  position: absolute;
  top: 4px;
  left: calc(50% + var(--tape-offset, 0%));
  z-index: 2;
  width: 56px;
  height: 16px;
  border-radius: 1px;
  pointer-events: none;
  background: rgb(214 211 209 / 0.55);
  border-left: 1px dashed rgb(168 162 158 / 0.45);
  border-right: 1px dashed rgb(168 162 158 / 0.45);
  transform: translateX(-50%) rotate(var(--tape-tilt, 0deg));
}

:global(html.dark) .paper-tape {
  background: rgb(87 83 78 / 0.4);
  border-left-color: rgb(120 113 108 / 0.35);
  border-right-color: rgb(120 113 108 / 0.35);
}

.paper-body {
  position: absolute;
  inset: 18% 12% 14%;
  z-index: 1;
  color: rgb(68 64 60);
  font-size: 0.875rem;
  line-height: 1.6;
}

:global(html.dark) .paper-body {
  color: rgb(214 211 209);
}
</style>
