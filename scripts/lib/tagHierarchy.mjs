/**
 * Shared tag hierarchy helpers for build script + VitePress theme.
 */

export const TAG_REG
  = /<a href="[./tags][^"]*">\s*<span class="tag">(.*?)<\/span>\s*<\/a>/g

/** Expand `a/b/c` into `a`, `a/b`, `a/b/c`. */
export function dealTagHierarchy(tag) {
  const tags = new Set()
  const levels = tag.split('/')
  levels.forEach((_, i) => {
    tags.add(levels.slice(0, i + 1).join('/'))
  })
  return tags
}

/**
 * Extract tags from rendered hashtag HTML + optional frontmatter.tags.
 * @param {string | undefined} html
 * @param {{ tags?: string[] }} [frontmatter]
 * @returns {{ tags: Set<string>, tagsExtended: Set<string> }}
 */
export function getTags(html, frontmatter = {}) {
  let tagsExtended = new Set()
  const tags = new Set()

  if (html) {
    // Reset lastIndex in case TAG_REG was used elsewhere
    TAG_REG.lastIndex = 0
    let match = TAG_REG.exec(html)
    while (match) {
      tags.add(match[1])
      tagsExtended = new Set([...tagsExtended, ...dealTagHierarchy(match[1])])
      match = TAG_REG.exec(html)
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
