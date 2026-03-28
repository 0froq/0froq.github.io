import fs from 'node:fs'
import { defineLoader } from 'vitepress'
import YAML from 'yaml'

export interface FenceItem {
  title: string
  description?: string
  category: string
  links?: {
    label: string
    url: string
  }[]
  locale?: string
}

export interface FenceCategory {
  category: string
  items: FenceItem[]
}

export interface FencesData {
  items: FenceItem[]
  categories: FenceCategory[]
}

function readYaml<T>(file: string): T {
  return YAML.parse(fs.readFileSync(file, 'utf-8')) as T
}

declare const data: FencesData
export { data }

export default defineLoader({
  watch: ['docs/dashboard/fences/*.yml'],

  load(watchedFiles): FencesData {
    const file = watchedFiles[0]
    if (!fs.existsSync(file))
      return { items: [], categories: [] }

    const items = readYaml<FenceItem[]>(file) ?? []

    const categories: FenceCategory[] = []
    const seen = new Map<string, FenceItem[]>()

    for (const item of items) {
      if (!seen.has(item.category)) {
        const bucket: FenceItem[] = []
        seen.set(item.category, bucket)
        categories.push({ category: item.category, items: bucket })
      }
      seen.get(item.category)!.push(item)
    }

    return { items, categories }
  },
})
