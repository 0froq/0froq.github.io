// @env node
import { existsSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const publicRoot = join(dirname(fileURLToPath(import.meta.url)), '../public')
const SHARE_IMAGE = /\.(?:png|jpe?g|webp|gif|svg)$/i

/** URL paths of files under `public/`, e.g. `/og.png`, `/covers/publication/essays/slug.png`. */
export function listPublicFiles(root = publicRoot): string[] {
  if (!existsSync(root))
    return []
  const out: string[] = []
  const walk = (dir: string): void => {
    for (const name of readdirSync(dir)) {
      const full = join(dir, name)
      if (statSync(full).isDirectory())
        walk(full)
      else
        out.push(`/${relative(root, full).split(sep).join('/')}`)
    }
  }
  walk(root)
  return out
}

export function listPublicShareImages(root = publicRoot): string[] {
  return listPublicFiles(root).filter(path => SHARE_IMAGE.test(path))
}
