import fs from 'node:fs'

export default {
  paths: () => {
    const tagFile = new URL('../.vitepress/generated/tags.json', import.meta.url)
    const tags: string[] = JSON.parse(fs.readFileSync(tagFile, 'utf-8'))
    if (!tags || !Array.isArray(tags)) {
      console.warn('No tags found in tag file, returning empty paths')
      return []
    }

    return tags.map(tag => ({ params: { tag } }))
  },
}
