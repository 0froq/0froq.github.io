import MarkdownIt from 'markdown-it'
import MarkdownItMathjax3 from 'markdown-it-mathjax3'
import MarkdownItMdc from 'markdown-it-mdc'

// @login 匹配（GitHub login：字母/数字/连字符）
const MENTION_RE = /^@([\w-]+)/

// 模块级单例（markdown-it 实例可复用，避免每次渲染重建）
let md: MarkdownIt | null = null

function getMd(): MarkdownIt {
  if (!md) {
    md = new MarkdownIt()
      .use(MarkdownItMathjax3)
      .use(MarkdownItMdc)
    // @login → GitHub 链接（GitHub GFM 专有，markdown-it 默认不支持）
    md.inline.ruler.before('text', 'mention', (state, silent) => {
      const src = state.src
      if (src[state.pos] !== '@')
        return false
      const m = MENTION_RE.exec(src.slice(state.pos))
      if (!m)
        return false
      if (!silent) {
        const link = state.push('link_open', 'a', 1)
        link.attrs = [
          ['href', `https://github.com/${m[1]}`],
          ['target', '_blank'],
          ['rel', 'noopener'],
        ]
        const text = state.push('text', '', 0)
        text.content = m[0]
        state.push('link_close', 'a', -1)
      }
      state.pos += m[0].length
      return true
    })
  }
  return md
}

/** 块级 markdown 渲染（支持 `> 引用`、`@mention` 等；回复正文用） */
export function renderMdBlock(text: string | undefined): string {
  if (!text)
    return ''
  return getMd().render(text)
}
