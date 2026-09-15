import type { InkCursorKind } from '~/utils/inkCursor'
import { INK_CURSOR_HOTSPOT, inkCursorSvg, morphCursorPath } from '~/utils/inkCursor'

const FRAME_SELECTOR = '[data-ink-frame]'
const INTERACTIVE_SELECTOR = 'a[href], button, input, textarea, select, summary, [role="button"], [role="link"], [contenteditable="true"]'
const FRAME_ACTIVE = 'data-ink-frame-active'
const FRAME_X = '--ink-frame-x'
const FRAME_Y = '--ink-frame-y'

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
    const wobble = document.createElement('div')
    wobble.className = 'ink-cursor__wobble'
    const arrow = inkCursorSvg()
    const arrowPath = arrow.querySelector('path')!
    wobble.append(arrow)
    root.append(wobble)
    document.body.append(root)

    let x = window.innerWidth / 2
    let y = window.innerHeight / 2
    let shownX = x
    let shownY = y
    let inside = false
    let down = false
    let kind: InkCursorKind = 'arrow'
    let morph = 0
    let press = 1
    let still = reducedMotion.matches
    let frame: FrameState | null = null
    let raf = 0

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
      const ease = down ? 0.42 : 0.26
      shownX += (x - shownX) * ease
      shownY += (y - shownY) * ease
      const [hx, hy] = INK_CURSOR_HOTSPOT
      root.style.transform = `translate3d(${(shownX - hx).toFixed(2)}px, ${(shownY - hy).toFixed(2)}px, 0)`
      root.dataset.state = inside ? (down ? 'down' : 'on') : 'off'

      const target = kind === 'circle' ? 1 : 0
      const dm = target - morph
      const now = performance.now() / 1000
      if (still) {
        if (dm !== 0) {
          morph = target
          arrowPath.setAttribute('d', morphCursorPath(morph))
        }
        wobble.style.transform = ''
      }
      else {
        morph += dm * 0.22
        if (Math.abs(dm) > 0.0005 || morph > 0.001)
          arrowPath.setAttribute('d', morphCursorPath(morph, Math.sin(now * 1.6) * morph))
        press += ((down ? 0.9 : 1) - press) * 0.2
        const rot = Math.sin(now * 0.7) * 1.8
        const sc = 1 + 0.03 * Math.sin(now * 1.1 + 0.8)
        wobble.style.transform = `rotate(${rot.toFixed(2)}deg) scale(${(sc * press).toFixed(3)})`
      }

      updateFrame()
      if (inside)
        raf = requestAnimationFrame(render)
    }

    function schedule() {
      if (!raf)
        raf = requestAnimationFrame(render)
    }

    function pickTarget(target: EventTarget | null) {
      if (!(target instanceof Element))
        return { frameEl: null, interactive: false }
      const frameEl = target.closest<HTMLElement>(FRAME_SELECTOR)
      const interactive = !!target.closest(INTERACTIVE_SELECTOR)
      return { frameEl, interactive }
    }

    function pickKind(frameEl: HTMLElement | null, interactive: boolean): InkCursorKind {
      if (frameEl)
        return 'circle'
      return interactive ? 'point' : 'arrow'
    }

    function onPointerMove(event: PointerEvent) {
      if (event.pointerType !== 'mouse')
        return
      x = event.clientX
      y = event.clientY
      inside = true
      const { frameEl, interactive } = pickTarget(event.target)
      setFrame(frameEl)
      setKind(pickKind(frameEl, interactive))
      schedule()
    }

    function onPointerOver(event: PointerEvent) {
      if (event.pointerType !== 'mouse')
        return
      const { frameEl, interactive } = pickTarget(event.target)
      setFrame(frameEl)
      setKind(pickKind(frameEl, interactive))
      schedule()
    }

    function onPointerDown(event: PointerEvent) {
      if (event.pointerType !== 'mouse')
        return
      down = true
      schedule()
    }

    function onPointerUp(event: PointerEvent) {
      if (event.pointerType !== 'mouse')
        return
      down = false
      schedule()
    }

    function onLeave() {
      inside = false
      down = false
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
      document.documentElement.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('blur', onBlur)
      reducedMotion.removeEventListener('change', onMotionChange)
      if (raf)
        cancelAnimationFrame(raf)
      clearFrame()
      root.remove()
      document.documentElement.classList.remove('ink-cursor-on', 'ink-cursor-still')
    })
  })
})
