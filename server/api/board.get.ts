import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import type { BoardData, BoardTask } from '~/utils/board'

export default defineEventHandler(async () => {
  const file = resolve(process.cwd(), 'docs/dashboard/board.yml')
  try {
    const raw = await readFile(file, 'utf-8')
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
    return {
      updated: '',
      weekTheme: '',
      active: [],
      backlog: [],
      archive: [],
    } satisfies BoardData
  }
})
