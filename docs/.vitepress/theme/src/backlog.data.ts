import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { defineLoader } from 'vitepress'
import YAML from 'yaml'

export interface BacklogLink {
  label: string
  url: string
}

export interface BacklogItem {
  title: string
  status?: 'notPlanned' | 'arranging' | 'deffered'
  due?: string
  dod?: string
  links?: BacklogLink[]
  locale?: string
}

export interface BacklogRecord {
  month: string // YYYY-MM (also the filename)
  items: BacklogItem[]
  file: string
}

export interface BacklogData {
  currentMonth: string
  current: BacklogRecord | null
  months: BacklogRecord[]
}

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

declare const data: BacklogData
export { data }

export default defineLoader({
  watch: ['docs/dashboard/backlog/*.yml'],

  load(watchedFiles): BacklogData {
    const backlogDir = watchedFiles.length
      ? path.dirname(watchedFiles[0])
      : path.join(process.cwd(), 'docs/dashboard/backlog')

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
