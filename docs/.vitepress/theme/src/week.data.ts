import fs from 'node:fs'
import path from 'node:path'
import { defineLoader } from 'vitepress'
import YAML from 'yaml'

export interface WeekLink {
  label: string
  url: string
}

export type TaskPriority = 'high' | 'medium' | 'low'

export interface WeekTask {
  title: string
  status: 'done' | 'inProgress' | 'notStarted' | 'deferred' | 'cancelled' | 'blocked'
  priority?: TaskPriority
  dod?: string
  links?: WeekLink[]
  tags?: string[]
}

export interface WeekData {
  start: string // YYYY-MM-DD (also the filename)
  end: string // computed: start + 6 days
  tasks: WeekTask[]
}

export interface DashboardData {
  today: string
  currentStart: string
  currentWeek: WeekData | null
  weeks: Array<{
    start: string
    end: string
    file: string
  }>
}

function readYaml<T>(file: string): T {
  return YAML.parse(fs.readFileSync(file, 'utf-8')) as T
}

function toISODate(d: Date): string {
  // local date -> YYYY-MM-DD
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

/**
 * weekStartsOn: 1 = Monday (JS: 0 Sun..6 Sat)
 * returns a Date at local timezone midnight-ish representing the week start
 */
function getWeekStart(date: Date, weekStartsOn = 1): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const day = d.getDay() // 0..6
  const diff = (day - weekStartsOn + 7) % 7
  d.setDate(d.getDate() - diff)
  return d
}

function safeWeekData(input: Partial<WeekData> & { start?: string }, startFromFilename: string): WeekData {
  const start = input.start ?? startFromFilename
  const startDate = new Date(`${start}T00:00:00`)
  const end = toISODate(addDays(startDate, 6))

  // Migrate from old quadrants format if present
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
    start,
    end,
    tasks: input.tasks ?? [],
  }
}

declare const data: DashboardData
export { data }

export default defineLoader({
  watch: [
    'docs/dashboard/weeks/*.yml',
  ],

  load(watchedFiles): DashboardData {
    const baseDir = path.dirname(watchedFiles[0].split(path.sep).slice(0, -1).join(path.sep))
    const weeksDir = path.join(baseDir, 'weeks')

    const weekFiles = fs.existsSync(weeksDir)
      ? fs.readdirSync(weeksDir)
          .filter(f => f.endsWith('.yml') || f.endsWith('.yaml'))
          .map(f => path.join(weeksDir, f))
      : []

    const parsedWeeks = weekFiles
      .map((abs) => {
        const filename = path.basename(abs).replace(/\.(yml|yaml)$/, '')
        // filename should be YYYY-MM-DD
        const w = safeWeekData(readYaml<WeekData>(abs), filename)
        return {
          start: w.start,
          end: w.end,
          file: `./weeks/${path.basename(abs)}`,
        }
      })
      .sort((a, b) => b.start.localeCompare(a.start)) // newest first

    const todayDate = new Date()
    const today = toISODate(todayDate)
    const currentStart = toISODate(getWeekStart(todayDate, 1)) // Monday-start weeks

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
