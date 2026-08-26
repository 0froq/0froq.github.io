import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import type { BoardData, BoardTask } from '~/utils/board'

function emptyBoard(): BoardData {
  return {
    updated: '',
    weekTheme: '',
    active: [],
    backlog: [],
    archive: [],
  }
}

async function loadBoardRaw(): Promise<string | null> {
  // Bundled via nitro serverAssets for Cloudflare / generate.
  try {
    const storage = useStorage('assets:dashboard')
    const bundled = await storage.getItem<string>('board.yml')
    if (typeof bundled === 'string' && bundled.trim())
      return bundled
  }
  catch {
    // fall through to filesystem (local nuxt dev)
  }

  try {
    return await readFile(resolve(process.cwd(), 'docs/dashboard/board.yml'), 'utf-8')
  }
  catch {
    return null
  }
}

export default defineEventHandler(async () => {
  try {
    const raw = await loadBoardRaw()
    if (!raw)
      return emptyBoard()
    const { parse } = await import('yaml')
    const data = parse(raw) as Partial<BoardData>
    const withStatus = (task: BoardTask): BoardTask => ({
      ...task,
      status: task.status ?? 'notStarted',
    })
    return {
      updated: data.updated ?? '',
      weekTheme: data.weekTheme ?? '',
      active: (data.active ?? []).map(withStatus),
      backlog: data.backlog ?? [],
      archive: data.archive ?? [],
    } satisfies BoardData
  }
  catch {
    return emptyBoard()
  }
})
