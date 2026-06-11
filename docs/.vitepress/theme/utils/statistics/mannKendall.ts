export interface MKResult {
  s: number
  varianceS: number
  z: number
  pValue: number
  tau: number
  senSlope: number
  intercept: number
  trendDirection: 'increasing' | 'decreasing' | 'no trend'
  isSignificant: boolean
}

export interface TimeSeriesPoint {
  x: number
  y: number
}

function calculateS(data: TimeSeriesPoint[]): number {
  const n = data.length
  let s = 0

  for (let i = 0; i < n - 1; i++) {
    for (let j = i + 1; j < n; j++) {
      const diff = data[j].y - data[i].y
      if (diff > 0)
        s++
      else if (diff < 0)
        s--
    }
  }

  return s
}

function calculateVarianceS(data: TimeSeriesPoint[]): number {
  const n = data.length

  const uniqueValues = new Map<number, number>()
  for (const point of data) {
    uniqueValues.set(point.y, (uniqueValues.get(point.y) || 0) + 1)
  }

  let tieCorrection = 0
  for (const count of uniqueValues.values()) {
    if (count > 1) {
      tieCorrection += count * (count - 1) * (2 * count + 5)
    }
  }

  return (n * (n - 1) * (2 * n + 5) - tieCorrection) / 18
}

function calculateZ(s: number, varianceS: number): number {
  if (s > 0) {
    return (s - 1) / Math.sqrt(varianceS)
  }
  else if (s < 0) {
    return (s + 1) / Math.sqrt(varianceS)
  }
  return 0
}

function calculatePValue(z: number): number {
  return 2 * (1 - normalCDF(Math.abs(z)))
}

function normalCDF(x: number): number {
  const t = 1 / (1 + 0.2316419 * x)
  const d = 0.3989423 * Math.exp((-x * x) / 2)
  const prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))))

  if (x > 0) {
    return 1 - prob
  }
  return prob
}

function calculateSenSlope(data: TimeSeriesPoint[]): number {
  const n = data.length
  const slopes: number[] = []

  for (let i = 0; i < n - 1; i++) {
    for (let j = i + 1; j < n; j++) {
      const dx = data[j].x - data[i].x
      if (dx !== 0) {
        slopes.push((data[j].y - data[i].y) / dx)
      }
    }
  }

  if (slopes.length === 0)
    return 0

  slopes.sort((a, b) => a - b)
  const mid = Math.floor(slopes.length / 2)

  if (slopes.length % 2 === 0) {
    return (slopes[mid - 1] + slopes[mid]) / 2
  }
  return slopes[mid]
}

function calculateIntercept(data: TimeSeriesPoint[], slope: number): number {
  const intercepts = data.map(p => p.y - slope * p.x)
  intercepts.sort((a, b) => a - b)
  const mid = Math.floor(intercepts.length / 2)

  if (intercepts.length % 2 === 0) {
    return (intercepts[mid - 1] + intercepts[mid]) / 2
  }
  return intercepts[mid]
}

export function mannKendallTest(
  data: TimeSeriesPoint[],
  significanceLevel: number = 0.05,
): MKResult {
  const n = data.length

  if (n < 3) {
    return {
      s: 0,
      varianceS: 0,
      z: 0,
      pValue: 1,
      tau: 0,
      senSlope: 0,
      intercept: 0,
      trendDirection: 'no trend',
      isSignificant: false,
    }
  }

  const s = calculateS(data)
  const varianceS = calculateVarianceS(data)
  const z = calculateZ(s, varianceS)
  const pValue = calculatePValue(z)
  const tau = (2 * s) / (n * (n - 1))
  const senSlope = calculateSenSlope(data)
  const intercept = calculateIntercept(data, senSlope)

  let trendDirection: 'increasing' | 'decreasing' | 'no trend' = 'no trend'
  if (senSlope > 0)
    trendDirection = 'increasing'
  else if (senSlope < 0)
    trendDirection = 'decreasing'

  return {
    s,
    varianceS,
    z,
    pValue,
    tau,
    senSlope,
    intercept,
    trendDirection,
    isSignificant: pValue < significanceLevel,
  }
}

export function calculateTrendLine(
  data: TimeSeriesPoint[],
): { x: number[], y: number[] } | null {
  const mk = mannKendallTest(data)

  if (data.length < 2)
    return null

  const xValues = data.map(p => p.x)
  const minX = Math.min(...xValues)
  const maxX = Math.max(...xValues)

  return {
    x: [minX, maxX],
    y: [mk.intercept + mk.senSlope * minX, mk.intercept + mk.senSlope * maxX],
  }
}
