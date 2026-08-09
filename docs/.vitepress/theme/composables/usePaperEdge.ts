/**
 * 低频小位移纸边参数：由稳定 id 哈希派生，同 id 每次一致。
 */
export interface PaperEdgeParams {
  filterId: string
  seed: number
  frequency: number
  octaves: number
  scale: number
  tilt: string
  tapeOffset: string
  tapeTilt: string
}

export function hashCode(input: string): number {
  let hash = 0
  for (let i = 0; i < input.length; i++)
    hash = ((hash << 5) - hash + input.charCodeAt(i)) | 0
  return Math.abs(hash)
}

function safeId(input: string): string {
  return input.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 48) || 'x'
}

export function paperEdgeFromId(id: string): PaperEdgeParams {
  const h = hashCode(id)
  const hf = hashCode(`${id}:f`)
  const hs = hashCode(`${id}:s`)
  const ht = hashCode(`${id}:tilt`)
  const ho = hashCode(`${id}:tape`)
  const htt = hashCode(`${id}:tape-tilt`)

  const tiltSign = ht % 2 === 0 ? 1 : -1
  const tiltMag = 0.4 + (ht % 80) / 100
  const tapeTilt = (htt % 65) / 10 - 3.2

  return {
    filterId: `paper-edge-${safeId(id)}-${h % 100000}`,
    seed: (h % 9999) + 1,
    frequency: 0.025 + (hf % 11) / 1000,
    octaves: 2,
    scale: 3 + (hs % 21) / 10,
    tilt: `${(tiltSign * tiltMag).toFixed(2)}deg`,
    tapeOffset: `${(ho % 64) - 12}px`,
    tapeTilt: `${tapeTilt.toFixed(1)}deg`,
  }
}
