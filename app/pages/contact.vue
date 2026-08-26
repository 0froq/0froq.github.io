<script setup lang="ts">
useHead({ title: 'Contact' })

const copied = ref('')
let copyTimer: ReturnType<typeof setTimeout> | undefined

async function copyWechat() {
  try {
    await navigator.clipboard.writeText('_froq_')
    copied.value = 'WeChat'
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
  <section class="reach">
    <header class="reach-head">
      <h1 class="reach-title">
        Contact
      </h1>
      <InkRule
        seed="reach-contact"
        class="reach-rule"
      />
    </header>

    <div class="reach-page">
      <div class="reach-body">
        <p>
          Email for anything that needs a thread:
          <a
            class="reach-link"
            href="mailto:hi@froq.me"
            data-ink="underline"
            data-hover-ink="mark"
            aria-label="Email hi@froq.me"
          >
            <span aria-hidden="true">
              <InkGlyph
                seed="body-mail"
                kind="mail"
                label="Email"
              />
            </span>
            <span translate="no">hi@froq.me</span>
          </a>.
          A few lines:
          <button
            type="button"
            class="reach-link"
            data-ink="underline"
            data-hover-ink="mark"
            aria-label="Copy WeChat @_froq_"
            @click="copyWechat"
          >
            <span aria-hidden="true">
              <InkGlyph
                seed="body-wechat"
                kind="wechat"
                label="WeChat"
              />
            </span>
            <span translate="no">@_froq_</span>
          </button>.
          I keep UTC+8. English or Chinese is fine.
          Replies usually land within a day; weekends are slower.
        </p>
        <p class="reach-soft">
          Public posts live on
          <a
            class="reach-link"
            href="https://github.com/Fro-Q"
            rel="noreferrer"
            target="_blank"
            data-ink="underline"
            data-hover-ink="mark"
            aria-label="GitHub @Fro-Q"
          >
            <span aria-hidden="true">
              <InkGlyph
                seed="body-github"
                kind="github"
                label="GitHub"
              />
            </span>
            <span translate="no">@Fro-Q</span>
          </a>
          and the podcast
          <a
            class="reach-link"
            href="https://www.xiaoyuzhoufm.com/podcast/68fb1be73ffa38fac58d6bf2"
            rel="noreferrer"
            target="_blank"
            data-ink="underline"
            data-hover-ink="mark"
            aria-label="Podcast @ToQ"
          >
            <span aria-hidden="true">
              <InkGlyph
                seed="body-podcast"
                kind="podcast"
                label="Podcast"
              />
            </span>
            <span translate="no">@ToQ</span>
          </a>.
          The other accounts are for looking, not for DMs.
        </p>
        <p
          v-if="copied"
          class="reach-hint"
          aria-live="polite"
        >
          {{ copied }} copied.
        </p>
      </div>

      <aside class="reach-margin">
        <a
          class="reach-margin-link"
          href="mailto:hi@froq.me"
          data-ink="underline"
          data-hover-ink="mark"
          aria-label="Email hi@froq.me"
        >
          <span
            class="reach-margin-glyph"
            aria-hidden="true"
          >
            <InkGlyph
              seed="margin-mail"
              kind="mail"
              label="Email"
            />
          </span>
          <span>inbox</span>
        </a>

        <button
          type="button"
          class="reach-margin-link"
          data-ink="underline"
          data-hover-ink="mark"
          aria-label="Copy WeChat @_froq_"
          @click="copyWechat"
        >
          <span
            class="reach-margin-glyph"
            aria-hidden="true"
          >
            <InkGlyph
              seed="margin-wechat"
              kind="wechat"
              label="WeChat"
            />
          </span>
          <span>short ping</span>
        </button>

        <p class="reach-margin-meta">
          <span
            class="reach-margin-glyph"
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

        <div class="reach-glyphs">
          <a
            class="reach-glyph-link"
            href="https://github.com/Fro-Q"
            rel="noreferrer"
            target="_blank"
            data-ink="underline"
            data-hover-ink="mark"
            aria-label="GitHub @Fro-Q"
          >
            <InkGlyph
              seed="margin-github"
              kind="github"
              label="GitHub"
            />
          </a>
          <a
            class="reach-glyph-link"
            href="https://www.xiaoyuzhoufm.com/podcast/68fb1be73ffa38fac58d6bf2"
            rel="noreferrer"
            target="_blank"
            data-ink="underline"
            data-hover-ink="mark"
            aria-label="Podcast @ToQ"
          >
            <InkGlyph
              seed="margin-podcast"
              kind="podcast"
              label="Podcast"
            />
          </a>
          <span
            class="reach-glyph-pending"
            aria-label="X handle pending"
          >
            <InkGlyph
              seed="margin-x"
              kind="x"
              label="X"
            />
          </span>
          <span
            class="reach-glyph-pending"
            aria-label="Instagram handle pending"
          >
            <InkGlyph
              seed="margin-instagram"
              kind="instagram"
              label="Instagram"
            />
          </span>
          <span
            class="reach-glyph-pending"
            aria-label="Xiaohongshu handle pending"
          >
            <InkGlyph
              seed="margin-xiaohongshu"
              kind="xiaohongshu"
              label="Xiaohongshu"
            />
          </span>
          <span
            class="reach-glyph-pending"
            aria-label="Bluesky handle pending"
          >
            <InkGlyph
              seed="margin-bluesky"
              kind="bluesky"
              label="Bluesky"
            />
          </span>
        </div>
      </aside>
    </div>
  </section>
</template>

<style scoped>
.reach {
  box-sizing: border-box;
  width: min(68rem, calc(100% - 48px));
  margin: 0 auto;
  padding: clamp(2.25rem, 8vh, 4.5rem) 0 5rem;
}

.reach-title {
  margin: 0;
  font-family: var(--font-serif);
  font-size: clamp(2rem, 4.2vw, 2.7rem);
  font-weight: 500;
  letter-spacing: -0.04em;
  line-height: 1.12;
  text-wrap: balance;
}

.reach-rule {
  display: block;
  max-width: 5.25rem;
  margin: 0.65rem 0 0;
}

.reach-page {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(14rem, 17rem);
  gap: clamp(2rem, 5vw, 3.75rem);
  margin-top: 1.75rem;
  align-items: start;
}

.reach-body {
  max-width: 46rem;
}

.reach-body p {
  margin: 0;
  font-family: var(--font-serif);
  font-size: clamp(1.22rem, 2.2vw, 1.48rem);
  line-height: 1.72;
  letter-spacing: -0.012em;
  text-wrap: pretty;
}

.reach-body p + p {
  margin-top: 1.35rem;
}

.reach-soft {
  font-size: clamp(1.05rem, 1.9vw, 1.22rem);
  font-style: italic;
  color: color-mix(in oklab, currentColor 78%, transparent);
}

.reach-link {
  display: inline;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--colored-ink);
  font: inherit;
  font-style: italic;
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

/* Size a touch over cap-height; sit on the text baseline.
   Negative align offsets SVG viewBox padding so glyph strokes
   (esp. github chin) land on the baseline of mixed-case handles. */
.reach-link > [aria-hidden='true'] {
  display: inline-block;
  width: 0.78em;
  height: 0.78em;
  width: 1.15cap;
  height: 1.15cap;
  margin-right: 0.28em;
  vertical-align: -0.18em;
  vertical-align: -0.26cap;
  line-height: 0;
  overflow: visible;
}

.reach-link :deep(.ink-glyph) {
  display: block;
  width: 100%;
  height: 100%;
  color: var(--colored-ink);
}

.reach-link :deep(.ink-glyph svg) {
  display: block;
  width: 100%;
  height: 100%;
}

.reach-link:focus-visible {
  outline: 1px solid var(--colored-ink);
  outline-offset: 3px;
}

.reach-link:active {
  transform: translateY(1px);
}

.reach-hint {
  margin-top: 1.15rem;
  font-family: var(--font-mono);
  font-size: 11px;
  font-style: normal;
  letter-spacing: 0.03em;
  color: var(--muted);
}

.reach-margin {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1.15rem;
  padding-top: 0.2rem;
  color: var(--colored-ink);
  font-family: var(--font-serif);
  font-size: 1.12rem;
  font-style: italic;
  line-height: 1.35;
}

.reach-margin-link {
  display: inline-flex;
  align-items: center;
  gap: 0.45em;
  width: fit-content;
  max-width: 100%;
  margin: 0;
  padding: 0.15em 0.1em;
  border: 0;
  background: transparent;
  color: var(--colored-ink);
  font: inherit;
  font-style: italic;
  text-decoration: none;
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.reach-margin-link:focus-visible {
  outline: 1px solid var(--colored-ink);
  outline-offset: 3px;
}

.reach-margin-link:active {
  transform: translateY(1px);
}

.reach-margin-glyph {
  display: inline-flex;
  flex: none;
  width: 1.25em;
  height: 1.25em;
  line-height: 0;
}

.reach-margin-link :deep(.ink-glyph) {
  display: block;
  width: 100%;
  height: 100%;
}

.reach-margin-link :deep(.ink-glyph svg) {
  display: block;
  width: 100%;
  height: 100%;
}

.reach-margin-meta {
  display: inline-flex;
  align-items: center;
  gap: 0.45em;
  margin: 0.2rem 0 0;
  color: var(--colored-ink);
  opacity: 0.85;
}

.reach-margin-meta :deep(.ink-glyph) {
  display: block;
  width: 100%;
  height: 100%;
}

.reach-margin-meta :deep(.ink-glyph svg) {
  display: block;
  width: 100%;
  height: 100%;
}

.reach-glyphs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.85em 1.05em;
  margin-top: 0.15rem;
  max-width: 13rem;
}

.reach-glyph-link,
.reach-glyph-pending {
  display: inline-flex;
  width: 1.35em;
  height: 1.35em;
  color: var(--colored-ink);
  text-decoration: none;
}

.reach-glyph-link:focus-visible {
  outline: 1px solid var(--colored-ink);
  outline-offset: 3px;
}

.reach-glyph-pending {
  opacity: 0.45;
  pointer-events: none;
}

.reach-glyph-link :deep(.ink-glyph),
.reach-glyph-pending :deep(.ink-glyph) {
  display: block;
  width: 100%;
  height: 100%;
}

.reach-glyph-link :deep(.ink-glyph svg),
.reach-glyph-pending :deep(.ink-glyph svg) {
  display: block;
  width: 100%;
  height: 100%;
}

@media (max-width: 759px) {
  .reach {
    width: calc(100% - 32px);
  }

  .reach-page {
    display: flex;
    flex-direction: column;
    gap: 1.75rem;
  }
}
</style>
