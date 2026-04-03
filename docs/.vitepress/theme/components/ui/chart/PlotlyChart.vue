<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import type { Data, Config, Layout } from 'plotly.js'
import { useChartTheme, defaultConfig } from '~/utils/chartTheme'
import { deepMerge } from '~/utils/deepMerge'

interface Props {
  data: Data[]
  layout?: Record<string, unknown>
  config?: Record<string, unknown>
  height?: number | string
}

const props = withDefaults(defineProps<Props>(), {
  layout: () => ({}),
  config: () => ({}),
  height: 400,
})

const chartRef = ref<HTMLDivElement | null>(null)
const Plotly = ref<any>(null)

const { isDark, mergeLayout } = useChartTheme()

const mergedLayout = computed<Partial<Layout>>(() => {
  const heightLayout = typeof props.height === 'number'
    ? { height: props.height }
    : {}
  const userLayout = { ...props.layout, ...heightLayout }
  return mergeLayout(userLayout)
})

const mergedConfig = computed<Partial<Config>>(() => {
  return deepMerge(defaultConfig as Record<string, unknown>, props.config) as Partial<Config>
})

async function initPlotly() {
  if (!chartRef.value || typeof window === 'undefined') return

  const module = await import('plotly.js-dist-min')
  Plotly.value = module.default

  await Plotly.value.newPlot(
    chartRef.value,
    props.data,
    mergedLayout.value,
    mergedConfig.value,
  )
}

function updateChart() {
  if (!Plotly.value || !chartRef.value) return
  Plotly.value.react(
    chartRef.value,
    props.data,
    mergedLayout.value,
    mergedConfig.value,
  )
}

onMounted(() => {
  initPlotly()
})

onUnmounted(() => {
  if (Plotly.value && chartRef.value) {
    Plotly.value.purge(chartRef.value)
  }
})

watch(() => props.data, updateChart, { deep: true })
watch(mergedLayout, updateChart, { deep: true })
watch(isDark, () => {
  updateChart()
})
</script>

<template>
  <div ref="chartRef" class="plotly-chart" />
</template>

<style scoped>
.plotly-chart {
  width: 100%;
  min-height: v-bind('typeof height === "number" ? `${height}px` : height');
}
</style>
