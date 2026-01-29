import fs from 'node:fs'
import { defineLoader } from 'vitepress'
import YAML from 'yaml'

export interface GuidanceItem {
  title: string
  description?: string
  category: string
  links?: {
    label: string
    url: string
  }[]
}

export interface GuidanceCategory {
  category: string
  items: GuidanceItem[]
}

export interface GuidanceData {
  items: GuidanceItem[]
  categories: GuidanceCategory[]
}

function readYaml<T>(file: string): T {
  return YAML.parse(fs.readFileSync(file, 'utf-8')) as T
}

declare const data: GuidanceData
export { data }

export default defineLoader({
  watch: ['docs/dashboard/guidance.yml'],

  load(watchedFiles): GuidanceData {
    const file = watchedFiles[0]
    if (!fs.existsSync(file))
      return { items: [], categories: [] }

    const items = readYaml<GuidanceItem[]>(file) ?? []

    const categories: GuidanceCategory[] = []
    const seen = new Map<string, GuidanceItem[]>()

    for (const item of items) {
      if (!seen.has(item.category)) {
        const bucket: GuidanceItem[] = []
        seen.set(item.category, bucket)
        categories.push({ category: item.category, items: bucket })
      }
      seen.get(item.category)!.push(item)
    }

    return { items, categories }
  },
})
