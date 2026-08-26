export function issueDate(value?: string): string {
  if (!value)
    return ''
  const match = value.match(/(\d{4})-(\d{2})-(\d{2})/)
  if (match)
    return `${match[2]}.${match[3]}`
  return value
}

export function issueYear(value?: string): string {
  return value?.match(/^(\d{4})/)?.[1] || ''
}

const ZH_DIGITS = '〇一二三四五六七八九'

export function issueYearMark(value?: string, script: 'zh' | 'en' = 'en'): string {
  const year = issueYear(value)
  if (!year)
    return ''
  if (script === 'en')
    return year
  return [...year].map(digit => ZH_DIGITS[Number(digit)] ?? digit).join('')
}

export function issueMonthDay(date = new Date()): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${month} / ${day}`
}
