import type { TagsData } from '../types'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const tagFile = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '../../generated/tags.json')

function readTags(): string[] {
  if (!fs.existsSync(tagFile)) {
    console.warn('[tags.data] Missing generated tag file. Run the tag generation script before dev/build.')
    return []
  }
  try {
    return JSON.parse(fs.readFileSync(tagFile, 'utf-8'))
  }
  catch (err) {
    console.warn('[tags.data] Failed to read tags.json, returning empty list:', err)
    return []
  }
}

export const data: TagsData = readTags()
export default data
