<script setup lang="ts">
import { useEventListener } from '@vueuse/core'
import Doodle from '~/components/content/Doodle.vue'

const route = useRoute()
const lang = computed(() => cvLangOf(route.query.lang))
const doc = computed(() => cv[lang.value])
const pageTitle = computed(() => `${doc.value.legal} · CV`)

useHead(() => ({
  title: pageTitle.value,
}))

function printTitle() {
  const dark = document.documentElement.classList.contains('dark')
  const scheme = lang.value === 'zh'
    ? (dark ? '深色' : '浅色')
    : (dark ? 'dark' : 'light')
  return `${pageTitle.value} · ${scheme}`
}

useEventListener(window, 'beforeprint', () => {
  document.title = printTitle()
})
useEventListener(window, 'afterprint', () => {
  document.title = pageTitle.value
})
</script>

<template>
  <article
    data-cv
    data-md-content
    :lang="lang === 'zh' ? 'zh-Hans' : 'en'"
    un-box-border
    un-mx-auto
    un-my-10
    un-w-full
    un-max-w-4xl
    un-bg-sticky-note
    un-border
    un-border-line
    un-shadow="[0_10px_28px_var(--shadow)]"
    un-px="16"
    un-py="16"
    un-font-serif
    un-leading-relaxed
    class="[print-color-adjust:exact]"
  >
    <header
      un-grid
      un-gap-x-12
      un-gap-y-10
      un-items-end
      un-pb-10
      class="grid-cols-[1.85fr_0.65fr] print:break-inside-avoid"
    >
      <div>
        <h1
          un-m-0
          un-inline-flex
          un-text-logo
          un-leading-none
        >
          <span un-sr-only>{{ doc.name }}</span>
          <SvgFroqLogo
            width="10rem"
          />
        </h1>
        <p
          un-m-0
          un-mt-4
          un-flex
          un-items-center
          un-gap-2.5
          un-font-mono
          un-text="sm muted"
        >
          <span
            aria-hidden="true"
            un-inline-block
            un-h-px
            un-w-8
            un-bg-muted
          />
          froQ /frɒk/ · {{ doc.legal }}
        </p>
        <p
          un-mt-8
          un-mb-0
          un-max-w-xl
          un-text-pretty
          un-tracking-tight
          un-leading-snug
          un-text="2xl ink"
        >
          {{ doc.hello }}
        </p>
      </div>

      <aside
        un-flex
        un-flex-col
        un-gap-6
      >
        <div>
          <CvSectionHead
            :title="doc.now"
            side="left"
          />
          <p
            un-m-0
            un-text="lg ink"
          >
            {{ doc.line }}
          </p>
          <p
            un-m-0
            un-mt-2
            un-flex
            un-items-center
            un-gap-2
            un-text="sm muted"
          >
            <Doodle
              :name="doc.place.doodle"
              size="1em"
            />
            {{ doc.place.text }}
          </p>
        </div>
        <div
          un-flex
          un-flex-wrap
          un-gap-x-5
          un-gap-y-3
          un-text="base"
          aria-label="Contact"
        >
          <NuxtLink
            v-for="item in doc.reach"
            :key="item.href"
            :to="item.href"
            :aria-label="`${item.label} ${item.handle}`"
            translate="no"
            un-inline-flex
            un-items-center
            un-gap-2
            un-whitespace-nowrap
            class="reach-hit"
            :class="'wry' in item && item.wry
              ? 'text-wry hover:text-colored-ink'
              : 'text-ink hover:text-colored-ink'"
          >
            <svg
              v-if="'brand' in item && item.brand === 'github'"
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="currentColor"
              un-inline-block
              un-shrink-0
              un-size="[1.2em]"
            >
              <path d="M12 .297c-6.63 0-12 5.373-12 12c0 5.303 3.438 9.8 8.205 11.385c.6.113.82-.258.82-.577c0-.285-.01-1.04-.015-2.04c-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729c1.205.084 1.838 1.236 1.838 1.236c1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605c-2.665-.3-5.466-1.332-5.466-5.93c0-1.31.465-2.38 1.235-3.22c-.135-.303-.54-1.523.105-3.176c0 0 1.005-.322 3.3 1.23c.96-.267 1.98-.399 3-.405c1.02.006 2.04.138 3 .405c2.28-1.552 3.285-1.23 3.285-1.23c.645 1.653.24 2.873.12 3.176c.765.84 1.23 1.91 1.23 3.22c0 4.61-2.805 5.625-5.475 5.92c.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286c0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
            <Doodle
              v-else-if="item.doodle"
              :name="item.doodle"
              size="1.2em"
            />
            {{ item.handle }}
          </NuxtLink>
        </div>
      </aside>
    </header>

    <section>
      <CvSectionHead :title="doc.episodes.heading" />
      <CvGroupedEntries :items="doc.episodes.items" />
    </section>

    <section
      un-mt-6
      class="print:break-inside-avoid"
    >
      <CvSectionHead :title="doc.background.heading" />
      <dl
        un-m-0
        un-flex
        un-flex-col
        un-gap-4
      >
        <div
          v-for="item in doc.background.items"
          :key="item.title"
          un-flex
          un-items-baseline
          un-gap-6
        >
          <dt
            un-m-0
            un-w-24
            un-shrink-0
            un-font-mono
            un-tracking-wide
            un-text="xs muted end"
          >
            {{ item.when }}
          </dt>
          <dd
            un-m-0
            un-min-w-0
          >
            <p
              un-m-0
              un-font-semibold
              un-tracking-tight
              un-leading-snug
              un-text="lg ink"
            >
              {{ item.title }}
            </p>
            <p
              un-m-0
              un-mt-1.5
              un-leading-relaxed
              un-text="base muted"
            >
              {{ item.blurb }}
            </p>
          </dd>
        </div>
      </dl>
    </section>

    <section
      un-mt-6
      class="print:break-inside-avoid"
    >
      <CvSectionHead :title="doc.principles.heading" />
      <dl
        un-m-0
        un-grid
        un-grid-cols-2
        un-gap-x-12
      >
        <div
          v-for="(item, i) in doc.principles.items"
          :key="item.title"
          class="print:break-inside-avoid"
          :class="[
            i % 2 ? 'mt-10' : undefined,
          ]"
        >
          <dt
            un-m-0
            un-flex
            un-items-baseline
            un-gap-3
            un-italic
            un-tracking-tight
            un-leading-snug
            un-pb-0.5
            un-text="2xl ink"
          >
            <span
              aria-hidden="true"
              un-inline-flex
              un-items-center
              un-shrink-0
              un-text-colored-ink
            >
              <InkDots
                :seed="item.title"
                :count="1"
              />
            </span>
            {{ item.title }}
          </dt>
          <dd
            un-m-0
            un-mt-2
            un-ml-8
            un-leading-relaxed
            un-text="base muted"
          >
            {{ item.blurb }}
          </dd>
        </div>
      </dl>
    </section>

    <section
      un-mt-6
      class="print:break-inside-avoid"
    >
      <CvSectionHead :title="doc.tools.heading" />
      <dl
        un-m-0
        un-flex
        un-flex-col
        un-gap-2
      >
        <div
          v-for="(group, i) in doc.tools.groups"
          :key="group.label"
          un-flex
          un-items-baseline
          un-gap-6
        >
          <dt
            un-m-0
            un-w-24
            un-shrink-0
            un-font-mono
            un-text="xs end"
            un-tracking-wide
            :style="{ color: `color-mix(in srgb, var(--ink) ${i / Math.max(doc.tools.groups.length - 1, 1) * 100}%, var(--colored-ink))` }"
          >
            {{ group.label }}
          </dt>
          <dd
            un-m-0
            un-flex
            un-flex-wrap
            un-items-baseline
            un-gap-x-5
            un-gap-y-1
            un-text="base ink"
          >
            <span
              v-for="name in group.names"
              :key="name"
            >{{ name }}</span>
          </dd>
        </div>
      </dl>
      <p
        un-m-0
        un-mt-5
        un-text="sm muted"
      >
        {{ doc.tools.after }}
        <NuxtLink
          to="/stack"
          un-text-colored-ink
          un-border="b dashed colored-ink hover:solid"
        >
          {{ doc.tools.stack }}
        </NuxtLink>.
      </p>
    </section>

    <section
      un-mt-6
      class="print:break-inside-avoid"
    >
      <CvSectionHead :title="doc.also.heading" />
      <p
        un-m-0
        un-mb-6
        un-max-w-xl
        un-text="base ink"
      >
        {{ doc.also.lead }}
      </p>
      <div
        un-flex
        un-flex-col
        un-gap-4
        un-max-w-xl
      >
        <p
          v-for="(para, i) in doc.also.paras"
          :key="i"
          un-m-0
          un-text="base muted"
        >
          {{ para }}
        </p>
      </div>
    </section>
  </article>
</template>
