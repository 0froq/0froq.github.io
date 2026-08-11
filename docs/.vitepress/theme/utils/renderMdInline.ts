import MarkdownIt from 'markdown-it'
import MarkdownItMathjax3 from 'markdown-it-mathjax3'
import MarkdownItMdc from 'markdown-it-mdc'

export function renderMdInline(text: unknown) {
  if (text == null || text === '')
    return ''
  const src = typeof text === 'string' ? text : String(text)
  const md = new MarkdownIt()
    .use(MarkdownItMathjax3)
    .use(MarkdownItMdc)
  return md.renderInline(src)
}
