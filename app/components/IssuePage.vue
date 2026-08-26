<script setup lang="ts">
const transition = useIssuePageTransition()
</script>

<template>
  <NuxtPage :transition="transition" />
</template>

<style>
/* Vue applies these names to the page root; they cannot live on this template. */
.issue-sheet-enter-active,
.issue-sheet-leave-active {
  transition:
    opacity 280ms var(--ease-out),
    transform 280ms var(--ease-out);
}

.issue-sheet-leave-active {
  transition-duration: 200ms;
}

.issue-sheet-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.issue-sheet-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

::view-transition-group(*),
::view-transition-old(*),
::view-transition-new(*) {
  mix-blend-mode: normal;
}

::view-transition-image-pair(*) {
  isolation: none;
}

::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 220ms;
  animation-timing-function: linear;
}

::view-transition-old(issue-sheet),
::view-transition-new(issue-sheet) {
  animation-duration: 380ms;
  animation-timing-function: var(--ease-out);
}

::view-transition-old(issue-sheet) {
  animation-name: issue-sheet-out-up;
}

::view-transition-new(issue-sheet) {
  animation-name: issue-sheet-in-up;
}

@keyframes issue-sheet-out-up {
  to {
    opacity: 0;
    transform: translateY(-10px);
  }
}

@keyframes issue-sheet-in-up {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
}

html[data-vt='layer'] [data-sheet] {
  view-transition-name: none;
}

/* Pseudos attach to html itself — no descendant combinator. */
html[data-vt='layer']::view-transition-group(root),
html[data-vt='layer']::view-transition-old(root),
html[data-vt='layer']::view-transition-new(root),
html[data-vt='layer']::view-transition-group(issue-sheet),
html[data-vt='layer']::view-transition-old(issue-sheet),
html[data-vt='layer']::view-transition-new(issue-sheet) {
  animation: none !important;
  animation-duration: 0s !important;
}

.hub-feed-enter-active,
.hub-feed-leave-active {
  transition: opacity 220ms var(--ease-out);
}

.hub-feed-enter-from,
.hub-feed-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .issue-sheet-enter-active,
  .issue-sheet-leave-active {
    transition: opacity 120ms linear;
  }

  .issue-sheet-enter-from,
  .issue-sheet-leave-to {
    transform: none;
  }

  html[data-vt='layer'] .hub-feed {
    view-transition-name: none;
  }

  .hub-feed-enter-active,
  .hub-feed-leave-active {
    transition: opacity 120ms linear;
  }
}
</style>
