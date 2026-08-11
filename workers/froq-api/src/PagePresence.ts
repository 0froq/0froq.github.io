import type { Env } from './types'
import { DurableObject } from 'cloudflare:workers'

/** Drop HTTP sessions that have not heartbeated within this window. */
const STALE_MS = 45_000
/** Alarm cadence for pruning idle sessions. */
const ALARM_MS = 60_000
/** Ghost WS: no presence updates → omit from peer list (offline). */
const GHOST_IDLE_MS = 5 * 60_000
/** Site owner — never idle-offline while presenting as this login. */
const GHOST_OWNER_GH = '0froq'

interface WsAttachment {
  /** Per-tab socket id (same browser can have multiple tabs). */
  tabId: string
  /** Stable browser persona seed. */
  anonId: string
  /** When presenting as GitHub (optional). */
  ghLogin: string | null
  /** Reading progress 0–1, quantized. */
  p: number
  /** Viewport-normalized pointer 0–1, or -1 if unknown. */
  x: number
  y: number
  /** CSS viewport size in px (for pointer compatibility). */
  vw: number
  vh: number
  /** Last presence / identity activity (ms). */
  lastActive: number
}

interface PeerRow {
  id: string
  anonId: string
  ghLogin?: string | null
  p: number
  x: number
  y: number
  vw: number
  vh: number
}

/** Rate limit: min gap between pokes from one tab to the same target. */
const POKE_COOLDOWN_MS = 2_500

const lastPokeAt = new Map<string, number>()

/**
 * One Durable Object per page path (idFromName(pagePath)).
 * - HTTP RPC: heartbeat / leave / viewing (site stats)
 * - WebSocket hibernation: ghost scroll positions among co-readers
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
    // Drop idle ghosts from peer lists for everyone still connected.
    this.broadcastPeers()
    if (this.count() > 0 || this.ctx.getWebSockets().length > 0)
      await this.ctx.storage.setAlarm(now + ALARM_MS)
  }

  // ── WebSocket hibernation (ghost presence) ──────────────────────────

  async fetch(request: Request): Promise<Response> {
    if (request.headers.get('Upgrade') !== 'websocket') {
      return new Response('expected websocket', { status: 426 })
    }

    const url = new URL(request.url)
    const anonId = url.searchParams.get('anonId')?.trim() || ''
    const tabId = url.searchParams.get('tabId')?.trim() || ''
    const rawGh = url.searchParams.get('ghLogin')?.trim() || ''
    const ghLogin = rawGh && rawGh.length <= 64 ? rawGh.toLowerCase() : null
    if (!anonId || anonId.length > 128) {
      return new Response('anonId required', { status: 400 })
    }
    if (!tabId || tabId.length > 128) {
      return new Response('tabId required', { status: 400 })
    }

    // Same tab reconnecting (identity switch / refresh): close the old
    // socket first so peers never see two identities for one tabId.
    for (const existing of this.ctx.getWebSockets()) {
      const other = existing.deserializeAttachment() as WsAttachment | null
      if (other?.tabId !== tabId)
        continue
      try {
        existing.close(1000, 'replaced')
      }
      catch {
        // ignore
      }
    }

    const pair = new WebSocketPair()
    const [client, server] = Object.values(pair)

    this.ctx.acceptWebSocket(server)
    const now = Date.now()
    const attachment: WsAttachment = {
      tabId,
      anonId,
      ghLogin,
      p: 0,
      x: -1,
      y: -1,
      vw: 0,
      vh: 0,
      lastActive: now,
    }
    server.serializeAttachment(attachment)

    // Snapshot to the newcomer; broadcast so others see them.
    this.sendPeers(server)
    this.broadcastPeers()
    await this.ensureAlarm(now)

    return new Response(null, { status: 101, webSocket: client })
  }

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): Promise<void> {
    if (typeof message !== 'string')
      return

    let data: {
      type?: string
      p?: number
      x?: number
      y?: number
      vw?: number
      vh?: number
      /** Peek / poke another tab by id. */
      target?: string
      /** In-place identity switch (avoid dual-socket flicker). */
      ghLogin?: string | null
    }
    try {
      data = JSON.parse(message) as typeof data
    }
    catch {
      return
    }

    const att = ws.deserializeAttachment() as WsAttachment | null
    if (!att?.tabId || !att.anonId)
      return

    if (data.type === 'identity') {
      const raw = typeof data.ghLogin === 'string' ? data.ghLogin.trim() : ''
      const next = raw && raw.length <= 64 ? raw.toLowerCase() : null
      if (next === att.ghLogin)
        return
      att.ghLogin = next
      att.lastActive = Date.now()
      ws.serializeAttachment(att)
      this.broadcastPeers()
      return
    }

    if (data.type === 'peek') {
      const target = typeof data.target === 'string' ? data.target.trim() : ''
      if (!target || target === att.tabId || target.length > 128)
        return
      const key = `${att.tabId}→${target}`
      const now = Date.now()
      const prev = lastPokeAt.get(key) ?? 0
      if (now - prev < POKE_COOLDOWN_MS)
        return
      lastPokeAt.set(key, now)
      for (const socket of this.ctx.getWebSockets()) {
        const other = socket.deserializeAttachment() as WsAttachment | null
        if (other?.tabId !== target)
          continue
        try {
          const peek: {
            type: 'peek'
            fromAnonId: string
            fromGhLogin?: string
          } = { type: 'peek', fromAnonId: att.anonId }
          if (att.ghLogin)
            peek.fromGhLogin = att.ghLogin
          socket.send(JSON.stringify(peek))
        }
        catch {
          // ignore
        }
        break
      }
      return
    }

    if (data.type === 'progress' || data.type === 'presence' || data.type === 'pointer') {
      let changed = false
      if (typeof data.p === 'number') {
        const next = quantizeUnit(data.p)
        if (next !== att.p) {
          att.p = next
          changed = true
        }
      }
      if (typeof data.x === 'number' && typeof data.y === 'number') {
        const nx = quantizeUnit(data.x, 1000)
        const ny = quantizeUnit(data.y, 1000)
        if (nx !== att.x || ny !== att.y) {
          att.x = nx
          att.y = ny
          changed = true
        }
      }
      if (typeof data.vw === 'number' && typeof data.vh === 'number') {
        const nvw = Math.max(0, Math.round(data.vw))
        const nvh = Math.max(0, Math.round(data.vh))
        if (nvw !== att.vw || nvh !== att.vh) {
          att.vw = nvw
          att.vh = nvh
          changed = true
        }
      }
      if (!changed)
        return
      // Movement / viewport change resets idle clock (wakes offline ghosts).
      att.lastActive = Date.now()
      ws.serializeAttachment(att)
      this.broadcastPeers()
      return
    }
  }

  async webSocketClose(ws: WebSocket, code: number, reason: string, _wasClean: boolean): Promise<void> {
    try {
      ws.close(code, reason)
    }
    catch {
      // already closed
    }
    this.broadcastPeers()
  }

  async webSocketError(ws: WebSocket, _error: unknown): Promise<void> {
    try {
      ws.close(1011, 'error')
    }
    catch {
      // ignore
    }
    this.broadcastPeers()
  }

  private isGhostOnline(att: WsAttachment, now: number): boolean {
    if (att.ghLogin === GHOST_OWNER_GH)
      return true
    // Legacy attachments (pre-lastActive) stay visible until they refresh.
    if (typeof att.lastActive !== 'number')
      return true
    return now - att.lastActive <= GHOST_IDLE_MS
  }

  private collectPeers(): PeerRow[] {
    const now = Date.now()
    /** Prefer the freshest socket when a tab briefly double-connects. */
    const byTab = new Map<string, { row: PeerRow, lastActive: number }>()
    for (const socket of this.ctx.getWebSockets()) {
      const att = socket.deserializeAttachment() as WsAttachment | null
      if (!att?.tabId || !att.anonId)
        continue
      if (!this.isGhostOnline(att, now))
        continue
      const lastActive = typeof att.lastActive === 'number' ? att.lastActive : 0
      const row: PeerRow = {
        id: att.tabId,
        anonId: att.anonId,
        ghLogin: att.ghLogin || null,
        p: att.p,
        x: att.x,
        y: att.y,
        vw: att.vw,
        vh: att.vh,
      }
      const prev = byTab.get(att.tabId)
      if (!prev || lastActive >= prev.lastActive)
        byTab.set(att.tabId, { row, lastActive })
    }
    return [...byTab.values()].map(v => v.row)
  }

  private sendPeers(ws: WebSocket): void {
    const msg = JSON.stringify({ type: 'peers', peers: this.collectPeers() })
    try {
      ws.send(msg)
    }
    catch {
      // ignore
    }
  }

  private broadcastPeers(): void {
    const msg = JSON.stringify({ type: 'peers', peers: this.collectPeers() })
    for (const socket of this.ctx.getWebSockets()) {
      try {
        socket.send(msg)
      }
      catch {
        // ignore broken sockets
      }
    }
  }
}

function quantizeUnit(v: number, steps = 100): number {
  if (!Number.isFinite(v))
    return 0
  return Math.min(1, Math.max(0, Math.round(v * steps) / steps))
}
