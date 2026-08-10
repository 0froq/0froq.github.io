/** Format a duration from milliseconds into a short human string. */
export function formatUptime(ms: number, locale: string): string {
  if (!Number.isFinite(ms) || ms < 0)
    ms = 0

  const sec = Math.floor(ms / 1000)
  const days = Math.floor(sec / 86400)
  const hours = Math.floor((sec % 86400) / 3600)
  const zh = locale.startsWith('zh')

  if (days >= 365) {
    const years = Math.floor(days / 365)
    const remDays = days % 365
    if (zh) {
      return remDays > 0 ? `${years} 年 ${remDays} 天` : `${years} 年`
    }
    return remDays > 0 ? `${years}y ${remDays}d` : `${years}y`
  }

  if (days >= 1) {
    if (zh)
      return hours > 0 ? `${days} 天 ${hours} 小时` : `${days} 天`
    return hours > 0 ? `${days}d ${hours}h` : `${days}d`
  }

  if (zh)
    return hours > 0 ? `${hours} 小时` : `${Math.max(1, Math.floor(sec / 60))} 分钟`
  return hours > 0 ? `${hours}h` : `${Math.max(1, Math.floor(sec / 60))}m`
}

export function formatCompactNumber(n: number, locale: string): string {
  try {
    return new Intl.NumberFormat(locale.startsWith('zh') ? 'zh-CN' : 'en', {
      notation: n >= 10000 ? 'compact' : 'standard',
      maximumFractionDigits: 1,
    }).format(n)
  }
  catch {
    return String(n)
  }
}
