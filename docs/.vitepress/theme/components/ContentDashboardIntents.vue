<script setup lang="ts">
import DashboardVision from './DashboardVision.vue'
import DashboardYear from './DashboardYear.vue'
import ProgressBarHeader from './ProgressBarHeader.vue'
</script>

<template>
  <section>
    <ProgressBarHeader
      id="yearly-and-vision-header"
      title="我想……"
    />
    <DashboardYear />
    <DashboardVision />
  </section>
</template>
