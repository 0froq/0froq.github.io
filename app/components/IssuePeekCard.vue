<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    entry: LayerEntry
    dialog?: boolean
    flip?: boolean
    /** Mouse-following ink. Only the active card should turn this on. */
    spot?: boolean
  }>(),
  {
    flip: true,
    spot: false,
  },
)

const cardRef = useTemplateRef<HTMLElement>('card')
const titleRef = useTemplateRef<HTMLElement>('title')

const route = useRoute()
const { remember } = useIssueArticleReturn()
const flipped = ref(false)

const metaBits = computed(() => {
  const bits: string[] = []
  if (props.entry.created) bits.push(issueDate(props.entry.created))
  const touched = isIssueEvergreen(props.entry) ? issueTouchedDate(props.entry) : ''
  if (touched) bits.push(touched)
  if (props.entry.words) bits.push(`${formatCompact(props.entry.words)} words`)
  return bits
})

const backMark = computed(() => (props.entry.kind === 'rook' ? 'Rook' : 'froQ'))
const rookClip = computed(() => `rook-hatch-${props.entry.path.replace(/[^A-Za-z0-9_-]/g, '')}`)

const evergreen = computed(() => isIssueEvergreen(props.entry))

const summary = computed(() => props.entry.description?.trim() || props.entry.slip?.trim() || '')

watch(
  () => props.entry.path,
  () => {
    flipped.value = false
  },
)

watch(
  () => props.flip,
  canFlip => {
    if (!canFlip) flipped.value = false
  },
)

function onCardClick(event: MouseEvent) {
  if (!props.flip) return
  if (event.target instanceof Element && event.target.closest('a, button')) return
  flipped.value = !flipped.value
}
</script>

<template>
  <div
    :id="dialog ? 'issue-peek-float' : undefined"
    class="group/sheet"
    un-perspective="[72rem]"
    :class="dialog ? 'w-full max-w-96' : 'w-64 max-w-full'"
    :data-dialog="dialog ? '' : undefined"
    :data-rook="entry.kind === 'rook' ? '' : undefined"
    un-overflow="visible data-[dialog]:auto"
    :role="dialog ? 'dialog' : 'region'"
    :aria-modal="dialog ? 'true' : undefined"
    :aria-labelledby="dialog ? 'issue-peek-float-title' : undefined"
    :aria-pressed="flipped"
    aria-live="polite"
    un-relative
    un-isolate
    un-mx-auto
    un-min-w-0
    un-shadow-none
    un-cursor-pointer
    ref="card"
    @click="onCardClick"
  >
    <IssuePeekSpot
      v-if="spot"
      :card="cardRef"
      :title="titleRef"
    />
    <p
      v-if="dialog"
      id="issue-peek-float-title"
      un-m-0
      un-sr-only
    >
      {{ entry.title }}
    </p>

    <div
      class="issue-peek-sizer"
      aria-hidden="true"
      un-w-full
      un-pointer-events-none
    />
    <div
      class="issue-peek-stage"
      un-pointer-events-none
      un-absolute
      un-inset-0
      un-transform-3d
      un-transition-transform
      un-duration-160
      un-ease-paper
    >
      <div
        un-pointer-events-none
        un-relative
        un-h-full
        un-w-full
        un-transform-3d
        un-transition-transform
        un-duration-500
        un-ease-paper
        un-rotate-y="data-[face=back]:180"
        :data-face="flipped ? 'back' : 'front'"
      >
        <div
          class="issue-peek-face pointer-events-none data-[shown]:pointer-events-auto"
          :data-shown="flipped ? undefined : ''"
          un-chrome-blur
          un-pointer-events="none data-[shown]:auto"
          un-z="0 data-[shown]:1"
          un-absolute
          un-inset-0
          un-flex
          un-flex-col
          un-justify-between
          un-gap-4
          un-overflow-hidden
          un-border
          un-border-line
          un-translate-z-px
          un-px-5
          un-py-4
        >
          <svg
            v-if="entry.kind === 'rook'"
            class="issue-peek-rook"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <defs>
              <clipPath :id="rookClip">
                <polygon points="0,0 20,0 0,20" />
              </clipPath>
            </defs>
            <g
              class="issue-peek-rook-hatch"
              :clip-path="`url(#${rookClip})`"
            >
              <line
                v-for="n in 12"
                :key="n"
                x1="-2"
                :y1="(n - 2) * 2.4 - 4"
                x2="22"
                :y2="(n - 2) * 2.4 + 4"
              />
            </g>
          </svg>
          <span
            class="issue-peek-halo"
            aria-hidden="true"
            un-absolute
            un-inset-0
            un-z-0
            un-border
            un-border-ink
            un-pointer-events-none
            un-opacity="0 group-hover/sheet:100 group-focus-within/sheet:100"
            un-transition-opacity
            un-duration-200
            un-ease-paper
          />

          <div
            un-relative
            un-z-1
            un-min-h-0
            un-flex-1
            un-flex
            un-flex-col
            un-overflow-hidden
          >
            <div
              ref="title"
              un-relative
              un-w-fit
              un-max-w-full
            >
              <h2
                un-m-0
                un-w-fit
                un-max-w-full
                un-font-serif
                un-font-normal
                class="text-3xl text-ink/60"
                un-leading-tight
                un-line-clamp-3
              >
                {{ entry.title }}
              </h2>
              <span
                class="issue-peek-title-halo text-3xl text-ink"
                aria-hidden="true"
                un-absolute
                un-inset-0
                un-font-serif
                un-font-normal
                un-leading-tight
                un-line-clamp-3
                un-pointer-events-none
                un-opacity="0 group-hover/sheet:100 group-focus-within/sheet:100"
                un-transition-opacity
                un-duration-200
                un-ease-paper
                >{{ entry.title }}</span
              >
            </div>
          </div>

          <div
            un-relative
            un-z-1
            un-flex
            un-flex-col
            un-gap-1
          >
            <p
              v-if="evergreen"
              un-m-0
              un-font-italic
              un-text="base green-600/80 dark:green-300/80"
              un-tracking-wide
            >
              evergreen
            </p>
            <div
              un-flex
              un-min-w-0
              un-items-center
              un-justify-between
              un-gap-3
            >
              <p
                v-if="metaBits.length"
                un-m-0
                un-min-w-0
                un-font-mono
                un-text="xs muted"
                un-tracking-wide
                un-tabular-nums
              >
                <template
                  v-for="(bit, i) in metaBits"
                  :key="bit"
                >
                  <span
                    v-if="i"
                    aria-hidden="true"
                    un-mx-2
                    un-opacity-70
                    >·</span
                  >
                  <span>{{ bit }}</span>
                </template>
              </p>
              <NuxtLink
                data-issue-peek-cta
                class="issue-peek-read"
                un-reach-hit
                un-ml-auto
                un-shrink-0
                un-m-0
                un-font-mono
                un-text-xs
                un-tracking-wide
                aria-label="Open original"
                :to="entry.path"
                @click.stop="remember(route.fullPath)"
              >
                <span
                  class="issue-peek-read__bar"
                  aria-hidden="true"
                />
                原文
              </NuxtLink>
            </div>
          </div>
        </div>

        <div
          class="issue-peek-face pointer-events-none data-[shown]:pointer-events-auto"
          :data-shown="flipped ? '' : undefined"
          un-chrome-blur
          un-pointer-events="none data-[shown]:auto"
          un-z="0 data-[shown]:1"
          un-absolute
          un-inset-0
          un-flex
          un-flex-col
          un-gap-4
          un-overflow-hidden
          un-border
          un-border-line
          un-rotate-y-180
          un-translate-z-px
          un-px-5
          un-py-4
        >
          <span
            aria-hidden="true"
            un-absolute
            un-right-0
            un-bottom-0
            un-z-0
            un-max-w-full
            un-overflow-hidden
            un-font-serif
            un-italic
            un-font-medium
            class="text-[5.5rem] text-ink/11"
            un-leading-none
            un-tracking-tight
            un-pointer-events-none
            un-select-none
            >{{ backMark }}</span
          >
          <span
            class="issue-peek-mark-stroke text-[5.5rem]"
            aria-hidden="true"
            un-absolute
            un-inset-0
            un-z-0
            un-flex
            un-items-end
            un-justify-end
            un-overflow-hidden
            un-font-serif
            un-italic
            un-font-medium
            un-text-transparent
            un-leading-none
            un-tracking-tight
            un-pointer-events-none
            un-select-none
            un-opacity="0 group-hover/sheet:60 group-focus-within/sheet:60"
            un-transition-opacity
            un-duration-200
            un-ease-paper
            >{{ backMark }}</span
          >
          <span
            class="issue-peek-halo"
            aria-hidden="true"
            un-absolute
            un-inset-0
            un-z-0
            un-border
            un-border-ink
            un-pointer-events-none
            un-opacity="0 group-hover/sheet:100 group-focus-within/sheet:100"
            un-transition-opacity
            un-duration-200
            un-ease-paper
          />

          <p
            un-relative
            un-z-1
            un-m-0
            un-min-h-0
            un-self-start
            un-overflow-auto
            un-font-serif
            un-text="sm ink"
            un-leading-relaxed
          >
            {{ summary || 'No summary.' }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.issue-peek-sizer {
  padding-top: 56.25%;
}

.issue-peek-read {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--ink);
  line-height: 1;
  text-decoration: none;
  transition:
    color 200ms var(--ease-out),
    transform 160ms var(--ease-out);
}

.issue-peek-read__bar {
  width: 1px;
  height: 0.65em;
  background: var(--colored-ink);
  transition: height 200ms var(--ease-out);
}

.issue-peek-read:hover,
.issue-peek-read:focus-visible {
  color: var(--colored-ink);
}

.issue-peek-read:hover .issue-peek-read__bar,
.issue-peek-read:focus-visible .issue-peek-read__bar {
  height: 1em;
}

.issue-peek-read:active {
  transform: translateY(1px);
}

.issue-peek-face {
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.issue-peek-rook {
  position: absolute;
  z-index: 2;
  top: 0;
  left: 0;
  width: 1.6rem;
  height: 1.6rem;
  color: var(--ink);
  pointer-events: none;
}

.issue-peek-rook-hatch {
  stroke: currentColor;
  stroke-width: 0.45;
  opacity: 0.7;
  fill: none;
}

/* Parent `pointer-events: none` does not disable button/link descendants. */
.issue-peek-face:not([data-shown]),
.issue-peek-face:not([data-shown]) :deep(*) {
  pointer-events: none;
}

.issue-peek-mark-stroke,
.issue-peek-halo,
.issue-peek-title-halo {
  transition: opacity 200ms var(--ease-out);
}

.issue-peek-mark-stroke,
.issue-peek-halo {
  mask-image: radial-gradient(
    8rem at var(--ink-x, 0px) var(--ink-y, 0px),
    #000 18%,
    transparent 72%
  );
  -webkit-mask-image: radial-gradient(
    8rem at var(--ink-x, 0px) var(--ink-y, 0px),
    #000 18%,
    transparent 72%
  );
}

.issue-peek-title-halo {
  mask-image: radial-gradient(
    8rem at var(--halo-x, 0px) var(--halo-y, 0px),
    #000 18%,
    transparent 72%
  );
  -webkit-mask-image: radial-gradient(
    8rem at var(--halo-x, 0px) var(--halo-y, 0px),
    #000 18%,
    transparent 72%
  );
}

.issue-peek-mark-stroke {
  -webkit-text-stroke: 1.2px var(--ink);
}

@media (prefers-reduced-motion: reduce) {
  .issue-peek-mark-stroke,
  .issue-peek-halo,
  .issue-peek-title-halo {
    mask-image: none;
    -webkit-mask-image: none;
  }
}
</style>
