export interface TaskNote {
  text: string
  url?: string
}

export interface TaskItem {
  title: string
  status?: string
  priority?: 'high' | 'medium' | 'low'
  dod?: string
  due?: string
  notes?: TaskNote[]
  tags?: string[]
}

export interface TaskStatusConfig {
  label: string
}

export type TaskProgress = { done: number, total: number } | number

export interface VisionItem {
  title: string
  notes?: TaskNote[]
  locale?: string
}

export interface GlobalVision {
  type: 'global'
  items: VisionItem[]
}

export interface YearVision {
  type: 'year'
  year: string
  items: VisionItem[]
}

export interface VisionsData {
  global: GlobalVision
  years: YearVision[]
  currentYear: YearVision | null
}

export interface HintItem {
  title: string
  description?: string
  category: string
  notes?: TaskNote[]
  locale?: string
}

export interface HintCategory {
  category: string
  items: HintItem[]
}

export interface FenceData {
  categories: Record<string, HintCategory[]>
}

export interface TipData {
  categories: Record<string, HintCategory[]>
}

export interface HintsData {
  fence: FenceData
  tip: TipData
}

// ── Board (consolidated dashboard) ──

export type BoardTaskStatus = 'done' | 'inProgress' | 'notStarted' | 'deferred' | 'deffered' | 'cancelled' | 'blocked'

export interface BoardTask {
  title: string
  status?: BoardTaskStatus
  priority?: 'high' | 'medium' | 'low'
  dod?: string
  due?: string
  notes?: TaskNote[]
  tags?: string[]
  since?: string
  completed?: string
}

export interface BoardData {
  updated: string
  weekTheme?: string
  active: BoardTask[]
  backlog: BoardTask[]
  archive: BoardTask[]
}
