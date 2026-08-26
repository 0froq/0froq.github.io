export type Scrap = {
  id: string
  text: string
  detail?: string
  date?: string
  pinned?: boolean
}

export type ScrapReactionState = {
  counts: Record<string, number>
  mine: string | null
}

export const SCRAP_REACTION_EMOJIS = ['👍', '❤️', '😮', '✨', '📌'] as const

export const SCRAP_REACTION_ICONS: Record<string, string> = {
  '👍': 'i-openmj-thumbs-up?bg',
  '❤️': 'i-openmj-red-heart?bg',
  '😮': 'i-openmj-face-with-open-mouth?bg',
  '✨': 'i-openmj-sparkles?bg',
  '📌': 'i-openmj-pushpin?bg',
}

export const SCRAP_REACTION_LABELS: Record<string, string> = {
  '👍': 'thumbs up',
  '❤️': 'heart',
  '😮': 'surprise',
  '✨': 'sparkles',
  '📌': 'pin',
}
