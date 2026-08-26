<script setup lang="ts">
import type { InkGlyphKind } from '~/utils/inkDraw'

definePageMeta({ layout: false })
useHead({ title: 'Contact samples' })

interface SampleLine {
  kind: InkGlyphKind
  label: string
  handle: string
  href?: string
}

const direct: SampleLine[] = [
  {
    kind: 'mail',
    label: 'Email',
    handle: 'hi@froq.me',
    href: 'mailto:hi@froq.me',
  },
  { kind: 'wechat', label: 'WeChat', handle: '@_froq_' },
]

const social: SampleLine[] = [
  {
    kind: 'github',
    label: 'GitHub',
    handle: '@Fro-Q',
    href: 'https://github.com/Fro-Q',
  },
  {
    kind: 'podcast',
    label: 'Podcast',
    handle: '@ToQ',
    href: 'https://www.xiaoyuzhoufm.com/podcast/68fb1be73ffa38fac58d6bf2',
  },
  { kind: 'x', label: 'X', handle: '@…' },
  { kind: 'instagram', label: 'Instagram', handle: '@…' },
  { kind: 'xiaohongshu', label: 'Xiaohongshu', handle: '@…' },
  { kind: 'bluesky', label: 'Bluesky', handle: '@…' },
]

function sampleClick(e: MouseEvent) {
  e.preventDefault()
}
</script>

<template>
  <main class="samples">
    <header class="samples-head">
      <h1>Contact samples</h1>
      <NuxtLink
        to="/contact"
        class="samples-back"
      >back to contact</NuxtLink>
      <p class="samples-note">
        Same glyphs and handles, seven layouts. Links dead on purpose.
      </p>
    </header>

    <!-- A: editorial split, current direction -->
    <section class="sample sample-a">
      <p class="sample-tag">
        A. split rail
      </p>
      <div class="sample-a-grid">
        <div>
          <h2 class="sample-a-title">
            Contact
          </h2>
          <InkRule
            seed="sample-a-contact"
            class="sample-a-rule"
          />
          <ul class="sample-a-direct">
            <li
              v-for="item in direct"
              :key="item.label"
            >
              <a
                class="sample-a-line"
                href="#"
                @click="sampleClick"
              >
                <InkGlyph
                  :seed="`a-${item.label}`"
                  :kind="item.kind"
                  :label="item.label"
                />
                <span class="sample-a-handle">{{ item.handle }}</span>
              </a>
            </li>
          </ul>
        </div>
        <div class="sample-a-social">
          <h2 class="sample-a-title-soft">
            Find me on
          </h2>
          <InkRule
            seed="sample-a-social"
            class="sample-a-rule-soft"
          />
          <ul class="sample-a-social-list">
            <li
              v-for="item in social"
              :key="item.label"
            >
              <a
                class="sample-a-line sample-a-line-soft"
                href="#"
                @click="sampleClick"
              >
                <InkGlyph
                  :seed="`a-${item.label}`"
                  :kind="item.kind"
                  :label="item.label"
                />
                <span class="sample-a-handle-soft">{{ item.handle }}</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- B: one column, scale hierarchy -->
    <section class="sample sample-b">
      <p class="sample-tag">
        B. single column
      </p>
      <div class="sample-b-flow">
        <h2 class="sample-b-title">
          Contact
        </h2>
        <a
          v-for="item in direct"
          :key="item.label"
          class="sample-b-line"
          href="#"
          @click="sampleClick"
        >
          <InkGlyph
            :seed="`b-${item.label}`"
            :kind="item.kind"
            :label="item.label"
          />
          <span class="sample-b-handle">{{ item.handle }}</span>
        </a>
        <p class="sample-b-soft">
          Find me on
        </p>
        <div class="sample-b-social">
          <a
            v-for="item in social"
            :key="item.label"
            class="sample-b-line-soft"
            href="#"
            @click="sampleClick"
          >
            <InkGlyph
              :seed="`b-${item.label}`"
              :kind="item.kind"
              :label="item.label"
            />
            <span>{{ item.handle }}</span>
          </a>
        </div>
      </div>
    </section>

    <!-- C: index list -->
    <section class="sample sample-c">
      <p class="sample-tag">
        C. index list
      </p>
      <div class="sample-c-wrap">
        <div class="sample-c-group">
          <p class="sample-c-group-title">
            Contact
          </p>
          <ol class="sample-c-list">
            <li
              v-for="(item, i) in direct"
              :key="item.label"
            >
              <a
                class="sample-c-line"
                href="#"
                @click="sampleClick"
              >
                <span class="sample-c-no">{{ String(i + 1).padStart(2, '0') }}</span>
                <InkGlyph
                  :seed="`c-${item.label}`"
                  :kind="item.kind"
                  :label="item.label"
                />
                <span class="sample-c-handle">{{ item.handle }}</span>
              </a>
            </li>
          </ol>
        </div>
        <div class="sample-c-group">
          <p class="sample-c-group-title">
            Find me on
          </p>
          <ol
            class="sample-c-list"
            start="3"
          >
            <li
              v-for="(item, i) in social"
              :key="item.label"
            >
              <a
                class="sample-c-line sample-c-line-soft"
                href="#"
                @click="sampleClick"
              >
                <span class="sample-c-no">{{ String(i + 3).padStart(2, '0') }}</span>
                <InkGlyph
                  :seed="`c-${item.label}`"
                  :kind="item.kind"
                  :label="item.label"
                />
                <span class="sample-c-handle">{{ item.handle }}</span>
              </a>
            </li>
          </ol>
        </div>
      </div>
    </section>

    <!-- E: inline prose -->
    <section class="sample sample-e">
      <p class="sample-tag">
        E. inline prose
      </p>
      <div class="sample-e-wrap">
        <p class="sample-e-line">
          Write me at
          <a
            class="sample-e-link sample-e-link-strong"
            href="#"
            data-ink="underline"
            @click="sampleClick"
          >
            <InkGlyph
              seed="e-mail"
              kind="mail"
              label="Email"
            />hi@froq.me</a>,
          or on WeChat
          <a
            class="sample-e-link sample-e-link-strong"
            href="#"
            data-ink="underline"
            @click="sampleClick"
          >
            <InkGlyph
              seed="e-wechat"
              kind="wechat"
              label="WeChat"
            />@_froq_</a>.
        </p>
        <p class="sample-e-line sample-e-line-soft">
          Elsewhere:
          <a
            class="sample-e-link"
            href="#"
            data-ink="underline"
            @click="sampleClick"
          >
            <InkGlyph
              seed="e-github"
              kind="github"
              label="GitHub"
            />@Fro-Q</a>,
          <a
            class="sample-e-link"
            href="#"
            data-ink="underline"
            @click="sampleClick"
          >
            <InkGlyph
              seed="e-podcast"
              kind="podcast"
              label="Podcast"
            />@ToQ</a>
          on the pod,
          <a
            class="sample-e-link sample-e-pending"
            href="#"
            data-ink="underline"
            @click="sampleClick"
          >
            <InkGlyph
              seed="e-x"
              kind="x"
              label="X"
            />@…</a>,
          <a
            class="sample-e-link sample-e-pending"
            href="#"
            data-ink="underline"
            @click="sampleClick"
          >
            <InkGlyph
              seed="e-instagram"
              kind="instagram"
              label="Instagram"
            />@…</a>,
          <a
            class="sample-e-link sample-e-pending"
            href="#"
            data-ink="underline"
            @click="sampleClick"
          >
            <InkGlyph
              seed="e-xiaohongshu"
              kind="xiaohongshu"
              label="Xiaohongshu"
            />@…</a>,
          <a
            class="sample-e-link sample-e-pending"
            href="#"
            data-ink="underline"
            @click="sampleClick"
          >
            <InkGlyph
              seed="e-bluesky"
              kind="bluesky"
              label="Bluesky"
            />@…</a>.
        </p>
      </div>
    </section>

    <!-- F: prose block, contact woven in -->
    <section class="sample sample-f">
      <p class="sample-tag">
        F. prose block
      </p>
      <div class="sample-f-wrap">
        <p class="sample-f-text">
          I'm froQ, a design engineer in Shenzhen. I work where
          interface and implementation meet, mostly on the web.
          The fastest way to reach me is
          <a
            class="sample-f-link"
            href="#"
            data-ink="underline"
            @click="sampleClick"
          >
            <InkGlyph
              seed="f-mail"
              kind="mail"
              label="Email"
            />hi@froq.me</a>;
          for anything quick, WeChat
          <a
            class="sample-f-link"
            href="#"
            data-ink="underline"
            @click="sampleClick"
          >
            <InkGlyph
              seed="f-wechat"
              kind="wechat"
              label="WeChat"
            />@_froq_</a>
          works too.
        </p>
        <p class="sample-f-text sample-f-text-soft">
          Code lives on
          <a
            class="sample-f-link"
            href="#"
            data-ink="underline"
            @click="sampleClick"
          >
            <InkGlyph
              seed="f-github"
              kind="github"
              label="GitHub"
            />@Fro-Q</a>.
          Longer thoughts, spoken, on the podcast
          <a
            class="sample-f-link"
            href="#"
            data-ink="underline"
            @click="sampleClick"
          >
            <InkGlyph
              seed="f-podcast"
              kind="podcast"
              label="Podcast"
            />@ToQ</a>.
          Shorter ones on
          <span class="sample-f-pending">
            <InkGlyph
              seed="f-x"
              kind="x"
              label="X"
            />@…</span>
          and
          <span class="sample-f-pending">
            <InkGlyph
              seed="f-bluesky"
              kind="bluesky"
              label="Bluesky"
            />@…</span>.
        </p>
      </div>
    </section>

    <!-- G: printed page with pencil marginalia -->
    <section class="sample sample-g">
      <p class="sample-tag">
        G. marginalia
      </p>
      <div class="sample-g-page">
        <div class="sample-g-body">
          <p class="sample-f-text">
            I'm froQ, a design engineer in Shenzhen. I work where
            interface and implementation meet, mostly on the web.
            The fastest way to reach me is
            <a
              class="sample-f-link"
              href="#"
              data-ink="underline"
              @click="sampleClick"
            >hi@froq.me</a>;
            for anything quick, WeChat
            <a
              class="sample-f-link"
              href="#"
              data-ink="underline"
              @click="sampleClick"
            >@_froq_</a>
            works too.
          </p>
          <p class="sample-f-text sample-f-text-soft">
            Code lives on
            <a
              class="sample-f-link"
              href="#"
              data-ink="underline"
              @click="sampleClick"
            >@Fro-Q</a>.
            Longer thoughts, spoken, on the podcast
            <a
              class="sample-f-link"
              href="#"
              data-ink="underline"
              @click="sampleClick"
            >@ToQ</a>.
            Shorter ones on
            <span class="sample-f-pending">@…</span>
            and
            <span class="sample-f-pending">@…</span>.
          </p>
        </div>
        <aside
          class="sample-g-margin"
          aria-hidden="true"
        >
          <span class="sample-g-note sample-g-note-1">
            <InkGlyph
              seed="g-mail"
              kind="mail"
              label="Email"
            />
            fastest
          </span>
          <span class="sample-g-arrow sample-g-arrow-1">
            <InkPointer
              seed="g-arrow-1"
              dir="down"
            />
          </span>
          <span class="sample-g-note sample-g-note-2">
            <InkGlyph
              seed="g-wechat"
              kind="wechat"
              label="WeChat"
            />
            quick things
          </span>
          <span class="sample-g-arrow sample-g-arrow-2">
            <InkPointer
              seed="g-arrow-2"
              dir="down"
            />
          </span>
          <span class="sample-g-note sample-g-note-3">
            <InkGlyph
              seed="g-github"
              kind="github"
              label="GitHub"
            />
            <InkGlyph
              seed="g-podcast"
              kind="podcast"
              label="Podcast"
            />
            <InkGlyph
              seed="g-x"
              kind="x"
              label="X"
            />
            <InkGlyph
              seed="g-instagram"
              kind="instagram"
              label="Instagram"
            />
            <InkGlyph
              seed="g-xiaohongshu"
              kind="xiaohongshu"
              label="Xiaohongshu"
            />
            <InkGlyph
              seed="g-bluesky"
              kind="bluesky"
              label="Bluesky"
            />
          </span>
        </aside>
      </div>
    </section>

    <!-- D: glyph constellation -->
    <section class="sample sample-d">
      <p class="sample-tag">
        D. constellation
      </p>
      <div class="sample-d-wrap">
        <a
          class="sample-d-mail"
          href="#"
          @click="sampleClick"
        >
          <InkGlyph
            seed="d-mail"
            kind="mail"
            label="Email"
          />
          <span>hi@froq.me</span>
        </a>
        <a
          class="sample-d-wechat"
          href="#"
          @click="sampleClick"
        >
          <InkGlyph
            seed="d-wechat"
            kind="wechat"
            label="WeChat"
          />
          <span>@_froq_</span>
        </a>
        <p class="sample-d-soft">
          Find me on
        </p>
        <ul class="sample-d-cloud">
          <li
            v-for="(item, i) in social"
            :key="item.label"
            :class="`sample-d-pos-${i}`"
          >
            <a
              class="sample-d-line"
              href="#"
              @click="sampleClick"
            >
              <InkGlyph
                :seed="`d-${item.label}`"
                :kind="item.kind"
                :label="item.label"
              />
              <span>{{ item.handle }}</span>
            </a>
          </li>
        </ul>
      </div>
    </section>
  </main>
</template>

<style scoped>
.samples {
  box-sizing: border-box;
  width: min(64rem, calc(100% - 48px));
  margin: 0 auto;
  padding: clamp(2.5rem, 8vh, 4rem) 0 6rem;
}

.samples-head {
  margin-bottom: clamp(2.5rem, 7vh, 4rem);
}

.samples-head h1 {
  margin: 0;
  font-family: var(--font-serif);
  font-size: clamp(2rem, 4vw, 2.6rem);
  font-weight: 500;
  letter-spacing: -0.04em;
}

.samples-back {
  display: inline-block;
  margin-top: 0.5rem;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--colored-ink);
  text-decoration: none;
}

.samples-note {
  margin: 0.5rem 0 0;
  font-size: 0.85em;
  color: var(--muted);
}

.sample {
  margin-top: clamp(3rem, 9vh, 5rem);
}

.sample-tag {
  margin: 0 0 1.25rem;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.06em;
  color: var(--muted);
}

.sample a {
  color: inherit;
  text-decoration: none;
}

.sample a:hover .sample-a-handle,
.sample a:hover .sample-b-handle,
.sample a:hover .sample-c-handle,
.sample a:hover .sample-d-line span:last-child,
.sample a:hover .sample-d-mail span,
.sample a:hover .sample-d-wechat span {
  color: var(--colored-ink);
}

/* A ----------------------------------------------------------------------- */

.sample-a-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.8fr);
  gap: clamp(2.5rem, 6vw, 4rem);
  align-items: start;
}

.sample-a-title {
  margin: 0;
  font-family: var(--font-serif);
  font-size: clamp(2.1rem, 4.4vw, 2.9rem);
  font-weight: 500;
  letter-spacing: -0.045em;
}

.sample-a-title-soft {
  margin: 0;
  font-family: var(--font-serif);
  font-size: 1.25rem;
  font-style: italic;
  font-weight: 400;
}

.sample-a-rule {
  max-width: 5rem;
  margin: 0.65rem 0 1.6rem;
}

.sample-a-rule-soft {
  max-width: 3.5rem;
  margin: 0.55rem 0 1.2rem;
}

.sample-a-direct,
.sample-a-social-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

.sample-a-social {
  padding-top: clamp(3rem, 8vh, 5rem);
}

.sample-a-social-list {
  gap: 0.8rem;
}

.sample-a-line {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
}

.sample-a-line :deep(.ink-glyph) {
  color: var(--colored-ink);
}

.sample-a-line :deep(.ink-glyph svg) {
  width: 1.8em;
  height: 1.8em;
}

.sample-a-line-soft :deep(.ink-glyph svg) {
  width: 1.35em;
  height: 1.35em;
}

.sample-a-handle {
  font-family: var(--font-serif);
  font-size: clamp(1.5rem, 2.9vw, 1.95rem);
  font-style: italic;
  letter-spacing: -0.03em;
}

.sample-a-handle-soft {
  font-family: var(--font-serif);
  font-size: 1.05em;
  font-style: italic;
}

/* B ----------------------------------------------------------------------- */

.sample-b-flow {
  max-width: 30rem;
}

.sample-b-title {
  margin: 0 0 1.1rem;
  font-family: var(--font-serif);
  font-size: clamp(2rem, 4vw, 2.6rem);
  font-weight: 500;
  letter-spacing: -0.04em;
}

.sample-b-line {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.45rem 0;
}

.sample-b-line :deep(.ink-glyph) {
  color: var(--colored-ink);
}

.sample-b-line :deep(.ink-glyph svg) {
  width: 1.9em;
  height: 1.9em;
}

.sample-b-handle {
  font-family: var(--font-serif);
  font-size: clamp(1.6rem, 3.1vw, 2.1rem);
  font-style: italic;
  letter-spacing: -0.03em;
}

.sample-b-soft {
  margin: 2.4rem 0 0.9rem;
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 1.1rem;
  color: var(--muted);
}

.sample-b-social {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.85rem 1.5rem;
}

.sample-b-line-soft {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 1em;
}

.sample-b-line-soft :deep(.ink-glyph) {
  color: var(--colored-ink);
}

.sample-b-line-soft :deep(.ink-glyph svg) {
  width: 1.3em;
  height: 1.3em;
}

/* C ----------------------------------------------------------------------- */

.sample-c-wrap {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: clamp(2rem, 5vw, 3.5rem);
}

.sample-c-group-title {
  margin: 0 0 0.6rem;
  font-family: var(--font-serif);
  font-size: 1.35rem;
  font-style: italic;
}

.sample-c-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.sample-c-line {
  display: grid;
  grid-template-columns: 2.2rem auto 1fr;
  align-items: center;
  gap: 0.75rem;
  padding: 0.55rem 0;
  border-top: 1px solid color-mix(in oklab, currentColor 16%, transparent);
}

.sample-c-no {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--muted);
}

.sample-c-line :deep(.ink-glyph) {
  color: var(--colored-ink);
}

.sample-c-handle {
  font-family: var(--font-serif);
  font-size: 1.35rem;
  font-style: italic;
  letter-spacing: -0.02em;
}

.sample-c-line-soft .sample-c-handle {
  font-size: 1.05rem;
}

/* E ----------------------------------------------------------------------- */

.sample-e-wrap {
  max-width: 34rem;
}

.sample-e-line {
  margin: 0;
  font-family: var(--font-serif);
  font-size: clamp(1.6rem, 3.4vw, 2.2rem);
  line-height: 1.45;
  letter-spacing: -0.025em;
  text-wrap: pretty;
}

.sample-e-line-soft {
  margin-top: 1.4rem;
  font-size: clamp(1.15rem, 2.2vw, 1.4rem);
  font-style: italic;
  color: color-mix(in oklab, currentColor 78%, transparent);
}

.sample-e-link {
  display: inline-flex;
  align-items: baseline;
  gap: 0.32em;
  font-style: italic;
  white-space: nowrap;
}

.sample-e-link-strong {
  color: var(--colored-ink);
}

.sample-e-link :deep(.ink-glyph) {
  align-self: center;
  color: var(--colored-ink);
  margin-right: 0.05em;
}

.sample-e-link :deep(.ink-glyph svg) {
  width: 1.05em;
  height: 1.05em;
}

.sample-e-line-soft .sample-e-link :deep(.ink-glyph svg) {
  width: 1em;
  height: 1em;
}

.sample-e-pending {
  opacity: 0.55;
}

/* F ----------------------------------------------------------------------- */

.sample-f-wrap {
  max-width: 36rem;
}

.sample-f-text {
  margin: 0;
  font-family: var(--font-serif);
  font-size: clamp(1.25rem, 2.4vw, 1.55rem);
  line-height: 1.75;
  letter-spacing: -0.015em;
  text-wrap: pretty;
}

.sample-f-text + .sample-f-text {
  margin-top: 1.5rem;
}

.sample-f-text-soft {
  font-size: clamp(1.05rem, 2vw, 1.25rem);
  font-style: italic;
  color: color-mix(in oklab, currentColor 78%, transparent);
}

.sample-f-link {
  display: inline-flex;
  align-items: baseline;
  gap: 0.3em;
  font-style: italic;
  color: var(--colored-ink);
  white-space: nowrap;
}

.sample-f-link :deep(.ink-glyph),
.sample-f-pending :deep(.ink-glyph) {
  align-self: center;
  color: var(--colored-ink);
}

.sample-f-link :deep(.ink-glyph svg) {
  width: 1.05em;
  height: 1.05em;
}

.sample-f-pending {
  display: inline-flex;
  align-items: baseline;
  gap: 0.3em;
  font-style: italic;
  white-space: nowrap;
  opacity: 0.5;
}

.sample-f-pending :deep(.ink-glyph svg) {
  width: 1em;
  height: 1em;
}

/* G ----------------------------------------------------------------------- */

.sample-g-page {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 36rem) minmax(0, 1fr);
  gap: clamp(1.5rem, 4vw, 3rem);
}

.sample-g-margin {
  position: relative;
  font-family: var(--font-script);
  font-size: 0.95rem;
  color: var(--colored-ink);
}

.sample-g-note {
  position: absolute;
  display: inline-flex;
  align-items: center;
  gap: 0.45em;
  white-space: nowrap;
}

.sample-g-note :deep(.ink-glyph svg) {
  width: 1.15em;
  height: 1.15em;
}

.sample-g-note-1 { top: 4.2rem; left: 0; }
.sample-g-note-2 { top: 8.6rem; left: 2.4rem; }

.sample-g-note-3 {
  top: 15rem;
  left: 0.5rem;
  display: flex;
  gap: 0.6em;
  opacity: 0.8;
}

.sample-g-note-3 :deep(.ink-glyph svg) {
  width: 1.3em;
  height: 1.3em;
}

.sample-g-arrow {
  position: absolute;
  color: var(--colored-ink);
  opacity: 0.85;
}

.sample-g-arrow-1 {
  top: 2.1rem;
  left: 0.6rem;
  transform: rotate(8deg);
}

.sample-g-arrow-2 {
  top: 6.4rem;
  left: 3.1rem;
  transform: rotate(-6deg);
}

.sample-g-arrow :deep(.ink-pointer.is-tall) {
  width: 1.4em;
  height: 2.5em;
}

/* D ----------------------------------------------------------------------- */

.sample-d-wrap {
  position: relative;
  min-height: 24rem;
  max-width: 44rem;
}

.sample-d-mail {
  position: absolute;
  top: 0;
  left: 0;
  display: inline-flex;
  align-items: center;
  gap: 0.7rem;
  font-family: var(--font-serif);
  font-style: italic;
  font-size: clamp(1.7rem, 3.4vw, 2.3rem);
  letter-spacing: -0.03em;
}

.sample-d-wechat {
  position: absolute;
  top: 4.2rem;
  left: clamp(4rem, 18%, 8rem);
  display: inline-flex;
  align-items: center;
  gap: 0.7rem;
  font-family: var(--font-serif);
  font-style: italic;
  font-size: clamp(1.3rem, 2.6vw, 1.75rem);
}

.sample-d-mail :deep(.ink-glyph),
.sample-d-wechat :deep(.ink-glyph),
.sample-d-line :deep(.ink-glyph) {
  color: var(--colored-ink);
}

.sample-d-mail :deep(.ink-glyph svg) {
  width: 1.9em;
  height: 1.9em;
}

.sample-d-wechat :deep(.ink-glyph svg) {
  width: 1.6em;
  height: 1.6em;
}

.sample-d-soft {
  margin: 0;
  position: absolute;
  top: 10.5rem;
  left: 0;
  font-family: var(--font-serif);
  font-style: italic;
  color: var(--muted);
}

.sample-d-cloud {
  margin: 0;
  padding: 0;
  list-style: none;
}

.sample-d-cloud > li {
  position: absolute;
}

.sample-d-line {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 1em;
}

.sample-d-line :deep(.ink-glyph svg) {
  width: 1.35em;
  height: 1.35em;
}

.sample-d-pos-0 { top: 13rem; left: 0; }
.sample-d-pos-1 { top: 12rem; left: 32%; }
.sample-d-pos-2 { top: 14.5rem; left: 58%; }
.sample-d-pos-3 { top: 16.5rem; left: 12%; }
.sample-d-pos-4 { top: 17.5rem; left: 44%; }
.sample-d-pos-5 { top: 20rem; left: 68%; }

/* mobile ------------------------------------------------------------------ */

@media (max-width: 759px) {
  .samples {
    width: calc(100% - 32px);
  }

  .sample-a-grid,
  .sample-c-wrap,
  .sample-g-page {
    grid-template-columns: 1fr;
  }

  .sample-a-social {
    padding-top: 0;
  }

  .sample-b-social {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .sample-d-wrap {
    min-height: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.9rem;
  }

  .sample-d-mail,
  .sample-d-wechat,
  .sample-d-soft,
  .sample-d-cloud > li {
    position: static;
  }

  .sample-d-cloud {
    display: flex;
    flex-wrap: wrap;
    gap: 0.8rem 1.4rem;
  }

  .sample-g-margin {
    display: none;
  }
}
</style>
