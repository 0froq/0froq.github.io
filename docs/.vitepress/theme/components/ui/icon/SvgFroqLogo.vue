<script setup lang="ts">
defineProps<{
  animated?: boolean
}>()
</script>

<template>
  <svg
    width="80"
    height="50"
    viewBox="0 0 204 134"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      :id="animated ? 'animated' : ''"
      d="M5.0344 62.0189C37.0344 65.5189 72.0346 23.019 66.5346 4.519C61.0346 -13.981 -31.8841 142.863 17.3252 129.862C66.5345 116.862 17.5344 56.4363 13.5344 50.9357C9.53444 45.4352 17.5344 55.0189 22.5344 57.0189C27.5344 59.0189 35.0344 61.519 45.5344 60.519C56.0344 59.519 66.5603 52.4357 68.5603 50.9357C70.5603 49.4357 54.5 64.8623 55 76.8623C55.5 88.8623 72.5 84.3623 80.5 78.3623C88.5 72.3623 109 48.3623 99 45.3623C89 42.3623 77.3252 75.8624 90.8252 81.8624C104.325 87.8623 131.5 64.8623 124 45.3623C116.5 25.8623 105 40 114 45C123 50 137 31 147 22.5C157 14 176.076 13.3623 182 30.3623C187.924 47.3623 177 71.5194 155.5 79.8623C134 88.2052 121.2 81.8623 120.325 78.3623C119.45 74.8623 158.825 73.3623 165.325 73.8623C171.825 74.3623 201 73.7057 201 85.8623"
      un-stroke="neutral-700 dark:neutral-300 width-3"
      un-group-hover="stroke-emerald-600 dark:stroke-emerald-400"
      un-transition-colors
      un-duration-200
    />
  </svg>
</template>

<style scoped>
@keyframes grow {
  0% {
    stroke-dashoffset: 1px;
    stroke-dasharray: 0 var(--signature-length);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  50% {
    stroke-dasharray: var(--signature-length) 0;
  }

  95%,
  to {
    stroke-dasharray: 0 var(--signature-length);
  }
}
#animated {
  --signature-length: 2000px;
  stroke-dasharray: 40 0;
  animation: grow 10s linear infinite;
}
</style>
