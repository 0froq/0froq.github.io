<script setup lang="ts">
useHead({ title: 'Contact' })

interface ReachItem {
  id: string
  kind: InkGlyphKind
  label: string
  /** Visible handle / address in body copy. */
  handle: string
  /** External or mailto link. Empty = pending (glyph only). */
  href?: string
  /** If set, click copies this string instead of navigating. */
  copy?: string
  /** Optional margin-rail label (contact only). */
  margin?: string
}

/** Direct reach — fill href / copy / handle as needed. */
const contact: ReachItem[] = [
  {
    id: 'mail',
    kind: 'mail',
    label: 'Email',
    handle: 'sayhola@froq.me',
    href: 'mailto:sayhola@froq.me',
    margin: 'inbox',
  },
  {
    id: 'wechat',
    kind: 'wechat',
    label: 'WeChat',
    handle: '@_froq_',
    copy: '_froq_',
    margin: 'short ping',
  },
  {
    id: 'x',
    kind: 'x',
    label: 'X',
    handle: '@0froQ',
    href: 'https://x.com/0froq?s=11',
    margin: 'everything',
  },
]

/** Public find-me — add href when ready; leave empty for pending. */
const findme: ReachItem[] = [
  {
    id: 'github',
    kind: 'github',
    label: 'GitHub',
    handle: '@0froq',
    href: 'https://github.com/0froq',
  },
  {
    id: 'podcast',
    kind: 'podcast',
    label: 'Podcast (Xiaoyuzhou, 小宇宙, Chinese only for now) ',
    handle: '@ToQ',
    href: 'https://www.xiaoyuzhoufm.com/podcast/68fb1be73ffa38fac58d6bf2',
  },
  {
    id: 'instagram',
    kind: 'instagram',
    label: 'Instagram',
    handle: '@00froq',
    href: 'https://www.instagram.com/00froq',
  },
  {
    id: 'xiaohongshu',
    kind: 'xiaohongshu',
    label: 'Xiaohongshu (小红书, Chinese only for now)',
    handle: '@_froq_',
    href: 'https://www.xiaohongshu.com/user/profile/614428a8000000000201f216',
  },
  {
    id: 'bluesky',
    kind: 'bluesky',
    label: 'Bluesky',
    handle: '@fro-q.bsky.social',
    href: 'https://bsky.app/profile/fro-q.bsky.social',
  },
]

const liveFindme = computed(() => findme.filter(i => i.href && i.handle))
const pendingFindme = computed(() => findme.filter(i => !i.href))

const copied = ref('')
let copyTimer: ReturnType<typeof setTimeout> | undefined

async function copyText(item: ReachItem) {
  if (!item.copy)
    return
  try {
    await navigator.clipboard.writeText(item.copy)
    copied.value = item.label
    clearTimeout(copyTimer)
    copyTimer = setTimeout(() => {
      copied.value = ''
    }, 1600)
  }
  catch {
    copied.value = ''
  }
}

onBeforeUnmount(() => {
  clearTimeout(copyTimer)
})
</script>

<template>
  <section
    un-box-border
    un-mx-auto
    un-w="[calc(100%-3rem)] max-md:[calc(100%-2rem)]"
    un-max-w-6xl
    un-pt="[clamp(2.25rem,8vh,4.5rem)]"
    un-pb-20
  >
    <header>
      <h1
        un-m-0
        un-font-serif
        un-text="[clamp(2rem,4.2vw,2.7rem)]"
        un-font-medium
        un-tracking-tighter
        un-leading-tight
        class="text-balance"
      >
        Contact
      </h1>
      <InkRule
        seed="reach-contact"
        un-block
        un-max-w-20
        un-mt-2.5
      />
    </header>

    <div
      un-mt-7
      un-grid
      un-items-start
      un-gap="[clamp(2rem,5vw,3.75rem)] max-md:7"
      un-grid-cols="[minmax(0,1fr)_minmax(14rem,17rem)] max-md:1"
      un-max-md:flex
      un-max-md:flex-col
    >
      <div
        class="reach-body"
        un-max-w-3xl
      >
        <p
          un-m-0
          un-font-serif
          un-text="[clamp(1.25rem,2.2vw,1.5rem)]"
          un-leading-relaxed
          un-tracking-tight
          un-text-pretty
        >
          Email for anything that needs a thread:
          <template
            v-for="(item, i) in contact"
            :key="item.id"
          >
            <a
              v-if="item.href"
              class="reach-link reach-hit"
              :href="item.href"
              data-ink="underline"
              data-hover-ink="mark"
              un-inline
              un-m-0
              un-cursor-pointer
              un-border-0
              un-bg-transparent
              un-p-0
              un-font-inherit
              un-italic
              un-whitespace-nowrap
              un-text-colored-ink
              un-decoration-none
              un-touch-manipulation
              :aria-label="`${item.label} ${item.handle}`"
            >
              <span aria-hidden="true">
                <InkGlyph
                  :seed="`body-${item.id}`"
                  :kind="item.kind"
                  :label="item.label"
                />
              </span>
              <span translate="no">{{ item.handle }}</span>
            </a>
            <button
              v-else-if="item.copy"
              type="button"
              class="reach-link reach-hit"
              data-ink="underline"
              data-hover-ink="mark"
              un-inline
              un-m-0
              un-cursor-pointer
              un-border-0
              un-bg-transparent
              un-p-0
              un-font-inherit
              un-italic
              un-whitespace-nowrap
              un-text-colored-ink
              un-decoration-none
              un-touch-manipulation
              :aria-label="`Copy ${item.label} ${item.handle}`"
              @click="copyText(item)"
            >
              <span aria-hidden="true">
                <InkGlyph
                  :seed="`body-${item.id}`"
                  :kind="item.kind"
                  :label="item.label"
                />
              </span>
              <span translate="no">{{ item.handle }}</span>
            </button>
            <template v-if="i === 0">
              . A few lines:
            </template>
            <template v-else>
              .
            </template>
          </template>
          I keep UTC+8. English or Chinese is fine.
          Replies usually land within a day; weekends are slower.
        </p>
        <p
          un-mt-5
          un-font-serif
          un-text="[clamp(1.05rem,1.9vw,1.22rem)] ink/80"
          un-italic
          un-leading-relaxed
          un-tracking-tight
          un-text-pretty
        >
          Public posts live on
          <template
            v-for="(item, i) in liveFindme"
            :key="item.id"
          >
            <template v-if="i > 0">
              {{ i === liveFindme.length - 1 ? ' and ' : ', ' }}
            </template>
            <a
              class="reach-link reach-hit"
              :href="item.href"
              rel="noreferrer"
              target="_blank"
              data-ink="underline"
              data-hover-ink="mark"
              un-inline
              un-m-0
              un-cursor-pointer
              un-border-0
              un-bg-transparent
              un-p-0
              un-font-inherit
              un-italic
              un-whitespace-nowrap
              un-text-colored-ink
              un-decoration-none
              un-touch-manipulation
              :aria-label="`${item.label} ${item.handle}`"
            >
              <span aria-hidden="true">
                <InkGlyph
                  :seed="`body-${item.id}`"
                  :kind="item.kind"
                  :label="item.label"
                />
              </span>
              <span translate="no">{{ item.label }}</span>
            </a>
          </template>.
          If not necessary, avoid DMs on these.
        </p>
        <p
          v-if="copied"
          un-mt-5
          un-font-mono
          un-text="xs muted"
          un-tracking-wide
          aria-live="polite"
        >
          {{ copied }} copied.
        </p>
      </div>

      <aside
        un-flex
        un-flex-col
        un-items-start
        un-gap-4.5
        un-pt-1
        un-font-serif
        un-text="lg colored-ink"
        un-italic
        un-leading-snug
      >
        <template
          v-for="item in contact"
          :key="`m-${item.id}`"
        >
          <a
            v-if="item.href"
            class="reach-fill reach-hit"
            :href="item.href"
            data-ink="underline"
            data-hover-ink="mark"
            un-inline-flex
            un-w-fit
            un-max-w-full
            un-items-center
            un-gap="[0.45em]"
            un-m-0
            un-cursor-pointer
            un-border-0
            un-bg-transparent
            un-px="[0.1em]"
            un-py="[0.15em]"
            un-font-inherit
            un-italic
            un-text-colored-ink
            un-decoration-none
            un-touch-manipulation
            :aria-label="`${item.label} ${item.handle}`"
          >
            <span
              un-inline-flex
              un-h="[1.25em]"
              un-w="[1.25em]"
              un-shrink-0
              un-leading-none
              aria-hidden="true"
            >
              <InkGlyph
                :seed="`margin-${item.id}`"
                :kind="item.kind"
                :label="item.label"
              />
            </span>
            <span>{{ item.margin || item.label }}</span>
          </a>
          <button
            v-else-if="item.copy"
            type="button"
            class="reach-fill reach-hit"
            data-ink="underline"
            data-hover-ink="mark"
            un-inline-flex
            un-w-fit
            un-max-w-full
            un-items-center
            un-gap="[0.45em]"
            un-m-0
            un-cursor-pointer
            un-border-0
            un-bg-transparent
            un-px="[0.1em]"
            un-py="[0.15em]"
            un-font-inherit
            un-italic
            un-text-colored-ink
            un-decoration-none
            un-touch-manipulation
            :aria-label="`Copy ${item.label} ${item.handle}`"
            @click="copyText(item)"
          >
            <span
              un-inline-flex
              un-h="[1.25em]"
              un-w="[1.25em]"
              un-shrink-0
              un-leading-none
              aria-hidden="true"
            >
              <InkGlyph
                :seed="`margin-${item.id}`"
                :kind="item.kind"
                :label="item.label"
              />
            </span>
            <span>{{ item.margin || item.label }}</span>
          </button>
        </template>

        <p
          class="reach-fill"
          un-m-0
          un-mt-1
          un-inline-flex
          un-items-center
          un-gap="[0.45em]"
          un-text-colored-ink
          un-opacity-85
        >
          <span
            un-inline-flex
            un-h="[1.25em]"
            un-w="[1.25em]"
            un-shrink-0
            un-leading-none
            aria-hidden="true"
          >
            <InkGlyph
              seed="margin-clock"
              kind="clock"
              label="Timezone"
            />
          </span>
          <span>UTC+8</span>
        </p>

        <div
          un-mt-5
          un-flex
          un-max-w-52
          un-flex-wrap
          un-gap-x-4
          un-gap-y-3.5
        >
          <a
            v-for="item in liveFindme"
            :key="`g-${item.id}`"
            class="reach-fill reach-hit"
            :href="item.href"
            rel="noreferrer"
            target="_blank"
            data-ink="underline"
            data-hover-ink="mark"
            un-inline-flex
            un-h="[1.35em]"
            un-w="[1.35em]"
            un-text-colored-ink
            un-decoration-none
            :aria-label="`${item.label} ${item.handle}`"
          >
            <InkGlyph
              :seed="`margin-${item.id}`"
              :kind="item.kind"
              :label="item.label"
            />
          </a>
          <span
            v-for="item in pendingFindme"
            :key="`p-${item.id}`"
            class="reach-fill reach-hit"
            un-inline-flex
            un-h="[1.35em]"
            un-w="[1.35em]"
            un-pointer-events-none
            un-text-colored-ink
            un-opacity-45
            :aria-label="`${item.label} handle pending`"
          >
            <InkGlyph
              :seed="`margin-${item.id}`"
              :kind="item.kind"
              :label="item.label"
            />
          </span>
        </div>
      </aside>
    </div>
  </section>
</template>

<style scoped>
.reach-link > [aria-hidden='true'] {
  display: inline-block;
  width: 0.78em;
  height: 0.78em;
  margin-right: 0.28em;
  vertical-align: -0.18em;
  line-height: 0;
  overflow: visible;
}

@supports (width: 1cap) {
  .reach-link > [aria-hidden='true'] {
    width: 1.15cap;
    height: 1.15cap;
    vertical-align: -0.26cap;
  }
}

.reach-link,
.reach-fill {
  font: inherit;
  -webkit-tap-highlight-color: transparent;
}

.reach-link :deep(.ink-glyph),
.reach-link :deep(.ink-glyph svg),
.reach-fill :deep(.ink-glyph),
.reach-fill :deep(.ink-glyph svg) {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
