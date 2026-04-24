import type { WeekDashboardData, WeekData, WeekTask } from '../types'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { defineLoader } from 'vitepress'
import YAML from 'yaml'

declare const data: WeekDashboardData
export { data }

export default defineLoader({
  watch: [
    'docs/dashboard/weekTasks/*.yml',
  ],

  load(watchedFiles): WeekDashboardData {
    // const baseDir = path.dirname(watchedFiles[0].split(path.sep).slice(0, -1).join(path.sep))
    const baseDir = watchedFiles.length ?
      path.dirname(watchedFiles[0].split(path.sep).slice(0, -1).join(path.sep)) :
      path.join(process.cwd(), 'docs/dashboard')
    const weeksDir = path.join(baseDir, 'weekTasks')

    const weekFiles = fs.existsSync(weeksDir)
      ? fs.readdirSync(weeksDir)
          .filter(f => f.endsWith('.yml') || f.endsWith('.yaml'))
          .map(f => path.join(weeksDir, f))
      : []

    const parsedWeeks = weekFiles
      .map((abs) => {
        const filename = path.basename(abs).replace(/\.(yml|yaml)$/, '')
        const w = safeWeekData(readYaml<WeekData>(abs), filename)
        return {
          start: w.start,
          end: w.end,
          file: `./weekTasks/${path.basename(abs)}`,
        }
      })
      .sort((a, b) => b.start.localeCompare(a.start))

    const todayDate = new Date()
    const today = toISODate(todayDate)
    const currentStart = toISODate(getWeekStart(todayDate, 1))

    const currentFile = parsedWeeks.find(x => x.start === currentStart)?.file
    const currentWeek = currentFile
      ? safeWeekData(readYaml<WeekData>(path.join('docs/dashboard/', currentFile)), currentStart)
      : null

    return {
      today,
      currentStart,
      currentWeek,
      weeks: parsedWeeks,
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

function addDays(d: Date, days: number): Date {
  const x = new Date(d)
  x.setDate(x.getDate() + days)
  return x
}

function getWeekStart(date: Date, weekStartsOn = 1): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const day = d.getDay()
  const diff = (day - weekStartsOn + 7) % 7
  d.setDate(d.getDate() - diff)
  return d
}

function safeWeekData(input: Partial<WeekData> & { start?: string }, startFromFilename: string): WeekData {
  const start = input.start ?? startFromFilename
  const startDate = new Date(`${start}T00:00:00`)
  const end = toISODate(addDays(startDate, 6))

  if ('quadrants' in input && input.quadrants) {
    const oldQuadrants = input.quadrants as Record<string, WeekTask[]>
    const allTasks: WeekTask[] = [
      ...(oldQuadrants.q1 ?? []),
      ...(oldQuadrants.q2 ?? []),
      ...(oldQuadrants.q3 ?? []),
      ...(oldQuadrants.q4 ?? []),
    ]
    return { start, end, tasks: allTasks }
  }

  return {
    theme: input.theme,
    start,
    end,
    tasks: input.tasks ?? [],
  }
}
