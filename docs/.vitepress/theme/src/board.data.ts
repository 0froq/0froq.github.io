import type { BoardData, BoardTask, TaskItem } from '../types'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { defineLoader } from 'vitepress'
import YAML from 'yaml'

declare const data: BoardData & { asTaskItems: { active: TaskItem[], backlog: TaskItem[], archive: TaskItem[] } }
export { data }

export default defineLoader({
   watch: ['docs/dashboard/board.yml'],

   load(watchedFiles): typeof data {
      const boardFile = watchedFiles[0]
         ?? path.join(process.cwd(), 'docs/dashboard/board.yml')

      if (!fs.existsSync(boardFile)) {
         return { updated: '', active: [], backlog: [], archive: [], asTaskItems: { active: [], backlog: [], archive: [] } }
      }

      const raw = readYaml<Partial<BoardData>>(boardFile)
      const active = (raw.active ?? []).map(withDefaultActiveStatus)
      const backlog = raw.backlog ?? []
      const archive = raw.archive ?? []

      return {
         updated: raw.updated ?? '',
         weekTheme: raw.weekTheme,
         active,
         backlog,
         archive,
         asTaskItems: {
            active: active.map(toTaskItem),
            backlog: backlog.map(toTaskItem),
            archive: archive.map(toTaskItem),
         },
      }
   },
})

function readYaml<T>(file: string): T {
   return YAML.parse(fs.readFileSync(file, 'utf-8')) as T
}

function withDefaultActiveStatus(task: BoardTask): BoardTask {
   return { ...task, status: task.status ?? 'notStarted' }
}

function toTaskItem(t: BoardTask): TaskItem {
   return {
      title: t.title,
      status: t.status,
      priority: t.priority,
      dod: t.dod,
      due: t.due,
      notes: t.notes,
      tags: t.tags,
   }
}
