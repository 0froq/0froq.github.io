import { inkDotCluster } from '~/utils/inkDraw'

/** @deprecated Use inkDotCluster from inkDraw */
export function scrapDotPaths(seed: string) {
  return inkDotCluster(seed).map(d => ({ d }))
}
