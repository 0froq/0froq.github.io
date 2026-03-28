import fs from 'node:fs'
import { defineLoader } from 'vitepress'
import YAML from 'yaml'

export interface TipItem {
  title: string
  description?: string
  category: string
  links?: {
    label: string
    url: string
  }[]
  locale?: string
}

export interface TipCategory {
  category: string
  items: TipItem[]
}

export interface TipsData {
  items: TipItem[]
  categories: TipCategory[]
}

function readYaml<T>(file: string): T {
  return YAML.parse(fs.readFileSync(file, 'utf-8')) as T
}

declare const data: TipsData
export { data }

export default defineLoader({
  watch: ['docs/dashboard/tips/*.yml'],

  load(watchedFiles): TipsData {
    const file = watchedFiles[0]
    if (!fs.existsSync(file))
      return { items: [], categories: [] }

    const items = readYaml<TipItem[]>(file) ?? []

    const categories: TipCategory[] = []
    const seen = new Map<string, TipItem[]>()

    for (const item of items) {
      if (!seen.has(item.category)) {
        const bucket: TipItem[] = []
        seen.set(item.category, bucket)
        categories.push({ category: item.category, items: bucket })
      }
      seen.get(item.category)!.push(item)
    }

    return { items, categories }
  },
})
