import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import MarkdownIt from 'markdown-it'
import MarkdownItHashtag from 'markdown-it-hashtag'
import YAML from 'yaml'

// Minimal tag extraction logic (mirrors docs/.vitepress/utils/usePostUtils.ts)
function dealTagHierarchy(tag) {
  const tags = new Set()
  const levels = tag.split('/')
  levels.forEach((_, i) => {
    tags.add(levels.slice(0, i + 1).join('/'))
  })
  return tags
}

function getTags(html, frontmatter = {}) {
  let tagsExtended = new Set()
  const tags = new Set()
  if (html) {
    const tagReg = /<a href="[./tags][^"]*">\s*<span class="tag">(.*?)<\/span>\s*<\/a>/g
    let match = tagReg.exec(html)
    while (match) {
      tags.add(match[1])
      tagsExtended = new Set([...tagsExtended, ...dealTagHierarchy(match[1])])
      match = tagReg.exec(html)
    }
  }
  if (frontmatter.tags) {
    frontmatter.tags.forEach((tag) => {
      tags.add(tag)
      tagsExtended = new Set([...tagsExtended, ...dealTagHierarchy(tag)])
    })
  }
  return { tags, tagsExtended }
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const docsRoot = path.resolve(__dirname, '../docs')
const outDir = path.resolve(docsRoot, '.vitepress/generated')
const outFile = path.join(outDir, 'tags.json')

const md = new MarkdownIt({
  html: false,
  linkify: false,
})
  .use(MarkdownItHashtag, {
    hashtagRegExp: '\\w+(\\/\\w+)*',
  })

md.renderer.rules.hashtag_text = function (tokens, idx) {
  return `${tokens[idx].content}`
}
md.renderer.rules.hashtag_open = function (tokens, idx) {
  const tagName = tokens[idx].content.toLowerCase()
  return `<a href="/tags/${tagName}"><span class="tag">`
}
md.renderer.rules.hashtag_close = function () {
  return '</span></a>'
}

const readFileSafe = filepath => fs.readFileSync(filepath, 'utf-8')

function parseFrontmatter(content) {
  if (!content.startsWith('---'))
    return { frontmatter: {}, body: content }
  const end = content.indexOf('\n---', 3)
  if (end === -1)
    return { frontmatter: {}, body: content }
  const fmRaw = content.slice(3, end)
  const body = content.slice(end + 4)
  let frontmatter = {}
  try {
    frontmatter = YAML.parse(fmRaw) || {}
  }
  catch {
    frontmatter = {}
  }
  return { frontmatter, body }
}

function shouldInclude(filepath) {
  const rel = path.relative(docsRoot, filepath)
  if (!rel)
    return false
  if (rel.startsWith('corpus/')) {
    if (rel.includes('/_template/'))
      return false
    if (path.basename(rel) === 'index.md')
      return false
    return true
  }
  if (rel.startsWith('posts/')) {
    if (path.basename(rel) === 'index.md')
      return false
    return true
  }
  return false
}

function walkMarkdownFiles(dir) {
  const files = []
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...walkMarkdownFiles(full))
    }
    else if (entry.isFile() && entry.name.endsWith('.md') && shouldInclude(full)) {
      files.push(full)
    }
  }
  return files
}

const files = walkMarkdownFiles(docsRoot)
const allTags = new Set()

files.forEach((file) => {
  const raw = readFileSafe(file)
  const { frontmatter, body } = parseFrontmatter(raw)
  let html = ''
  try {
    html = md.render(body)
  }
  catch (err) {
    console.warn(`[generate-tags] skip file due to markdown parse error: ${path.relative(docsRoot, file)}`)
    console.warn(err)
    return
  }
  const { tags, tagsExtended } = getTags(html, frontmatter)
  tags.forEach(tag => allTags.add(tag))
  tagsExtended.forEach(tag => allTags.add(tag))
})

fs.mkdirSync(outDir, { recursive: true })
fs.writeFileSync(outFile, `${JSON.stringify([...allTags].sort(), null, 2)}\n`, 'utf-8')
console.log(`[generate-tags] wrote ${allTags.size} tags to ${path.relative(docsRoot, outFile)}`)
