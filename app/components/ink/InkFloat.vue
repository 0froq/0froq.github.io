<template>
  <span class="ink-float">
    <span
      class="ink-float-glass"
      aria-hidden="true"
    />
    <span class="ink-float-body">
      <slot />
    </span>
  </span>
</template>

<style scoped>
.ink-float {
  position: relative;
  display: inline-flex;
  isolation: isolate;
  max-width: calc(100vw - 16px);
}

.ink-float-glass {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background: var(--float);
  border-bottom: 1px solid var(--muted);
  box-shadow:
    0 0 12px 2px var(--float-shadow),
    0 8px 20px var(--float-shadow);
  backdrop-filter: blur(6px);
}

.ink-float-body {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.6rem;
  font-size: 16px;
}
</style>
