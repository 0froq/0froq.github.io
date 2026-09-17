import type { InkCursorKind } from '~/utils/inkCursor'
import { closedInkPath, closedLoopContains, closedLoopDist, INK_CURSOR_HOTSPOT, INK_CURSOR_TEXT_HOTSPOT, inkCursorSvg, inkSelSvg, morphCursorPts, rangeTextRects, selectionLoopFromRects } from '~/utils/inkCursor'
import { hostOf, isTextCursor, SELECTABLE, SELECTABLE_SKIP } from '~/utils/selectable'

const FRAME_SELECTOR = '[data-ink-frame]'
const FRAME_ACTIVE = 'data-ink-frame-active'
const FRAME_X = '--ink-frame-x'
const FRAME_Y = '--ink-frame-y'
const POINT_CURSORS = new Set(['pointer', 'grab', 'grabbing'])
const LEAVE_START = 16
const LEAVE_BACK = 4
const LEAVE = 48
const CURSOR_SPACE = /\s+/

interface FrameState {
  el: HTMLElement
  rect: DOMRect
  release: number
  ramp: number
  max: number
  x: number
  y: number
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function cursorKeyword(value: string): string {
  return value.split(',')[0]?.trim().split(CURSOR_SPACE)[0] || 'auto'
}

function copyLoop(src: [number, number][]) {
  return src.map(p => [p[0], p[1]] as [number, number])
}

function rigidShift(from: [number, number][], to: [number, number][]) {
  if (from.length !== to.length || !from.length)
    return false
  const dx = to[0]![0] - from[0]![0]
  const dy = to[0]![1] - from[0]![1]
  for (let i = 1; i < from.length; i++) {
    if (Math.abs(to[i]![0] - from[i]![0] - dx) > 2 || Math.abs(to[i]![1] - from[i]![1] - dy) > 2)
      return false
  }
  return true
}

function selectionTargetPts() {
  const sel = window.getSelection()
  if (!sel || sel.isCollapsed || sel.rangeCount === 0)
    return null
  const host = hostOf(sel.anchorNode)
  if (!host?.closest(SELECTABLE) || host.closest(SELECTABLE_SKIP))
    return null
  return selectionLoopFromRects(rangeTextRects(sel.getRangeAt(0)))
}

function frameOptions(el: HTMLElement) {
  const release = Number(el.getAttribute('data-ink-frame-release'))
  const ramp = Number(el.getAttribute('data-ink-frame-ramp'))
  const max = Number(el.getAttribute('data-ink-frame-max'))
  return {
    release: Number.isFinite(release) && release > 0 ? release : 28,
    ramp: Number.isFinite(ramp) && ramp > 0 ? ramp : 48,
    max: Number.isFinite(max) && max > 0 ? max : 6,
  }
}

export default defineNuxtPlugin((nuxtApp) => {
  if (!import.meta.client)
    return

  nuxtApp.hook('app:mounted', () => {
    const finePointer = window.matchMedia('(pointer: fine)')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!finePointer.matches)
      return

    document.documentElement.classList.add('ink-cursor-on')

    const root = document.createElement('div')
    root.className = 'ink-cursor'
    root.setAttribute('aria-hidden', 'true')
    const selRoot = document.createElement('div')
    selRoot.className = 'ink-cursor ink-cursor--sel'
    selRoot.setAttribute('aria-hidden', 'true')
    const wobble = document.createElement('div')
    wobble.className = 'ink-cursor__wobble'
    const arrow = inkCursorSvg()
    const selSvg = inkSelSvg()
    const arrowPath = arrow.querySelector('.ink-cursor__shape')!
    const selPath = selSvg.querySelector('.ink-cursor__frame')!
    const glowPath = selSvg.querySelector('.ink-cursor__glow')!
    const glowGrad = selSvg.querySelector('#ink-sel-bright-g')!
    const glowMask = selSvg.querySelector('.ink-cursor__bright-mask')!
    const ticks = arrow.querySelector('.ink-cursor__ticks') as SVGGElement
    wobble.append(arrow)
    root.append(wobble)
    selRoot.append(selSvg)
    document.body.append(selRoot, root)

    let x = window.innerWidth / 2
    let y = window.innerHeight / 2
    let shownX = x
    let shownY = y
    let inside = false
    let down = false
    let dragSelect = false
    let kind: InkCursorKind = 'arrow'
    let morph = 0
    let morphBar = 0
    let morphSel = 0
    let press = 1
    let still = reducedMotion.matches
    let frame: FrameState | null = null
    let raf = 0
    let cursorEl: Element | null = null
    let cursorDown = false
    let cursorCss = 'auto'
    let selPts: [number, number][] | null = null
    let left = false
    let away = 0
    let wasDetached = false

    function intendedCursor(el: Element): string {
      if (cursorEl === el && cursorDown === down)
        return cursorCss
      const html = document.documentElement
      // Peek past `html.ink-cursor-on * { cursor: none !important }` in the same
      // frame so the OS cursor never paints.
      html.classList.remove('ink-cursor-on')
      cursorCss = cursorKeyword(getComputedStyle(el).cursor)
      html.classList.add('ink-cursor-on')
      cursorEl = el
      cursorDown = down
      return cursorCss
    }

    function pick(target: EventTarget | null): { frameEl: HTMLElement | null, kind: InkCursorKind } {
      if (dragSelect)
        return { frameEl: frame?.el ?? null, kind }
      if (!(target instanceof Element))
        return { frameEl: null, kind: 'arrow' }
      const frameEl = target.closest<HTMLElement>(FRAME_SELECTOR)
      if (frameEl)
        return { frameEl, kind: 'circle' }
      const css = intendedCursor(target)
      if (POINT_CURSORS.has(css))
        return { frameEl: null, kind: 'point' }
      if (isTextCursor(target))
        return { frameEl: null, kind: 'text' }
      return { frameEl: null, kind: 'arrow' }
    }

    function setKind(next: InkCursorKind) {
      if (kind === next)
        return
      kind = next
      root.dataset.kind = kind
    }

    function clearFrame() {
      if (!frame)
        return
      frame.el.removeAttribute(FRAME_ACTIVE)
      frame.el.style.removeProperty(FRAME_X)
      frame.el.style.removeProperty(FRAME_Y)
      frame = null
    }

    function setFrame(el: HTMLElement | null) {
      if (!el) {
        clearFrame()
        return
      }
      if (frame?.el === el) {
        frame.rect = el.getBoundingClientRect()
        return
      }
      clearFrame()
      const opts = frameOptions(el)
      frame = {
        el,
        rect: el.getBoundingClientRect(),
        release: opts.release,
        ramp: opts.ramp,
        max: opts.max,
        x: 0,
        y: 0,
      }
      el.setAttribute(FRAME_ACTIVE, '')
    }

    function updateFrame() {
      if (!frame)
        return
      frame.rect = frame.el.getBoundingClientRect()
      const rect = frame.rect
      const inX = x >= rect.left - frame.release && x <= rect.right + frame.release
      const inY = y >= rect.top - frame.release && y <= rect.bottom + frame.release
      if (!inX || !inY) {
        clearFrame()
        return
      }
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const tx = clamp((x - cx) / frame.ramp, -1, 1) * frame.max
      const ty = clamp((y - cy) / frame.ramp, -1, 1) * frame.max
      frame.x += (tx - frame.x) * 0.22
      frame.y += (ty - frame.y) * 0.22
      frame.el.style.setProperty(FRAME_X, `${frame.x.toFixed(2)}px`)
      frame.el.style.setProperty(FRAME_Y, `${frame.y.toFixed(2)}px`)
    }

    function render() {
      raf = 0
      if (dragSelect) {
        shownX = x
        shownY = y
      }
      else {
        const ease = down ? 0.62 : 0.42
        shownX += (x - shownX) * ease
        shownY += (y - shownY) * ease
      }
      const [hx0, hy0] = INK_CURSOR_HOTSPOT
      const [hx1, hy1] = INK_CURSOR_TEXT_HOTSPOT
      const hx = hx0 + (hx1 - hx0) * morphBar
      const hy = hy0 + (hy1 - hy0) * morphBar
      root.dataset.state = inside ? (down ? 'down' : 'on') : 'off'
      selRoot.dataset.state = root.dataset.state

      const liveSel = selectionTargetPts()
      if (liveSel) {
        if (!selPts || still || rigidShift(selPts, liveSel)) {
          selPts = copyLoop(liveSel)
        }
        else {
          const follow = dragSelect ? 0.38 : 0.28
          selPts = selPts.map((p, i) => {
            const q = liveSel[i]!
            return [p[0] + (q[0] - p[0]) * follow, p[1] + (q[1] - p[1]) * follow]
          })
        }
      }
      else if (!dragSelect) {
        selPts = null
        left = false
        away = 0
      }

      if (dragSelect && selPts) {
        const dOut = closedLoopContains(selPts, x, y) ? 0 : closedLoopDist(selPts, x, y)
        if (left)
          left = dOut > LEAVE_BACK
        else
          left = dOut > LEAVE_START
        const awayTarget = left
          ? Math.min(1, Math.max(0, (dOut - LEAVE_START) / (LEAVE - LEAVE_START)))
          : 0
        away = still ? awayTarget : away + (awayTarget - away) * 0.22
      }
      else {
        left = false
        away = 0
      }

      const detached = left || away > 0.02
      const selTarget = dragSelect && selPts && !detached ? 1 : 0
      const circleTarget = kind === 'circle' || detached ? 1 : 0
      const barTarget = detached ? 0 : kind === 'text' ? 1 : 0
      const dm = circleTarget - morph
      const db = barTarget - morphBar
      const ds = selTarget - morphSel
      const now = performance.now() / 1000
      const vw = window.innerWidth
      const vh = window.innerHeight
      const view = `0 0 ${vw} ${vh}`
      arrow.setAttribute('viewBox', view)
      selSvg.setAttribute('viewBox', view)
      glowGrad.setAttribute('cx', x.toFixed(1))
      glowGrad.setAttribute('cy', y.toFixed(1))
      glowGrad.setAttribute('r', '32')
      glowMask.setAttribute('x', '0')
      glowMask.setAttribute('y', '0')
      glowMask.setAttribute('width', String(vw))
      glowMask.setAttribute('height', String(vh))

      if (detached) {
        morph = 1
        morphBar = 0
        morphSel = 0
        press = down ? 0.9 : 1
      }
      else if (wasDetached && dragSelect && selPts) {
        morphSel = 1
        morphBar = kind === 'text' ? 1 : 0
        morph = kind === 'circle' ? 1 : 0
        press = down ? 0.9 : 1
      }
      else if (still) {
        morph = circleTarget
        morphBar = barTarget
        morphSel = selTarget
        press = 1
      }
      else {
        morph += dm * 0.28
        morphBar += db * 0.28
        morphSel += ds * 0.22
        press += ((down ? 0.9 : 1) - press) * 0.32
      }
      wasDetached = detached

      const breathe = still ? 0 : Math.sin(now * 1.6) * morph
      const local = morphCursorPts(morph, breathe, morphBar)
      const rot = still ? 0 : Math.sin(now * 0.7) * 1.8 * (1 - morphBar) * (1 - morphSel)
      const sc = still ? 1 : (1 + 0.03 * Math.sin(now * 1.1 + 0.8)) * press
      const rad = rot * Math.PI / 180
      const cos = Math.cos(rad)
      const sin = Math.sin(rad)
      const screen = local.map(([vx, vy]) => {
        const dx = (vx - hx) * sc
        const dy = (vy - hy) * sc
        return [shownX + dx * cos - dy * sin, shownY + dx * sin + dy * cos] as [number, number]
      })
      let pts = screen
      if (selTarget && morphSel > 0.001 && selPts) {
        pts = screen.map((p, i) => {
          const q = selPts[i]!
          return [p[0] + (q[0] - p[0]) * morphSel, p[1] + (q[1] - p[1]) * morphSel] as [number, number]
        })
      }
      arrowPath.setAttribute('d', closedInkPath(pts))
      if (selPts) {
        selPath.setAttribute('d', closedInkPath(selPts))
        glowPath.setAttribute('d', closedInkPath(selPts))
      }
      ticks.setAttribute('transform', `translate(${(shownX - hx).toFixed(2)} ${(shownY - hy).toFixed(2)})`)
      const frameOp = !selPts ? 0 : (!dragSelect || detached) ? 1 : 1 - morphSel
      root.style.setProperty('--ink-dot', detached ? String(away) : '1')
      selRoot.style.setProperty('--ink-frame', String(frameOp))
      root.toggleAttribute('data-selecting', morphSel > 0.08 && !detached)
      selRoot.toggleAttribute('data-selecting', morphSel > 0.08 && !detached)
      selRoot.toggleAttribute('data-sel', !!selPts)
      wobble.style.transform = ''

      updateFrame()
      if (inside || morphSel > 0.001 || selPts)
        raf = requestAnimationFrame(render)
    }

    function applyTarget(target: EventTarget | null) {
      const { frameEl, kind: next } = pick(target)
      setFrame(frameEl)
      setKind(next)
    }

    function schedule() {
      if (!raf)
        raf = requestAnimationFrame(render)
    }

    function onPointerMove(event: PointerEvent) {
      if (event.pointerType !== 'mouse')
        return
      x = event.clientX
      y = event.clientY
      inside = true
      applyTarget(event.target)
      schedule()
    }

    function onPointerOver(event: PointerEvent) {
      if (event.pointerType !== 'mouse')
        return
      x = event.clientX
      y = event.clientY
      applyTarget(event.target)
      schedule()
    }

    function onPointerDown(event: PointerEvent) {
      if (event.pointerType !== 'mouse')
        return
      down = true
      const sel = window.getSelection()
      dragSelect = event.target instanceof Element
        && isTextCursor(event.target)
        && (!sel || sel.isCollapsed)
      applyTarget(event.target)
      schedule()
    }

    function onPointerUp(event: PointerEvent) {
      if (event.pointerType !== 'mouse')
        return
      down = false
      dragSelect = false
      morphSel = 0
      left = false
      away = 0
      wasDetached = false
      applyTarget(event.target)
      schedule()
    }

    function onSelectionChange() {
      schedule()
    }

    function onLeave() {
      inside = false
      down = false
      dragSelect = false
      morphSel = 0
      left = false
      away = 0
      wasDetached = false
      clearFrame()
      schedule()
    }

    function onBlur() {
      onLeave()
    }

    function onMotionChange() {
      still = reducedMotion.matches
      document.documentElement.classList.toggle('ink-cursor-still', still)
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerover', onPointerOver, { passive: true })
    window.addEventListener('pointerdown', onPointerDown, { passive: true })
    window.addEventListener('pointerup', onPointerUp, { passive: true })
    document.addEventListener('selectionchange', onSelectionChange)
    window.addEventListener('scroll', schedule, { capture: true, passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    window.addEventListener('blur', onBlur)
    reducedMotion.addEventListener('change', onMotionChange)
    onMotionChange()
    schedule()

    nuxtApp.hook('app:beforeUnmount', () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerover', onPointerOver)
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointerup', onPointerUp)
      document.removeEventListener('selectionchange', onSelectionChange)
      window.removeEventListener('scroll', schedule, true)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('blur', onBlur)
      reducedMotion.removeEventListener('change', onMotionChange)
      if (raf)
        cancelAnimationFrame(raf)
      clearFrame()
      selRoot.remove()
      root.remove()
      document.documentElement.classList.remove('ink-cursor-on', 'ink-cursor-still')
    })
  })
})
