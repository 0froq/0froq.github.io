import type { LayerEntry } from '~/utils/issueList'

export type IssueHubKind = 'corpus' | 'posts'

export function useIssueVisibility(kind: IssueHubKind) {
  const showDraft = useState(`${kind}-show-draft`, () => true)
  const showVoid = useState(`${kind}-show-void`, () => false)
  const showAigc = useState('corpus-show-aigc', () => true)
  const showExcerpt = useState(`${kind}-show-excerpt`, () => false)

  function visible(entry: Pick<LayerEntry, 'aigc' | 'status'>) {
    switch (kind) {
      case 'corpus':
        if (!showAigc.value && entry.aigc)
          return false
        break
      case 'posts':
        break
      default: {
        const _never: never = kind
        return _never
      }
    }
    if (!showVoid.value && entry.status === 'void')
      return false
    if (!showDraft.value && entry.status === 'draft')
      return false
    return true
  }

  return { showAigc, showDraft, showVoid, showExcerpt, visible }
}
