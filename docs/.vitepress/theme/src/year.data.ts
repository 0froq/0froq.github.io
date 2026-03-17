import fs from 'node:fs'
import path from 'node:path'
import { defineLoader } from 'vitepress'
import YAML from 'yaml'

export interface YearLink {
  label: string
  url: string
}

export interface YearGoal {
  title: string
  links?: YearLink[]
  locale?: string
}

export interface YearRecord {
  year: string
  goals: YearGoal[]
  file: string
}

function readYaml<T>(file: string): T {
  return YAML.parse(fs.readFileSync(file, 'utf-8')) as T
}

function sortDesc(a: string, b: string): number {
  return b.localeCompare(a)
}

declare const data: YearRecord[]
export { data }

export default defineLoader({
  watch: ['docs/dashboard/years/*.yml'],

  load(watchedFiles): YearRecord[] {
    const yearsDir = path.dirname(watchedFiles[0])

    const files = fs.readdirSync(yearsDir)
      .filter(f => f.endsWith('.yml') || f.endsWith('.yaml'))
      .map(f => path.join(yearsDir, f))

    return files
      .map((abs) => {
        const year = path.basename(abs).replace(/\.(yml|yaml)$/i, '')
        const goals = readYaml<YearGoal[]>(abs) ?? []
        return {
          year,
          goals,
          file: `./years/${path.basename(abs)}`,
        }
      })
      .sort((a, b) => sortDesc(a.year, b.year))
  },
})
