import { useDark } from '@vueuse/core'
import { computed, type ComputedRef } from 'vue'
import type { Config, Layout } from 'plotly.js'
import { deepMerge } from './deepMerge'

export interface ThemeColors {
  background: string
  text: string
  grid: string
  line: string
  zeroLine: string
  paperBg: string
  plotBg: string
  tooltipBg: string
  tooltipText: string
}

export const lightThemeColors: ThemeColors = {
  background: '#fafafa',
  text: '#666666',
  grid: '#e5e5e5',
  line: '#cccccc',
  zeroLine: '#e5e5e5',
  paperBg: 'transparent',
  plotBg: 'transparent',
  tooltipBg: 'rgba(255, 255, 255, 0.95)',
  tooltipText: '#333333',
}

export const darkThemeColors: ThemeColors = {
  background: '#0a0a0a',
  text: '#cccccc',
  grid: '#333333',
  line: '#555555',
  zeroLine: '#333333',
  paperBg: 'transparent',
  plotBg: 'transparent',
  tooltipBg: 'rgba(30, 30, 30, 0.95)',
  tooltipText: '#e0e0e0',
}

export function getThemeColors(isDark: boolean): ThemeColors {
  return isDark ? darkThemeColors : lightThemeColors
}

export function createThemeLayout(colors: ThemeColors): Partial<Layout> {
  return {
    paper_bgcolor: colors.paperBg,
    plot_bgcolor: colors.plotBg,
    font: {
      family: 'Inter, system-ui, sans-serif',
      size: 12,
      color: colors.text,
    },
    xaxis: {
      gridcolor: colors.grid,
      linecolor: colors.line,
      zerolinecolor: colors.zeroLine,
      tickfont: { color: colors.text },
    },
    yaxis: {
      gridcolor: colors.grid,
      linecolor: colors.line,
      zerolinecolor: colors.zeroLine,
      tickfont: { color: colors.text },
    },
    legend: {
      orientation: 'h',
      y: -0.2,
      x: 0.5,
      xanchor: 'center',
      font: { color: colors.text },
      bgcolor: 'transparent',
    },
    hoverlabel: {
      bgcolor: colors.tooltipBg,
      font: { color: colors.tooltipText },
    },
  }
}

export const defaultConfig: Partial<Config> = {
  responsive: true,
  displayModeBar: true,
  displaylogo: false,
  modeBarButtonsToRemove: ['lasso2d', 'select2d'],
  toImageButtonOptions: {
    format: 'png',
    filename: 'chart',
    height: 600,
    width: 800,
    scale: 2,
  },
}

export function useChartTheme(): {
  isDark: ComputedRef<boolean>
  colors: ComputedRef<ThemeColors>
  layout: ComputedRef<Partial<Layout>>
  mergeLayout: (userLayout?: Record<string, unknown>) => Partial<Layout>
} {
  const isDark = computed(() => useDark().value)

  const colors = computed(() => getThemeColors(isDark.value))

  const layout = computed(() => createThemeLayout(colors.value))

  function mergeLayout(userLayout: Record<string, unknown> = {}): Partial<Layout> {
    const baseLayout = layout.value as Record<string, unknown>
    return deepMerge(baseLayout, userLayout) as Partial<Layout>
  }

  return {
    isDark,
    colors,
    layout,
    mergeLayout,
  }
}
