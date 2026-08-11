import type { Env } from './types'
import { DurableObject } from 'cloudflare:workers'

/** Drop HTTP sessions that have not heartbeated within this window. */
const STALE_MS = 45_000
/** Alarm cadence for pruning idle sessions. */
const ALARM_MS = 60_000

interface WsAttachment {
  /** Per-tab socket id (same browser can have multiple tabs). */
  tabId: string
  /** Stable browser persona seed. */
  anonId: string
  /** Reading progress 0–1, quantized. */
  p: number
  /** Viewport-normalized pointer 0–1, or -1 if unknown. */
  x: number
  y: number
  /** CSS viewport size in px (for pointer compatibility). */
  vw: number
  vh: number
}

interface PeerRow {
  id: string
  anonId: string
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
    if (this.count() > 0)
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
    if (!anonId || anonId.length > 128) {
      return new Response('anonId required', { status: 400 })
    }
    if (!tabId || tabId.length > 128) {
      return new Response('tabId required', { status: 400 })
    }

    const pair = new WebSocketPair()
    const [client, server] = Object.values(pair)

    this.ctx.acceptWebSocket(server)
    const attachment: WsAttachment = { tabId, anonId, p: 0, x: -1, y: -1, vw: 0, vh: 0 }
    server.serializeAttachment(attachment)

    // Snapshot to the newcomer; broadcast so others see them.
    this.sendPeers(server)
    this.broadcastPeers()

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
          socket.send(JSON.stringify({ type: 'peek', fromAnonId: att.anonId }))
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

  private collectPeers(): PeerRow[] {
    const peers: PeerRow[] = []
    for (const socket of this.ctx.getWebSockets()) {
      const att = socket.deserializeAttachment() as WsAttachment | null
      if (!att?.tabId || !att.anonId)
        continue
      peers.push({
        id: att.tabId,
        anonId: att.anonId,
        p: att.p,
        x: att.x,
        y: att.y,
        vw: att.vw,
        vh: att.vh,
      })
    }
    return peers
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

