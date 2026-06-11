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

export type DayTaskPriority = 'high' | 'medium' | 'low'

export interface DayTask {
  title: string
  status: 'done' | 'inProgress' | 'notStarted' | 'deferred' | 'deffered' | 'cancelled' | 'blocked'
  priority?: DayTaskPriority
  dod?: string
  notes?: TaskNote[]
  tags?: string[]
}

export interface DayRecord {
  date: string
  theme?: string
  tasks: DayTask[]
  file: string
}

export interface DayData {
  today: string
  currentDay: DayRecord | null
  days: DayRecord[]
}

export type WeekTaskPriority = 'high' | 'medium' | 'low'

export interface WeekTask {
  title: string
  status: 'done' | 'inProgress' | 'notStarted' | 'deferred' | 'deffered' | 'cancelled' | 'blocked'
  priority?: WeekTaskPriority
  dod?: string
  notes?: TaskNote[]
  tags?: string[]
}

export interface WeekData {
  theme?: string
  start: string
  end: string
  tasks: WeekTask[]
}

export interface WeekDashboardData {
  today: string
  currentStart: string
  currentWeek: WeekData | null
  weeks: Array<{
    start: string
    end: string
    file: string
  }>
}

export interface BacklogItem {
  title: string
  status: 'notPlanned' | 'arranging' | 'deferred' | 'deffered'
  due?: string
  dod?: string
  notes?: TaskNote[]
  locale?: string
}

export interface BacklogRecord {
  month: string
  items: BacklogItem[]
  file: string
}

export interface BacklogData {
  currentMonth: string
  current: BacklogRecord | null
  months: BacklogRecord[]
}

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

export type CalendarEventSource = 'board' | 'schedule'

export interface ScheduleItem {
  id?: string
  title: string
  start: string
  end: string
  type?: string
  content?: string
  url?: string
  notes?: TaskNote[]
  allDay?: boolean
}

export interface ScheduleData {
  updated?: string
  schedule: ScheduleItem[]
}

export interface DashboardCalendarEvent {
  id: string
  title: string
  start: string
  end: string
  source: CalendarEventSource
  type: string
  content?: string
  url?: string
  allDay?: boolean
  status?: BoardTaskStatus
  priority?: 'high' | 'medium' | 'low'
  raw?: BoardTask | ScheduleItem
}

export interface DashboardCalendarData {
  updated: string
  events: DashboardCalendarEvent[]
}

export interface BoardData {
  updated: string
  weekTheme?: string
  active: BoardTask[]
  backlog: BoardTask[]
  archive: BoardTask[]
}
