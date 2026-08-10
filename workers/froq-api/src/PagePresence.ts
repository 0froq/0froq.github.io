import { DurableObject } from 'cloudflare:workers'
import type { Env } from './types'

/** Drop sessions that have not heartbeated within this window. */
const STALE_MS = 45_000
/** Alarm cadence for pruning idle sessions. */
const ALARM_MS = 60_000

/**
 * One Durable Object per page path (idFromName(pagePath)).
 * Tracks who is currently viewing that page via HTTP heartbeats.
 */
export class PagePresence extends DurableObject<Env> {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env)
    this.ctx.blockConcurrencyWhile(async () => {
      this.ctx.storage.sql.exec(`
        CREATE TABLE IF NOT EXISTS sessions (
          visitor_key TEXT PRIMARY KEY,
          last_seen INTEGER NOT NULL
        )
      `)
    })
  }

  private prune(now: number): void {
    this.ctx.storage.sql.exec(
      `DELETE FROM sessions WHERE last_seen < ?`,
      now - STALE_MS,
    )
  }

  private count(): number {
    const row = this.ctx.storage.sql.exec(
      `SELECT COUNT(*) AS c FROM sessions`,
    ).one()
    return Number(row.c)
  }

  private async ensureAlarm(now: number): Promise<void> {
    const existing = await this.ctx.storage.getAlarm()
    if (existing == null)
      await this.ctx.storage.setAlarm(now + ALARM_MS)
  }

  async heartbeat(visitorKey: string): Promise<number> {
    const now = Date.now()
    this.ctx.storage.sql.exec(
      `INSERT INTO sessions (visitor_key, last_seen) VALUES (?, ?)
       ON CONFLICT(visitor_key) DO UPDATE SET last_seen = excluded.last_seen`,
      visitorKey,
      now,
    )
    this.prune(now)
    await this.ensureAlarm(now)
    return this.count()
  }

  async leave(visitorKey: string): Promise<number> {
    this.ctx.storage.sql.exec(
      `DELETE FROM sessions WHERE visitor_key = ?`,
      visitorKey,
    )
    return this.count()
  }

  async viewing(): Promise<number> {
    this.prune(Date.now())
    return this.count()
  }

  async alarm(): Promise<void> {
    const now = Date.now()
    this.prune(now)
    if (this.count() > 0)
      await this.ctx.storage.setAlarm(now + ALARM_MS)
  }
}
