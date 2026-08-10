/** Collapsed year/month/day cells for consecutive article rows. */
export interface CreatedComponent {
  year: string
  month: string
  day: string
}

export function toDate(value: Date | string | number): Date {
  return value instanceof Date ? value : new Date(value)
}

/**
 * Build per-row date display parts. Matching consecutive Y/M/D with the
 * previous row are blanked (shown as placeholders in the UI).
 */
export function buildCreatedComponents(
  createdList: Array<Date | string | number>,
): CreatedComponent[] {
  return createdList.map((raw, index) => {
    const date = toDate(raw)
    const year = date.getFullYear().toString()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')

    const prev = createdList[index - 1]
    if (!prev) {
      return { year, month, day }
    }

    const prevDate = toDate(prev)
    const prevYear = prevDate.getFullYear().toString()
    const prevMonth = (prevDate.getMonth() + 1).toString().padStart(2, '0')
    const prevDay = prevDate.getDate().toString().padStart(2, '0')

    const sameYear = year === prevYear
    const sameMonth = sameYear && month === prevMonth
    const sameDay = sameMonth && day === prevDay

    return {
      year: sameYear ? '' : year,
      month: sameMonth ? '' : month,
      day: sameDay ? '' : day,
    }
  })
}
