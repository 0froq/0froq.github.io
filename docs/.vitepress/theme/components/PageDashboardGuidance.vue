<script setup lang="ts">
import DashboardGuidance from './DashboardGuidance.vue'
import ProgressBarHeader from './ProgressBarHeader.vue'
</script>

<template>
  <un-page-content>
    <section>
      <ProgressBarHeader
        id="guidance-header"
        title="需要遵守……"
      />
      <DashboardGuidance />
    </section>
  </un-page-content>
</template>
