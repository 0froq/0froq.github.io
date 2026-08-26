export function formatUptime(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0)
    ms = 0
  const sec = Math.floor(ms / 1000)
  const days = Math.floor(sec / 86400)
  const hours = Math.floor((sec % 86400) / 3600)
  if (days >= 365) {
    const years = Math.floor(days / 365)
    const rem = days % 365
    return rem > 0 ? `${years}y ${rem}d` : `${years}y`
  }
  if (days >= 1)
    return hours > 0 ? `${days}d ${hours}h` : `${days}d`
  return hours > 0 ? `${hours}h` : `${Math.max(1, Math.floor(sec / 60))}m`
}

export function formatCompact(n: number): string {
  try {
    return new Intl.NumberFormat('en', {
      notation: n >= 10000 ? 'compact' : 'standard',
      maximumFractionDigits: 1,
    }).format(n)
  }
  catch {
    return String(n)
  }
}
