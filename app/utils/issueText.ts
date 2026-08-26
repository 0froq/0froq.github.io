export function issueHeadline(title: string): string {
  const chars = [...title]
  if (/[\s\n]/.test(title) || chars.length < 6 || chars.length > 14)
    return title
  const mid = Math.ceil(chars.length / 2)
  return `${chars.slice(0, mid).join('')}\n${chars.slice(mid).join('')}`
}

export function issuePlainText(input: unknown, max = 320): string {
  const chunks: string[] = []
  visit(input, chunks)
  const text = chunks.join('').replace(/\s+/g, ' ').trim()
  if (text.length <= max)
    return text
  return `${text.slice(0, max).replace(/\s+\S*$/, '')}…`
}

function visit(node: unknown, chunks: string[]): void {
  if (node == null)
    return
  if (typeof node === 'string') {
    chunks.push(node)
    return
  }
  if (Array.isArray(node)) {
    if (typeof node[0] === 'string' && node.length >= 2 && typeof node[1] === 'object') {
      node.slice(2).forEach(child => visit(child, chunks))
      return
    }
    node.forEach(child => visit(child, chunks))
    return
  }
  if (typeof node === 'object') {
    const record = node as {
      value?: unknown
      children?: unknown
      body?: unknown
    }
    if (typeof record.value === 'string')
      chunks.push(record.value)
    else
      visit(record.value, chunks)
    visit(record.children, chunks)
    visit(record.body, chunks)
  }
}
