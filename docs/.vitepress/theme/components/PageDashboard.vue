<script setup lang="ts">
import DashboardHint from './DashboardHint.vue'
import DashboardVision from './DashboardVision.vue'
import DashboardWeekQuadrant from './DashboardWeekQuadrant.vue'
import DashboardYear from './DashboardYear.vue'
</script>

<template>
  <un-page-content class="dash-page">
    <DashboardWeekQuadrant />
  </un-page-content>

  <un-page-content class="dash-page">
    <section
      un-mt-6
      un-space-y-6
    >
      <DashboardYear />
      <DashboardVision />
      <DashboardHint />
    </section>
  </un-page-content>
</template>

<style scoped>
.dash-page {
  --uno: 'max-w-5xl mx-auto';
}

:deep(.section-heading) {
  letter-spacing: 0.01em;
}

:deep(h3.section-subheading) {
  letter-spacing: 0.02em;
}
</style>
