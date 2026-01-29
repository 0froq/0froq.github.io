<script setup lang="ts">
import DashboardVision from './DashboardVision.vue'
import DashboardYear from './DashboardYear.vue'
import ProgressBarHeader from './ProgressBarHeader.vue'
</script>

<template>
  <un-page-content>
    <section>
      <ProgressBarHeader
        id="yearly-and-vision-header"
        title="我想……"
      />
      <DashboardYear />
      <DashboardVision />
    </section>
  </un-page-content>
</template>
