import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

/** Color custom properties in `tokens.css` :root become Uno `theme.colors`. */
export const TOKEN_CSS = 'app/assets/css/tokens.css'

const COLORISH
  = /#|rgb|hsl|hwb|lab|lch|oklch|oklab|color-mix|light-dark|\bcolor\(|^var\(/i
const COMMENT = /\/\*[\s\S]*?\*\//g
const ROOT_OPEN = /:root\s*\{/
const CUSTOM_PROP = /^--([a-z0-9-]+)$/i
const WS = /\s+/g

type ColorNode = string | { [key: string]: ColorNode }

export function colorsFromTokensCss(css: string): Record<string, ColorNode> {
  const colors: Record<string, ColorNode> = {}
  for (const [name, value] of Object.entries(rootCustomProps(css))) {
    if (!COLORISH.test(value))
      continue
    assignColor(colors, name.split('-'), `var(--${name})`)
  }
  return colors
}

export function tokenColors(): Record<string, ColorNode> {
  return colorsFromTokensCss(readTokensCss())
}

/** `--font-sans` / `--font-serif` / `--font-mono` for Wind4 `theme.font`. */
export function tokenFonts(): { sans: string, serif: string, mono: string } {
  const vars = rootCustomProps(readTokensCss())
  return {
    sans: vars['font-sans'] ?? '',
    serif: vars['font-serif'] ?? '',
    mono: vars['font-mono'] ?? '',
  }
}

function readTokensCss(): string {
  const path = join(dirname(fileURLToPath(import.meta.url)), TOKEN_CSS)
  return readFileSync(path, 'utf8')
}

function rootCustomProps(css: string): Record<string, string> {
  const source = css.replace(COMMENT, '')
  const open = source.match(ROOT_OPEN)
  if (!open || open.index == null)
    return {}

  let depth = 1
  let i = open.index + open[0].length
  let body = ''
  while (i < source.length && depth) {
    const c = source[i]!
    if (c === '{')
      depth++
    else if (c === '}')
      depth--
    if (depth)
      body += c
    i++
  }

  const vars: Record<string, string> = {}
  for (const decl of body.split(';')) {
    const colon = decl.indexOf(':')
    if (colon < 0)
      continue
    const key = CUSTOM_PROP.exec(decl.slice(0, colon).trim())
    if (!key)
      continue
    vars[key[1]!] = decl.slice(colon + 1).replace(WS, ' ').trim()
  }
  return vars
}

function assignColor(obj: Record<string, ColorNode>, parts: string[], value: string) {
  let cur = obj
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i]!
    const next = cur[key]
    if (typeof next === 'string')
      cur[key] = { DEFAULT: next }
    else if (!next)
      cur[key] = {}
    cur = cur[key] as Record<string, ColorNode>
  }
  const last = parts.at(-1)!
  const existing = cur[last]
  if (existing && typeof existing === 'object')
    existing.DEFAULT = value
  else
    cur[last] = value
}
