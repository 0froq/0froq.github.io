export interface BoardNote {
  text: string
  url?: string
}

export interface BoardTask {
  title: string
  status?: string
  priority?: string
  dod?: string
  due?: string
  completed?: string
  notes?: BoardNote[]
  tags?: string[]
}

export interface BoardData {
  updated: string
  weekTheme?: string
  active: BoardTask[]
  backlog: BoardTask[]
  archive: BoardTask[]
}

export const TASK_STATUS: Record<string, string> = {
  done: 'Done',
  inProgress: 'In progress',
  notStarted: 'Not started',
  deferred: 'Deferred',
  deffered: 'Deferred',
  cancelled: 'Cancelled',
  blocked: 'Blocked',
}
