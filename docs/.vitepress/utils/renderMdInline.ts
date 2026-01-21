import MarkdownIt from 'markdown-it'
import MarkdownItMathjax3 from 'markdown-it-mathjax3'

export function renderMdInline(text: string | undefined) {
  if (!text) {
    return ''
  }
  const md = new MarkdownIt()
    .use(MarkdownItMathjax3)
  return md.renderInline(text)
}
