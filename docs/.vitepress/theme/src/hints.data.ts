import type { HintCategory, HintItem, HintsData } from '../types'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { defineLoader } from 'vitepress'
import YAML from 'yaml'

declare const data: HintsData
export { data }

export default defineLoader({
  watch: [
    'docs/dashboard/hints/fence.yml',
    'docs/dashboard/hints/tip.yml',
  ],

  load(): HintsData {
    const fenceFile = path.join(process.cwd(), 'docs/dashboard/hints/fence.yml')
    const tipFile = path.join(process.cwd(), 'docs/dashboard/hints/tip.yml')

    const fenceItems = fenceFile && fs.existsSync(fenceFile)
      ? readYaml<HintItem[]>(fenceFile) ?? []
      : []

    const tipItems = tipFile && fs.existsSync(tipFile)
      ? readYaml<HintItem[]>(tipFile) ?? []
      : []

    return {
      fence: { categories: groupByCategory(fenceItems) },
      tip: { categories: groupByCategory(tipItems) },
    }
  },
})

function readYaml<T>(file: string): T {
  return YAML.parse(fs.readFileSync(file, 'utf-8')) as T
}

function groupByCategory(items: HintItem[]): Record<string, HintCategory[]> {
  const categories: Record<string, HintCategory[]> = {}
  const seen = new Map<string, HintItem[]>()

  for (const item of items) {
    if (!seen.has(item.category)) {
      const bucket: HintItem[] = []
      seen.set(item.category, bucket)
      categories[item.locale || 'undefined'] = categories[item.locale || 'undefined'] || []
      categories[item.locale || 'undefined'].push({
        category: item.category,
        items: bucket,
      })
    }
    seen.get(item.category)!.push(item)
  }

  return categories
}
