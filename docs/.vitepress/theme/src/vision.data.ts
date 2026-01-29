import fs from 'node:fs'
import path from 'node:path'
import { defineLoader } from 'vitepress'
import YAML from 'yaml'

export interface VisionLink {
  label: string
  url: string
}

export interface VisionItem {
  title: string
  links?: VisionLink[]
}

function readYaml<T>(file: string): T {
  return YAML.parse(fs.readFileSync(file, 'utf-8')) as T
}

declare const data: VisionItem[]
export { data }

export default defineLoader({
  watch: ['docs/dashboard/visions.yml'],

  load(watchedFiles): VisionItem[] {
    const file = watchedFiles[0]
    if (!fs.existsSync(file))
      return []
    return readYaml<VisionItem[]>(file) ?? []
  },
})
