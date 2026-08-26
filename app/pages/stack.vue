<script setup lang="ts">
useHead({ title: 'Stack' })

type Level = 'fluent' | 'daily' | 'used' | 'learning' | 'curious'

const levelNote: Record<Level, string> = {
  fluent: 'fluent',
  daily: 'daily',
  used: 'used',
  learning: 'learning',
  curious: 'curious',
}

const scraps: {
  name: string
  level: Level
  detail: string
}[] = [
  { name: 'Nuxt', level: 'fluent', detail: 'Where the site actually lives.' },
  { name: 'Vue', level: 'fluent', detail: 'The grain of every page.' },
  { name: 'TypeScript', level: 'daily', detail: 'Keeps the edges honest.' },
  { name: 'UnoCSS', level: 'daily', detail: 'Atomic ink on the paper.' },
  { name: 'Nuxt Content', level: 'daily', detail: 'Posts and corpus as files.' },
  { name: 'Cloudflare Pages', level: 'daily', detail: 'Where the paper is hung.' },
  { name: 'Workers', level: 'used', detail: 'Small edge scripts, no ceremony.' },
  { name: 'Durable Objects', level: 'used', detail: 'Who is in the room.' },
  { name: 'roughjs', level: 'used', detail: 'Seeded wobble for marks.' },
  { name: 'EB Garamond', level: 'daily', detail: 'The body voice.' },
  { name: 'YshiPen', level: 'curious', detail: 'A hand for Chinese ink.' },
  { name: 'Pinia', level: 'used', detail: 'State when a page needs memory.' },
  { name: 'Vitest', level: 'learning', detail: 'Still sharpening the knife.' },
  { name: 'Astro', level: 'curious', detail: 'Interesting, not the desk yet.' },
  { name: 'Svelte', level: 'curious', detail: 'Read more than written.' },
]

const groups: { level: Level, label: string }[] = [
  { level: 'fluent', label: 'Fluent' },
  { level: 'daily', label: 'Daily' },
  { level: 'used', label: 'Used' },
  { level: 'learning', label: 'Learning' },
  { level: 'curious', label: 'Curious' },
]
</script>

<template>
  <section class="stack">
    <header class="stack-head">
      <h1 class="stack-title">
        How this is built
      </h1>
      <InkRule
        seed="stack"
        class="stack-rule"
      />
      <p class="stack-lead">
        Not a résumé. A desk drawer of tools —
        what I reach for, what I have held, what I am still learning to hold.
      </p>
    </header>

    <div class="stack-page">
      <div class="stack-body">
        <section
          v-for="group in groups"
          :key="group.level"
          class="stack-group"
        >
          <h2 class="stack-group-title">
            {{ group.label }}
          </h2>
          <ul class="stack-list">
            <li
              v-for="item in scraps.filter(s => s.level === group.level)"
              :key="item.name"
              class="stack-row"
            >
              <span class="stack-name">{{ item.name }}</span>
              <span
                class="stack-leader"
                aria-hidden="true"
              />
              <span class="stack-level">{{ levelNote[item.level] }}</span>
              <span class="stack-detail">{{ item.detail }}</span>
            </li>
          </ul>
        </section>
      </div>

      <aside
        class="stack-margin"
        aria-hidden="true"
      >
        <p class="stack-margin-note">
          fluent → curious
        </p>
        <p class="stack-margin-note">
          no ranks, only habits
        </p>
      </aside>
    </div>
  </section>
</template>

<style scoped>
.stack {
  box-sizing: border-box;
  width: min(64rem, calc(100% - 48px));
  margin: 0 auto;
  padding: clamp(2.25rem, 8vh, 4.5rem) 0 5rem;
}

.stack-title {
  margin: 0;
  font-family: var(--font-serif);
  font-size: clamp(2rem, 4.2vw, 2.7rem);
  font-weight: 500;
  letter-spacing: -0.04em;
  line-height: 1.12;
  text-wrap: balance;
}

.stack-rule {
  display: block;
  max-width: 5.25rem;
  margin: 0.65rem 0 0;
}

.stack-lead {
  margin: 1.5rem 0 0;
  max-width: 36rem;
  font-family: var(--font-serif);
  font-size: clamp(1.05rem, 1.9vw, 1.22rem);
  font-style: italic;
  line-height: 1.65;
  color: color-mix(in oklab, currentColor 78%, transparent);
}

.stack-page {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(10rem, 13rem);
  gap: clamp(1.75rem, 4vw, 3.25rem);
  margin-top: 2.5rem;
  align-items: start;
}

.stack-group + .stack-group {
  margin-top: 2.4rem;
}

.stack-group-title {
  margin: 0 0 0.85rem;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 400;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.stack-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.stack-row {
  display: grid;
  grid-template-columns: auto minmax(1.5rem, 1fr) auto;
  grid-template-areas:
    'name leader level'
    'detail detail detail';
  column-gap: 0.7rem;
  align-items: baseline;
  padding-block: 0.55rem;
  border-bottom: 1px solid color-mix(in srgb, var(--line) 70%, transparent);
}

.stack-name {
  grid-area: name;
  font-family: var(--font-serif);
  font-size: 1.2em;
  letter-spacing: -0.02em;
  color: var(--ink);
}

.stack-leader {
  grid-area: leader;
  height: 1px;
  align-self: center;
  background-image: repeating-linear-gradient(
    90deg,
    var(--line) 0 1.5px,
    transparent 1.5px 5px
  );
  opacity: 0.85;
  transform: translateY(-0.08em);
}

.stack-level {
  grid-area: level;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.04em;
  color: var(--colored-ink);
}

.stack-detail {
  grid-area: detail;
  margin-top: 0.2rem;
  font-family: var(--font-serif);
  font-size: 0.95em;
  font-style: italic;
  line-height: 1.45;
  color: color-mix(in oklab, currentColor 72%, transparent);
}

.stack-margin {
  padding-top: 0.35rem;
  color: var(--colored-ink);
  font-family: var(--font-serif);
  font-size: 0.98rem;
  font-style: italic;
}

.stack-margin-note {
  margin: 0 0 1rem;
  opacity: 0.85;
}

@media (max-width: 759px) {
  .stack {
    width: calc(100% - 32px);
  }

  .stack-page {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .stack-margin {
    order: -1;
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem 1.25rem;
  }

  .stack-margin-note {
    margin: 0;
  }
}
</style>
