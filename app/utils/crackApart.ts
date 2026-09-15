import { inkRng } from '~/utils/inkDraw'

const SVG_NS = 'http://www.w3.org/2000/svg'

function reducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Hand-torn exit for the peek card: draw a jagged crack, then split the card
 * into two clipped halves that drift apart and fall. Works on a DOM clone so
 * the original element can be removed by the caller once `done` fires.
 */
export function crackApart(el: HTMLElement, done: () => void) {
  if (reducedMotion()) {
    done()
    return
  }

  const rect = el.getBoundingClientRect()
  const w = rect.width
  const h = rect.height
  if (w < 4 || h < 4) {
    done()
    return
  }

  const rng = inkRng(`crack:${Date.now()}:${Math.random()}`)

  const step = 7 + rng() * 3
  const segments = Math.max(16, Math.round(h / step))
  let x = w * (0.38 + rng() * 0.24)
  const pts: [number, number][] = [[x, -2]]
  for (let i = 1; i < segments; i++) {
    x += (rng() - 0.5) * 5.5
    x = Math.min(w * 0.86, Math.max(w * 0.14, x))
    pts.push([x, (h * i) / segments + (rng() - 0.5) * 1.6])
  }
  pts.push([x + (rng() - 0.5) * 4, h + 2])

  const px = (p: [number, number]) => `${p[0].toFixed(1)}px ${p[1].toFixed(1)}px`
  const leftClip = `polygon(0px 0px, ${pts.map(px).join(', ')}, 0px ${h.toFixed(1)}px)`
  const rightClip = `polygon(${w.toFixed(1)}px 0px, ${pts.map(px).join(', ')}, ${w.toFixed(1)}px ${h.toFixed(1)}px)`

  const overlay = document.createElement('div')
  const host = el.parentElement ?? document.body
  const hostRect = host.getBoundingClientRect()
  overlay.style.cssText = `position:absolute;left:${rect.left - hostRect.left}px;top:${rect.top - hostRect.top}px;width:${w}px;height:${h}px;z-index:0;pointer-events:none;overflow:visible;`

  const svg = document.createElementNS(SVG_NS, 'svg')
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`)
  svg.setAttribute('width', `${w}`)
  svg.setAttribute('height', `${h}`)
  svg.style.cssText = 'position:absolute;inset:0;overflow:hidden;'

  const stroke = 'var(--line)'

  const drawStroke = (d: string, delay: number, width: number) => {
    const path = document.createElementNS(SVG_NS, 'path')
    path.setAttribute('d', d)
    path.setAttribute('pathLength', '1')
    path.setAttribute('fill', 'none')
    path.setAttribute('stroke', stroke)
    path.setAttribute('stroke-width', String(width))
    path.setAttribute('stroke-linecap', 'butt')
    path.setAttribute('stroke-linejoin', 'miter')
    path.style.strokeDasharray = '1'
    path.style.strokeDashoffset = '1'
    path.animate(
      [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }],
      { duration: 190, delay, easing: 'cubic-bezier(0, 0, 0.2, 1)', fill: 'forwards' },
    )
    svg.appendChild(path)
  }

  const inkPts = pts.map((p, i, all): [number, number] => {
    if (i === 0)
      return [p[0], 0]
    if (i === all.length - 1)
      return [p[0], h]
    const y = Math.min(h, Math.max(0, p[1]))
    return [p[0], y]
  })
  const crackD = `M${inkPts.map(p => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' L')}`
  const crackMs = 210
  drawStroke(crackD, 0, 1)

  function tearEdge() {
    const edge = document.createElementNS(SVG_NS, 'svg')
    edge.setAttribute('viewBox', `0 0 ${w} ${h}`)
    edge.setAttribute('width', `${w}`)
    edge.setAttribute('height', `${h}`)
    edge.style.cssText = 'position:absolute;inset:0;overflow:visible;pointer-events:none;'
    const path = document.createElementNS(SVG_NS, 'path')
    path.setAttribute('d', crackD)
    path.setAttribute('fill', 'none')
    path.setAttribute('stroke', stroke)
    path.setAttribute('stroke-width', '1')
    path.setAttribute('stroke-linecap', 'butt')
    path.setAttribute('stroke-linejoin', 'miter')
    path.setAttribute('vector-effect', 'non-scaling-stroke')
    path.style.opacity = '0'
    path.animate(
      [{ opacity: 0 }, { opacity: 1 }],
      { duration: 80, delay: crackMs, easing: 'linear', fill: 'forwards' },
    )
    edge.appendChild(path)
    return edge
  }

  for (const side of [-1, 1] as const) {
    const wrap = document.createElement('div')
    wrap.dataset.side = side === -1 ? 'left' : 'right'
    wrap.style.cssText = 'position:absolute;inset:0;overflow:visible;'
    const clone = el.cloneNode(true) as HTMLElement
    clone.removeAttribute('id')
    clone.querySelectorAll('[id]').forEach(n => n.removeAttribute('id'))
    clone.style.margin = '0'
    clone.style.transform = 'none'
    clone.style.position = 'absolute'
    clone.style.inset = '0'
    clone.style.clipPath = side === -1 ? leftClip : rightClip
    wrap.appendChild(clone)
    wrap.appendChild(tearEdge())
    overlay.appendChild(wrap)
  }

  overlay.appendChild(svg)

  el.style.visibility = 'hidden'
  host.appendChild(overlay)

  svg.animate(
    [{ opacity: 1 }, { opacity: 0 }],
    { duration: 140, delay: crackMs + 30, fill: 'forwards' },
  )

  for (const node of Array.from(overlay.querySelectorAll<HTMLElement>(':scope > div'))) {
    const side = node.dataset.side === 'left' ? -1 : 1
    // Fall direction is deliberately decoupled from which half this is:
    // either piece can tip left or right, and one may drop faster.
    const dir = rng() < 0.5 ? -1 : 1
    const drift = side * (4 + rng() * 7) + dir * (6 + rng() * 16)
    const fall = h * (0.45 + rng() * 0.55)
    const rot = (rng() - 0.5) * 16
    node.animate(
      [
        { transform: 'translate(0px, 0px) rotate(0deg)', opacity: 1, offset: 0 },
        { transform: `translate(${(drift * 0.4).toFixed(1)}px, 4px) rotate(${(rot * 0.3).toFixed(2)}deg)`, opacity: 1, offset: 0.18 },
        { transform: `translate(${drift.toFixed(1)}px, ${fall.toFixed(1)}px) rotate(${rot.toFixed(2)}deg)`, opacity: 0, offset: 1 },
      ],
      {
        duration: 480 + rng() * 220,
        delay: crackMs + rng() * 90,
        easing: 'cubic-bezier(0.45, 0, 0.9, 0.45)',
        fill: 'forwards',
      },
    )
  }

  window.setTimeout(() => {
    overlay.remove()
    done()
  }, crackMs + 780)
}
