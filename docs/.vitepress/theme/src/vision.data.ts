import type { VisionsData, VisionItem, YearVision } from '../types'
import fs from 'node:fs'
import path from 'node:path'
import { defineLoader } from 'vitepress'
import YAML from 'yaml'

declare const data: VisionsData
export { data }

export default defineLoader({
  watch: [
    'docs/dashboard/visions/global.yml',
    'docs/dashboard/visions/year-*.yml',
  ],

  load(watchedFiles): VisionsData {
    const globalFile = watchedFiles.find(f => f.endsWith('global.yml'))
    const yearFiles = watchedFiles.filter(f => /year-\d{4}\.yml$/.test(f))

    const global = globalFile && fs.existsSync(globalFile)
      ? { type: 'global' as const, items: readYaml<VisionItem[]>(globalFile) ?? [] }
      : { type: 'global' as const, items: [] }

    const years: YearVision[] = yearFiles
      .filter(f => fs.existsSync(f))
      .map((file) => {
        const year = path.basename(file).replace(/year-/, '').replace(/\.yml$/, '')
        return {
          type: 'year' as const,
          year,
          items: readYaml<VisionItem[]>(file) ?? [],
        }
      })
      .sort((a, b) => b.year.localeCompare(a.year))

    const currentYear = new Date().getFullYear().toString()
    const currentYearVision = years.find(y => y.year === currentYear) ?? years[0] ?? null

    return {
      global,
      years,
      currentYear: currentYearVision,
    }
  },
})

function readYaml<T>(file: string): T {
  return YAML.parse(fs.readFileSync(file, 'utf-8')) as T
}
