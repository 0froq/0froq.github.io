import type { TimeWindow, WindowType } from './types.ts'

export function getDailyWindow(date: string): TimeWindow {
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  const end = new Date(date)
  end.setHours(23, 59, 59, 999)
  
  return { type: 'daily', id: date, start: start.toISOString(), end: end.toISOString() }
}

export function getWeeklyWindow(weekId: string): TimeWindow {
  const start = new Date(weekId)
  start.setHours(0, 0, 0, 0)
  const end = new Date(weekId)
  end.setDate(end.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  
  return { type: 'weekly', id: weekId, start: start.toISOString(), end: end.toISOString() }
}

export function isInWindow(timestamp: string, window: TimeWindow): boolean {
  const t = new Date(timestamp).getTime()
  return t >= new Date(window.start).getTime() && t <= new Date(window.end).getTime()
}
