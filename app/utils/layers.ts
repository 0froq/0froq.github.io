export interface SiteLayer {
  slug: string
  label: string
  note: string
}

export const postLayers: SiteLayer[] = [
  {
    slug: '610-log',
    label: 'Log',
    note: 'Daily musings',
  },
  {
    slug: '620-roadmap',
    label: 'Roadmap',
    note: 'Technical and project',
  },
  {
    slug: '630-collection',
    label: 'Collection',
    note: 'Collection of things I like',
  },
]

export const corpusLayers: SiteLayer[] = [
  {
    slug: '000-autopsia',
    label: 'Autopsia',
    note: 'System self-inspection · Metacognition',
  },
  {
    slug: '100-ingesta',
    label: 'Ingesta',
    note: 'External material',
  },
  {
    slug: '200-neoplasma',
    label: 'Neoplasma',
    note: 'Internalized thought',
  },
  {
    slug: '300-putredo',
    label: 'Putredo',
    note: 'Records of practice',
  },
  {
    slug: '400-delirium',
    label: 'Delirium',
    note: 'Aesthetics and the irrational',
  },
  {
    slug: '500-vigil',
    label: 'Vigil',
    note: 'Proof of being',
  },
]

export function findPostLayer(slug: string) {
  return postLayers.find(layer => layer.slug === slug)
}

export function findCorpusLayer(slug: string) {
  return corpusLayers.find(layer => layer.slug === slug)
}

/** Hub index (`/corpus`) or a layer listing (`/corpus/autopsia`). Articles are deeper. */
export function hubListingRoot(path: string): 'posts' | 'corpus' | null {
  const parts = path.split('/').filter(Boolean)
  if (parts.length === 0 || parts.length > 2)
    return null
  const root = parts[0]
  if (root !== 'posts' && root !== 'corpus')
    return null
  return root
}

export function isHubListingNav(toPath: string, fromPath: string) {
  const to = hubListingRoot(toPath)
  const from = hubListingRoot(fromPath)
  return Boolean(to && to === from)
}

export function isLayerEntry(
  path: string,
  root: 'posts' | 'corpus',
  layer: string,
) {
  const prefix = `/${root}/${layer}/`
  if (!path.startsWith(prefix))
    return false
  if (path === `/${root}/${layer}`)
    return false
  return true
}
