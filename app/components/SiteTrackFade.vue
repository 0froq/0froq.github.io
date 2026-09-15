<script setup lang="ts">
withDefaults(defineProps<{
  edge: 'top' | 'bottom'
}>(), {})
</script>

<template>
  <div
    class="site-track-fade"
    :data-edge="edge"
    un-absolute
    un-left-0
    un-right-0
    un-z-20
    un-pointer-events-none
    aria-hidden="true"
  />
</template>

<style scoped>
.site-track-fade[data-edge='top'] {
  top: 0;
  height: var(--track-fade-top, calc(var(--site-chrome) + 3.5rem));
  background: linear-gradient(
    to bottom,
    var(--paper) 0,
    var(--paper) var(--site-chrome),
    transparent 100%
  );
}

.site-track-fade[data-edge='bottom'] {
  bottom: 0;
  height: var(--track-fade-bottom, calc(var(--site-footer) + 3.5rem));
  background: linear-gradient(
    to top,
    var(--paper) 0,
    var(--paper) var(--track-fade-solid-bottom, var(--site-footer)),
    transparent 100%
  );
}
</style>
