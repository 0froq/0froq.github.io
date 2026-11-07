<template>
  <code class="prose-inline-code">
    <slot />
  </code>
</template>

<style scoped>
.prose-inline-code {
  font-family: var(--font-mono);
  font-size: 0.82em;
  padding: 0.12em 0.28em;
  background: color-mix(in srgb, var(--ink) 6%, var(--paper));
}

/* preset-typography renders literal backtick marks around inline code. */
.prose-inline-code::before,
.prose-inline-code::after {
  content: none;
}

pre .prose-inline-code {
  padding: 0;
  background: none;
}
</style>
