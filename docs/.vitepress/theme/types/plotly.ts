import type { Config, Data, Layout } from 'plotly.js'

export interface PlotlyChartProps {
  data: Data[]
  layout?: Record<string, unknown>
  config?: Record<string, unknown>
  height?: number | string
}
