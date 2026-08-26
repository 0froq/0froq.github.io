import type { ScrapReactionState } from '~/utils/scraps'
import { loadScraps } from '~/utils/loadScraps'

export function useScrapsBoard() {
  const scraps = loadScraps()
  const anonId = useAnonId()
  const { getScrapReactions, reactToScrap } = useFroqApi()
  const reactions = ref<Record<string, ScrapReactionState>>({})
  const pending = ref(false)

  async function hydrate(ids: string[]) {
    const missing = ids.filter(id => id && !reactions.value[id])
    if (!missing.length)
      return
    const next = await getScrapReactions(missing, anonId.value || undefined)
    reactions.value = { ...reactions.value, ...next }
  }

  async function onReact(scrapId: string, emoji: string) {
    if (!anonId.value || pending.value)
      return
    pending.value = true
    const state = await reactToScrap(scrapId, emoji, anonId.value)
    pending.value = false
    if (state)
      reactions.value = { ...reactions.value, [scrapId]: state }
  }

  watch(anonId, () => hydrate(scraps.map(s => s.id)), { immediate: true })

  return { scraps, reactions, pending, onReact }
}
