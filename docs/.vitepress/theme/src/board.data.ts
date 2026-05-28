import type { BoardData, BoardTask, TaskItem } from '../types'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { defineLoader } from 'vitepress'
import YAML from 'yaml'

declare const data: BoardData & { asTaskItems: { active: TaskItem[], done: TaskItem[], backlog: TaskItem[] } }
export { data }

export default defineLoader({
   watch: ['docs/dashboard/board.yml'],

   load(watchedFiles): typeof data {
      const boardFile = watchedFiles[0]
         ?? path.join(process.cwd(), 'docs/dashboard/board.yml')

      if (!fs.existsSync(boardFile)) {
         return { updated: '', active: [], done: [], backlog: [], asTaskItems: { active: [], done: [], backlog: [] } }
      }

      const raw = readYaml<Partial<BoardData>>(boardFile)
      const active = (raw.active ?? []).map(t => withDefaultStatus(t, 'inProgress'))
      const done = (raw.done ?? []).map(t => withDefaultStatus(t, 'done'))
      const backlog = (raw.backlog ?? []).map(t => withDefaultStatus(t, 'notStarted'))

      return {
         updated: raw.updated ?? '',
         weekTheme: raw.weekTheme,
         active,
         done,
         backlog,
         asTaskItems: {
            active: active.map(toTaskItem),
            done: done.map(toTaskItem),
            backlog: backlog.map(toTaskItem),
         },
      }
   },
})

function readYaml<T>(file: string): T {
   return YAML.parse(fs.readFileSync(file, 'utf-8')) as T
}

function withDefaultStatus(task: BoardTask, fallback: BoardTask['status']): BoardTask {
   return { ...task, status: task.status ?? fallback }
}

function toTaskItem(t: BoardTask): TaskItem {
   return {
      title: t.title,
      status: t.status ?? 'notStarted',
      priority: t.priority,
      dod: t.dod,
      notes: t.notes,
      tags: t.tags,
   }
}
