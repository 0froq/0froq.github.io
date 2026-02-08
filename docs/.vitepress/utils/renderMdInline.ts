import MarkdownIt from 'markdown-it'
import MarkdownItMathjax3 from 'markdown-it-mathjax3'
import MarkdownItMdc from 'markdown-it-mdc'

export function renderMdInline(text: string | undefined) {
  if (!text) {
    return ''
  }
  const md = new MarkdownIt()
    .use(MarkdownItMathjax3)
    .use(MarkdownItMdc)
  return md.renderInline(text)
}
