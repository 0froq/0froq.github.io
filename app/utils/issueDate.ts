const DATE_REGEX = /(\d{4})-(\d{2})-(\d{2})/
const YEAR_REGEX = /^(\d{4})/

export function issueDate(value?: string): string {
  if (!value)
    return ''
  const match = value.match(DATE_REGEX)
  if (match)
    return `${match[1]}/${match[2]}/${match[3]}`
  return value
}

export function issueYear(value?: string): string {
  return value?.match(YEAR_REGEX)?.[1] || ''
}

const ZH_DIGITS = '〇一二三四五六七八九'

export function issueYearMark(value?: string, script: 'zh' | 'en' = 'en'): string {
  const year = issueYear(value)
  if (!year)
    return ''
  if (script === 'en')
    return year
  return Array.from(year, digit => ZH_DIGITS[Number(digit)] ?? digit).join('')
}

export function issueMonthDay(date = new Date()): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${month} / ${day}`
}

export interface CreatedParts {
  year: string
  month: string
  day: string
}

/** Blank Y/M/D cells that match the previous row, for the collapsing date column. */
export function buildCreatedParts(createdList: Array<string | undefined>): CreatedParts[] {
  return createdList.map((raw, index) => {
    const match = raw?.match(DATE_REGEX)
    const year = match?.[1] ?? ''
    const month = match?.[2] ?? ''
    const day = match?.[3] ?? ''
    const prev = createdList[index - 1]?.match(DATE_REGEX)
    if (!prev)
      return { year, month, day }
    const sameYear = year === prev[1]
    const sameMonth = sameYear && month === prev[2]
    const sameDay = sameMonth && day === prev[3]
    return {
      year: sameYear ? '' : year,
      month: sameMonth ? '' : month,
      day: sameDay ? '' : day,
    }
  })
}
