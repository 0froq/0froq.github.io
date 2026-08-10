import { DurableObject } from 'cloudflare:workers'
import type { Env } from './types'

/** Same anonId + pagePath within this window does not increment totalVisits again. */
const VISIT_DEBOUNCE_MS = 5 * 60 * 1000

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
      this.ctx.storage.sql.exec(
        `INSERT OR IGNORE INTO meta (key, value) VALUES ('unique_visitors', 0)`,
      )
      this.ctx.storage.sql.exec(
        `INSERT OR IGNORE INTO meta (key, value) VALUES ('total_visits', 0)`,
      )
    })
  }

  private getMeta(key: string): number {
    const row = this.ctx.storage.sql.exec(
      `SELECT value FROM meta WHERE key = ?`,
      key,
    ).one()
    return Number(row.value)
  }

  private setMeta(key: string, value: number): void {
    this.ctx.storage.sql.exec(
      `UPDATE meta SET value = ? WHERE key = ?`,
      value,
      key,
    )
  }

  async get(): Promise<{ uniqueVisitors: number, totalVisits: number }> {
    return {
      uniqueVisitors: this.getMeta('unique_visitors'),
      totalVisits: this.getMeta('total_visits'),
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
  ): Promise<{ uniqueVisitors: number, totalVisits: number }> {
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
      }
    }

    return this.get()
  }
}
