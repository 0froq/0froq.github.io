export type PublicationRoom = 'essays' | 'journal' | 'cabinet'

export interface SiteLayer {
  slug: PublicationRoom
  label: string
  note: string
  ink: 'underline' | 'mark' | 'circle'
}

export const publicationSections: SiteLayer[] = [
  {
    slug: 'essays',
    label: 'Essays',
    note: 'Arguments, technical writing, and finished pieces',
    ink: 'underline',
  },
  {
    slug: 'journal',
    label: 'Journal',
    note: 'Time-bound personal writing',
    ink: 'mark',
  },
  {
    slug: 'cabinet',
    label: 'Cabinet',
    note: 'Found and made materials',
    ink: 'circle',
  },
]

export function findPublicationSection(slug: string) {
  return publicationSections.find(section => section.slug === slug)
}

export function isPublicationRoom(slug: string): slug is PublicationRoom {
  return slug === 'essays' || slug === 'journal' || slug === 'cabinet'
}

/** A public section index is exactly one path segment. */
export function publicationRoot(path: string): string | null {
  const parts = path.split('/').filter(Boolean)
  if (parts.length !== 1)
    return null
  return findPublicationSection(parts[0]!)?.slug ?? null
}

export function isHubListingNav(toPath: string, fromPath: string) {
  const to = publicationRoot(toPath)
  const from = publicationRoot(fromPath)
  return Boolean(to && to === from)
}

export function isPublicationEntry(path: string, section: string) {
  return path.startsWith(`/${section}/`)
}
