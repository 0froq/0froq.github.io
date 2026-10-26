import type { Scrap } from '~/utils/scraps'
import { parse } from 'smol-toml'
import raw from '../../docs/scraps.toml?raw'

interface ScrapFile {
  scraps?: Array<{
    id?: string
    text?: string
    detail?: string
    date?: string
    pinned?: boolean
  }>
}

export function loadScraps(): Scrap[] {
  const data = parse(raw) as ScrapFile
  return (data.scraps ?? [])
    .map((row): Scrap | null => {
      const id = row.id?.trim()
      const text = row.text?.trim()
      if (!id || !text) return null
      const scrap: Scrap = { id, text }
      const detail = row.detail?.trim()
      const date = row.date?.trim()
      if (detail) scrap.detail = detail
      if (date) scrap.date = date
      if (row.pinned === true) scrap.pinned = true
      return scrap
    })
    .filter((row): row is Scrap => row !== null)
    .sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)))
}
