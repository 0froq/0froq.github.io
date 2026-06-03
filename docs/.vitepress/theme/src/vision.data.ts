import type { VisionItem, VisionsData, YearVision } from '../types'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
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
    const globalFile = path.join(process.cwd(), 'docs/dashboard/visions/global.yml')

    const baseDir = watchedFiles.length ?
      path.dirname(watchedFiles[0].split(path.sep).slice(0, -1).join(path.sep)) :
      path.join(process.cwd(), 'docs/dashboard')
    const visionsDir = path.join(baseDir, 'visions')

    const yearFiles = fs.existsSync(visionsDir)
      ? fs.readdirSync(visionsDir)
          .filter(f => f.startsWith('year-'))
          .map(f => path.join(visionsDir, f))
      : []

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
