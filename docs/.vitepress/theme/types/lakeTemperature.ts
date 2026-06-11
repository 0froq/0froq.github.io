export interface LakeMetadata {
  lakeId: string
  lat: number
  lon: number
}

export interface TimeSeriesPoint {
  date: string
  value: number | null
}

export interface LakeTimeSeries {
  lakeId: string
  lat: number
  lon: number
  series: TimeSeriesPoint[]
}

export interface SegmentTrend {
  segment: string
  startYear: number
  endYear: number
  slope: number
  intercept: number
  r2: number
  pValue: number
}

export interface SegmentedTrendSummary {
  lakeId: string
  lat: number
  lon: number
  segments: SegmentTrend[]
  changePoints: number[]
}

export interface GlobalMonthlySeries {
  dates: string[]
  values: (number | null)[]
  annualMeans: Array<{ year: number, value: number | null }>
}

export interface PlateauTestResult {
  windowStart: number
  windowEnd: number
  trend: number
  pValue: number
  isSignificant: boolean
}

export interface PlateauTestSummary {
  fullSeries: GlobalMonthlySeries
  plateauWindow: PlateauTestResult
  comparisonWindows: PlateauTestResult[]
}

export interface SpatialTrendPoint {
  lakeId: string
  lat: number
  lon: number
  preTrend: number
  postTrend: number
  delta: number
}

export interface SpatialTrendMapSummary {
  points: SpatialTrendPoint[]
  globalMeanDelta: number
}

export interface ChangePointCandidate {
  year: number
  score: number
  preTrend: number
  postTrend: number
  trendDelta: number
}

export interface ChangePointComparisonSummary {
  candidates: ChangePointCandidate[]
  selectedYear: number | null
}

export interface LakeTemperatureData {
  metadata: {
    availableDateRange: { start: string, end: string }
    lakeCount: number
  }
  globalSeries: GlobalMonthlySeries
  segmentedTrends: SegmentedTrendSummary[]
  plateauSummary: PlateauTestSummary
  spatialTrendDelta: SpatialTrendMapSummary
  changePointComparison: ChangePointComparisonSummary
}
