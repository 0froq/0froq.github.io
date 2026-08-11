import type { Env } from './types'
import { DurableObject } from 'cloudflare:workers'

/** Same anonId + pagePath within this window does not increment totalVisits again. */
const VISIT_DEBOUNCE_MS = 5 * 60 * 1000
/** Drop online sessions that have not heartbeated within this window. */
const STALE_MS = 45_000
/** Alarm cadence for pruning idle online sessions. */
const ALARM_MS = 60_000
/** Site-like rate limit: max likes per window. */
const LIKE_LIMIT = 10
/** Site-like rate limit window. */
const LIKE_WINDOW_MS = 20 * 60 * 1000

export interface PageOnlineRow {
  pagePath: string
  viewing: number
}

export interface PageVisitRow {
  pagePath: string
  visits: number
}

export interface PageLikeRow {
  pagePath: string
  likes: number
}

export interface SiteCounters {
  uniqueVisitors: number
  totalVisits: number
  online: number
  pages: PageOnlineRow[]
  pageVisits: PageVisitRow[]
  pageLikes: PageLikeRow[]
  siteLikes: number
}

export interface LikeResult {
  ok: boolean
  /** Likes for the target (site or page). */
  likes: number
  siteLikes: number
  pagePath?: string
  remaining: number
  retryAfterMs: number
}

/**
 * Singleton site-wide counters (idFromName("site")).
 * Fine for personal-blog traffic; avoid this pattern for high-QPS globals.
 */
export class SiteStats extends DurableObject<Env> {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env)
    this.ctx.blockConcurrencyWhile(async () => {
      this.ctx.storage.sql.exec(`
        CREATE TABLE IF NOT EXISTS meta (
          key TEXT PRIMARY KEY,
          value INTEGER NOT NULL
        )
      `)
      this.ctx.storage.sql.exec(`
        CREATE TABLE IF NOT EXISTS visitors (
          anon_id TEXT PRIMARY KEY,
          first_seen INTEGER NOT NULL
        )
      `)
      this.ctx.storage.sql.exec(`
        CREATE TABLE IF NOT EXISTS visit_debounce (
          visit_key TEXT PRIMARY KEY,
          last_visit INTEGER NOT NULL
        )
      `)
      this.ctx.storage.sql.exec(`
        CREATE TABLE IF NOT EXISTS page_visits (
          page_path TEXT PRIMARY KEY,
          visits INTEGER NOT NULL
        )
      `)
      this.ctx.storage.sql.exec(`
        CREATE TABLE IF NOT EXISTS online_sessions (
          visitor_key TEXT PRIMARY KEY,
          last_seen INTEGER NOT NULL
        )
      `)
      const cols = this.ctx.storage.sql.exec(
        `PRAGMA table_info(online_sessions)`,
      ).toArray()
      if (!cols.some(c => String(c.name) === 'page_path')) {
        this.ctx.storage.sql.exec(
          `ALTER TABLE online_sessions ADD COLUMN page_path TEXT NOT NULL DEFAULT ''`,
        )
      }
      this.ctx.storage.sql.exec(
        `INSERT OR IGNORE INTO meta (key, value) VALUES ('unique_visitors', 0)`,
      )
      this.ctx.storage.sql.exec(
        `INSERT OR IGNORE INTO meta (key, value) VALUES ('total_visits', 0)`,
      )
      this.ctx.storage.sql.exec(
        `INSERT OR IGNORE INTO meta (key, value) VALUES ('site_likes', 0)`,
      )
      this.ctx.storage.sql.exec(`
        CREATE TABLE IF NOT EXISTS like_rate (
          anon_id TEXT PRIMARY KEY,
          timestamps TEXT NOT NULL
        )
      `)
      this.ctx.storage.sql.exec(`
        CREATE TABLE IF NOT EXISTS page_likes (
          page_path TEXT PRIMARY KEY,
          likes INTEGER NOT NULL
        )
      `)
      this.ctx.storage.sql.exec(`
        CREATE TABLE IF NOT EXISTS page_like_rate (
          rate_key TEXT PRIMARY KEY,
          timestamps TEXT NOT NULL
        )
      `)
    })
  }

  private getMeta(key: string): number {
    const rows = this.ctx.storage.sql.exec(
      `SELECT value FROM meta WHERE key = ?`,
      key,
    ).toArray()
    if (!rows.length)
      return 0
    return Number(rows[0].value) || 0
  }

  private setMeta(key: string, value: number): void {
    this.ctx.storage.sql.exec(
      `INSERT INTO meta (key, value) VALUES (?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
      key,
      value,
    )
  }

  private pruneOnline(now: number): void {
    this.ctx.storage.sql.exec(
      `DELETE FROM online_sessions WHERE last_seen < ?`,
      now - STALE_MS,
    )
  }

  private countOnline(): number {
    const row = this.ctx.storage.sql.exec(
      `SELECT COUNT(*) AS c FROM online_sessions`,
    ).one()
    return Number(row.c)
  }

  private listPages(): PageOnlineRow[] {
    const rows = this.ctx.storage.sql.exec(
      `SELECT page_path AS pagePath, COUNT(*) AS viewing
       FROM online_sessions
       WHERE page_path != ''
       GROUP BY page_path
       ORDER BY viewing DESC, page_path ASC`,
    ).toArray()
    return rows.map(r => ({
      pagePath: String(r.pagePath),
      viewing: Number(r.viewing),
    }))
  }

  private listPageVisits(): PageVisitRow[] {
    const rows = this.ctx.storage.sql.exec(
      `SELECT page_path AS pagePath, visits
       FROM page_visits
       ORDER BY visits DESC, page_path ASC`,
    ).toArray()
    return rows.map(r => ({
      pagePath: String(r.pagePath),
      visits: Number(r.visits),
    }))
  }

  private listPageLikes(): PageLikeRow[] {
    const rows = this.ctx.storage.sql.exec(
      `SELECT page_path AS pagePath, likes
       FROM page_likes
       ORDER BY likes DESC, page_path ASC`,
    ).toArray()
    return rows.map(r => ({
      pagePath: String(r.pagePath),
      likes: Number(r.likes),
    }))
  }

  private readRateStamps(table: 'like_rate' | 'page_like_rate', key: string, keyCol: string): number[] {
    const row = this.ctx.storage.sql.exec(
      `SELECT timestamps FROM ${table} WHERE ${keyCol} = ?`,
      key,
    ).toArray()
    if (!row.length)
      return []
    try {
      const parsed = JSON.parse(String(row[0].timestamps)) as unknown
      if (!Array.isArray(parsed))
        return []
      return parsed.map(Number).filter(n => Number.isFinite(n))
    }
    catch {
      return []
    }
  }

  private writeRateStamps(
    table: 'like_rate' | 'page_like_rate',
    key: string,
    keyCol: string,
    stamps: number[],
  ): void {
    this.ctx.storage.sql.exec(
      `INSERT INTO ${table} (${keyCol}, timestamps) VALUES (?, ?)
       ON CONFLICT(${keyCol}) DO UPDATE SET timestamps = excluded.timestamps`,
      key,
      JSON.stringify(stamps),
    )
  }

  private async ensureAlarm(now: number): Promise<void> {
    const existing = await this.ctx.storage.getAlarm()
    if (existing == null)
      await this.ctx.storage.setAlarm(now + ALARM_MS)
  }

  async online(): Promise<number> {
    this.pruneOnline(Date.now())
    return this.countOnline()
  }

  async heartbeat(
    visitorKey: string,
    pagePath: string,
  ): Promise<{ online: number, pages: PageOnlineRow[] }> {
    const now = Date.now()
    this.ctx.storage.sql.exec(
      `INSERT INTO online_sessions (visitor_key, page_path, last_seen) VALUES (?, ?, ?)
       ON CONFLICT(visitor_key) DO UPDATE SET
         page_path = excluded.page_path,
         last_seen = excluded.last_seen`,
      visitorKey,
      pagePath,
      now,
    )
    this.pruneOnline(now)
    await this.ensureAlarm(now)
    return {
      online: this.countOnline(),
      pages: this.listPages(),
    }
  }

  async leaveOnline(
    visitorKey: string,
  ): Promise<{ online: number, pages: PageOnlineRow[] }> {
    this.ctx.storage.sql.exec(
      `DELETE FROM online_sessions WHERE visitor_key = ?`,
      visitorKey,
    )
    return {
      online: this.countOnline(),
      pages: this.listPages(),
    }
  }

  async get(): Promise<SiteCounters> {
    this.pruneOnline(Date.now())
    return {
      uniqueVisitors: this.getMeta('unique_visitors'),
      totalVisits: this.getMeta('total_visits'),
      online: this.countOnline(),
      pages: this.listPages(),
      pageVisits: this.listPageVisits(),
      pageLikes: this.listPageLikes(),
      siteLikes: this.getMeta('site_likes'),
    }
  }

  /**
   * Increment likes with per-anon sliding-window rate limit.
   * Omit `pagePath` for site-wide likes; pass it for per-article likes.
   */
  async like(anonId: string, pagePath?: string): Promise<LikeResult> {
    const now = Date.now()
    const siteLikes = this.getMeta('site_likes')

    if (pagePath) {
      const rateKey = `${anonId}\0${pagePath}`
      let stamps = this.readRateStamps('page_like_rate', rateKey, 'rate_key')
        .filter(t => now - t < LIKE_WINDOW_MS)

      const pageRow = this.ctx.storage.sql.exec(
        `SELECT likes FROM page_likes WHERE page_path = ?`,
        pagePath,
      ).toArray()
      const currentPageLikes = pageRow.length ? Number(pageRow[0].likes) || 0 : 0

      if (stamps.length >= LIKE_LIMIT) {
        const oldest = Math.min(...stamps)
        return {
          ok: false,
          likes: currentPageLikes,
          siteLikes,
          pagePath,
          remaining: 0,
          retryAfterMs: Math.max(0, LIKE_WINDOW_MS - (now - oldest)),
        }
      }

      stamps.push(now)
      this.writeRateStamps('page_like_rate', rateKey, 'rate_key', stamps)
      this.ctx.storage.sql.exec(
        `INSERT INTO page_likes (page_path, likes) VALUES (?, 1)
         ON CONFLICT(page_path) DO UPDATE SET likes = likes + 1`,
        pagePath,
      )
      const next = currentPageLikes + 1
      return {
        ok: true,
        likes: next,
        siteLikes,
        pagePath,
        remaining: LIKE_LIMIT - stamps.length,
        retryAfterMs: 0,
      }
    }

    let stamps = this.readRateStamps('like_rate', anonId, 'anon_id')
      .filter(t => now - t < LIKE_WINDOW_MS)

    if (stamps.length >= LIKE_LIMIT) {
      const oldest = Math.min(...stamps)
      return {
        ok: false,
        likes: siteLikes,
        siteLikes,
        remaining: 0,
        retryAfterMs: Math.max(0, LIKE_WINDOW_MS - (now - oldest)),
      }
    }

    stamps.push(now)
    this.writeRateStamps('like_rate', anonId, 'anon_id', stamps)
    this.setMeta('site_likes', siteLikes + 1)
    const next = siteLikes + 1
    return {
      ok: true,
      likes: next,
      siteLikes: next,
      remaining: LIKE_LIMIT - stamps.length,
      retryAfterMs: 0,
    }
  }

  /**
   * Record a visitor. When `countVisit` is true, may increment totalVisits
   * (debounced per anonId+pagePath).
   */
  async visit(
    anonId: string,
    pagePath: string,
    countVisit: boolean,
  ): Promise<Pick<SiteCounters, 'uniqueVisitors' | 'totalVisits' | 'pageVisits'>> {
    const now = Date.now()

    const existing = this.ctx.storage.sql.exec(
      `SELECT 1 AS ok FROM visitors WHERE anon_id = ?`,
      anonId,
    ).toArray()

    if (existing.length === 0) {
      this.ctx.storage.sql.exec(
        `INSERT INTO visitors (anon_id, first_seen) VALUES (?, ?)`,
        anonId,
        now,
      )
      this.setMeta('unique_visitors', this.getMeta('unique_visitors') + 1)
    }

    if (countVisit) {
      const visitKey = `${anonId}\0${pagePath}`
      const prev = this.ctx.storage.sql.exec(
        `SELECT last_visit FROM visit_debounce WHERE visit_key = ?`,
        visitKey,
      ).toArray()

      const lastVisit = prev.length ? Number(prev[0].last_visit) : 0
      if (!lastVisit || now - lastVisit >= VISIT_DEBOUNCE_MS) {
        this.ctx.storage.sql.exec(
          `INSERT INTO visit_debounce (visit_key, last_visit) VALUES (?, ?)
           ON CONFLICT(visit_key) DO UPDATE SET last_visit = excluded.last_visit`,
          visitKey,
          now,
        )
        this.setMeta('total_visits', this.getMeta('total_visits') + 1)
        this.ctx.storage.sql.exec(
          `INSERT INTO page_visits (page_path, visits) VALUES (?, 1)
           ON CONFLICT(page_path) DO UPDATE SET visits = visits + 1`,
          pagePath,
        )
      }
    }

    return {
      uniqueVisitors: this.getMeta('unique_visitors'),
      totalVisits: this.getMeta('total_visits'),
      pageVisits: this.listPageVisits(),
    }
  }

  async alarm(): Promise<void> {
    const now = Date.now()
    this.pruneOnline(now)
    if (this.countOnline() > 0)
      await this.ctx.storage.setAlarm(now + ALARM_MS)
  }
}
