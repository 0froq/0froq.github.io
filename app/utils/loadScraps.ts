import { parse } from 'smol-toml'
import type { Scrap } from '~/utils/scraps'
import raw from '../../docs/scraps.toml?raw'

type ScrapFile = {
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
    .map((row) => {
      const id = row.id?.trim()
      const text = row.text?.trim()
      if (!id || !text)
        return null
      return {
        id,
        text,
        detail: row.detail?.trim() || undefined,
        date: row.date?.trim() || undefined,
        pinned: row.pinned === true || undefined,
      } satisfies Scrap
    })
    .filter((row): row is Scrap => Boolean(row))
    .sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)))
}
