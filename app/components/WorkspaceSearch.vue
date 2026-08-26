<script setup lang="ts">
const query = ref('')
const engines = [
  {
    id: 'g',
    name: 'Google',
    href: (q: string) => `https://www.google.com/search?q=${encodeURIComponent(q)}`,
  },
  {
    id: 'b',
    name: 'Bing',
    href: (q: string) => `https://www.bing.com/search?q=${encodeURIComponent(q)}`,
  },
  {
    id: 'd',
    name: 'DuckDuckGo',
    href: (q: string) => `https://duckduckgo.com/?q=${encodeURIComponent(q)}`,
  },
] as const

type EngineId = typeof engines[number]['id']
const engine = ref<EngineId>('g')

const parsed = computed(() => {
  const raw = query.value.trim()
  const match = raw.match(/^([gbd])\s+(.+)$/i)
  if (match) {
    return {
      engine: match[1]!.toLowerCase() as EngineId,
      q: match[2]!.trim(),
    }
  }
  return { engine: engine.value, q: raw }
})

const canSearch = computed(() => parsed.value.q.length > 0)

function search() {
  if (!canSearch.value)
    return
  const target = engines.find(item => item.id === parsed.value.engine) ?? engines[0]
  window.open(target.href(parsed.value.q), '_blank', 'noreferrer')
}

function onSubmit(event: Event) {
  event.preventDefault()
  search()
}
</script>

<template>
  <form
    class="workspace-search"
    @submit="onSubmit"
  >
    <div class="workspace-search-row">
      <input
        id="workspace-q"
        v-model="query"
        type="search"
        name="q"
        autocomplete="off"
        spellcheck="false"
        aria-label="Web search"
        placeholder="Search the web…"
      >
      <button
        type="submit"
        :disabled="!canSearch"
      >
        go
      </button>
    </div>
    <div class="workspace-search-engines">
      <button
        v-for="item in engines"
        :key="item.id"
        type="button"
        :data-on="engine === item.id ? '' : undefined"
        :aria-pressed="engine === item.id"
        @click="engine = item.id"
      >
        {{ item.id }}
      </button>
    </div>
  </form>
</template>

<style scoped>
.workspace-search {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.workspace-search-row {
  display: flex;
  align-items: baseline;
  gap: 0.85rem;
  border-bottom: 1px solid var(--line);
}

.workspace-search-row input {
  flex: 1 1 auto;
  min-width: 0;
  margin: 0;
  padding: 0.55rem 0;
  border: 0;
  background: transparent;
  color: var(--ink);
  font-family: var(--font-serif);
  font-size: 1.2em;
  letter-spacing: -0.02em;
  outline: none;
}

.workspace-search-row input::placeholder {
  color: color-mix(in srgb, var(--muted) 75%, transparent);
}

.workspace-search-row button {
  margin: 0;
  padding: 0.55rem 0;
  border: 0;
  background: transparent;
  color: var(--colored-ink);
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.04em;
  cursor: pointer;
}

.workspace-search-row button:disabled {
  color: var(--muted);
  cursor: default;
}

.workspace-search-engines {
  display: flex;
  gap: 0.85rem;
}

.workspace-search-engines button {
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--muted);
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.06em;
  text-transform: lowercase;
  cursor: pointer;
}

.workspace-search-engines button[data-on] {
  color: var(--colored-ink);
}
</style>
