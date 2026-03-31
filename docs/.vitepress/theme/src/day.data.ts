import type { DayData, DayRecord } from '../types'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { defineLoader } from 'vitepress'
import YAML from 'yaml'

declare const data: DayData
export { data }

export default defineLoader({
  watch: ['docs/dashboard/dayTodos/*.yml'],

  load(watchedFiles): DayData {
    const daysDir = watchedFiles.length
      ? path.dirname(watchedFiles[0])
      : path.join(process.cwd(), 'docs/dashboard/dayTodos')

    const files = fs.existsSync(daysDir)
      ? fs.readdirSync(daysDir)
          .filter(f => f.endsWith('.yml') || f.endsWith('.yaml'))
          .map(f => path.join(daysDir, f))
      : []

    const days = files
      .map((abs) => {
        const date = path.basename(abs).replace(/\.(yml|yaml)$/i, '')
        return safeDayRecord(readYaml<DayRecord>(abs), date, `./dayTodos/${path.basename(abs)}`)
      })
      .sort((a, b) => b.date.localeCompare(a.date))

    const today = toISODate(new Date())
    const currentDay = days.find(day => day.date === today) ?? days[0] ?? null

    return {
      today,
      currentDay,
      days,
    }
  },
})

function readYaml<T>(file: string): T {
  return YAML.parse(fs.readFileSync(file, 'utf-8')) as T
}

function toISODate(d: Date): string {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function safeDayRecord(input: Partial<DayRecord> & { date?: string }, dateFromFilename: string, file: string): DayRecord {
  return {
    date: input.date ?? dateFromFilename,
    theme: input.theme,
    tasks: input.tasks ?? [],
    file,
  }
}
