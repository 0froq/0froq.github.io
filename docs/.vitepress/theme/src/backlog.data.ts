import type { BacklogData, BacklogItem } from '../types'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { defineLoader } from 'vitepress'
import YAML from 'yaml'

declare const data: BacklogData
export { data }

export default defineLoader({
  watch: ['docs/dashboard/monthBacklogs/*.yml'],

  load(watchedFiles): BacklogData {
    const backlogDir = watchedFiles.length
      ? path.dirname(watchedFiles[0])
      : path.join(process.cwd(), 'docs/dashboard/monthBacklog')

    const files = fs.existsSync(backlogDir)
      ? fs.readdirSync(backlogDir)
          .filter(f => f.endsWith('.yml') || f.endsWith('.yaml'))
          .map(f => path.join(backlogDir, f))
      : []

    const months = files
      .map((abs) => {
        const month = path.basename(abs).replace(/\.(yml|yaml)$/i, '')
        const parsed = readYaml<{ items?: BacklogItem[] }>(abs)
        return {
          month,
          items: parsed?.items ?? [],
          file: `./backlog/${path.basename(abs)}`,
        }
      })
      .sort((a, b) => sortDesc(a.month, b.month))

    const currentMonth = monthKeyFromDate(new Date())
    const current = months.find(m => m.month === currentMonth) ?? null

    return {
      currentMonth,
      current,
      months,
    }
  },
})

function readYaml<T>(file: string): T {
  return YAML.parse(fs.readFileSync(file, 'utf-8')) as T
}

function sortDesc(a: string, b: string): number {
  return b.localeCompare(a)
}

function monthKeyFromDate(d: Date): string {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${yyyy}-${mm}`
}
