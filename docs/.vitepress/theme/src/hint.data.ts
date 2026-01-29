import fs from 'node:fs'
import { defineLoader } from 'vitepress'
import YAML from 'yaml'

export interface HintItem {
  title: string
  description?: string
  category: string
}

export interface HintCategory {
  category: string
  items: HintItem[]
}

export interface HintData {
  items: HintItem[]
  categories: HintCategory[]
}

function readYaml<T>(file: string): T {
  return YAML.parse(fs.readFileSync(file, 'utf-8')) as T
}

declare const data: HintData
export { data }

export default defineLoader({
  watch: ['docs/dashboard/hint.yml'],

  load(watchedFiles): HintData {
    const file = watchedFiles[0]
    if (!fs.existsSync(file))
      return { items: [], categories: [] }

    const items = readYaml<HintItem[]>(file) ?? []

    const categories: HintCategory[] = []
    const seen = new Map<string, HintItem[]>()

    for (const item of items) {
      if (!seen.has(item.category)) {
        const bucket: HintItem[] = []
        seen.set(item.category, bucket)
        categories.push({ category: item.category, items: bucket })
      }
      seen.get(item.category)!.push(item)
    }

    return { items, categories }
  },
})
