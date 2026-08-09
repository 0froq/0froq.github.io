import { useRoute } from 'vitepress'
import { nextTick, onBeforeUnmount, onMounted, watch } from 'vue'
import { paperEdgeFromId } from '~/composables/usePaperEdge'
import { observePaperEdgeSvgSize } from '~/composables/syncPaperEdgeSvgSize'

/**
 * 给 `.custom-block` 注入纸边 SVG（仅一层背景，不包内容）。
 * viewBox 与宿主像素同步，避免左右描边被拉粗。
 *
 * 文章页用 `#content`，索引/层页用 `.markdown-rendered`（如 /corpus/）。
 */
export function usePaperCustomBlocks(selector = '#content, .markdown-rendered') {
  const route = useRoute()
  const stoppers: Array<() => void> = []

  function enhance() {
    let i = 0
    document.querySelectorAll(selector).forEach((root) => {
      const scope = root.children.length === 1 ? root.children[0]! : root

      scope.querySelectorAll<HTMLElement>('.custom-block').forEach((el) => {
        if (el.dataset.paperEdged === '1')
          return

        const key = el.textContent?.slice(0, 80) || `block-${i}`
        const edge = paperEdgeFromId(`custom-block:${route.path}:${i}:${key}`)
        i += 1

        el.dataset.paperEdged = '1'
        el.style.setProperty('--card-tilt', edge.tilt)

        const svgNS = 'http://www.w3.org/2000/svg'
        const svg = document.createElementNS(svgNS, 'svg')
        svg.setAttribute('class', 'paper-edge-svg')
        svg.setAttribute('viewBox', '0 0 280 160')
        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet')
        svg.setAttribute('aria-hidden', 'true')

        const defs = document.createElementNS(svgNS, 'defs')
        const filter = document.createElementNS(svgNS, 'filter')
        filter.setAttribute('id', edge.filterId)
        filter.setAttribute('x', '-10%')
        filter.setAttribute('y', '-10%')
        filter.setAttribute('width', '120%')
        filter.setAttribute('height', '120%')
        filter.setAttribute('color-interpolation-filters', 'sRGB')

        const turb = document.createElementNS(svgNS, 'feTurbulence')
        turb.setAttribute('type', 'fractalNoise')
        turb.setAttribute('baseFrequency', String(edge.frequency))
        turb.setAttribute('numOctaves', String(edge.octaves))
        turb.setAttribute('seed', String(edge.seed))
        turb.setAttribute('result', 'noise')

        const disp = document.createElementNS(svgNS, 'feDisplacementMap')
        disp.setAttribute('in', 'SourceGraphic')
        disp.setAttribute('in2', 'noise')
        disp.setAttribute('scale', String(edge.scale))
        disp.setAttribute('xChannelSelector', 'R')
        disp.setAttribute('yChannelSelector', 'G')

        filter.append(turb, disp)
        defs.append(filter)

        const rect = document.createElementNS(svgNS, 'rect')
        rect.setAttribute('class', 'paper-edge-fill')
        rect.setAttribute('x', '0')
        rect.setAttribute('y', '0')
        rect.setAttribute('width', '280')
        rect.setAttribute('height', '160')
        rect.setAttribute('rx', '2')
        rect.setAttribute('ry', '2')
        rect.setAttribute('stroke-width', '1')
        rect.setAttribute('vector-effect', 'non-scaling-stroke')
        rect.setAttribute('filter', `url(#${edge.filterId})`)

        svg.append(defs, rect)
        el.prepend(svg)

        stoppers.push(observePaperEdgeSvgSize(svg, el, rect))
      })
    })
  }

  function reset() {
    while (stoppers.length)
      stoppers.pop()?.()
    document.querySelectorAll<HTMLElement>('.custom-block[data-paper-edged="1"]').forEach((el) => {
      el.querySelector(':scope > svg.paper-edge-svg')?.remove()
      delete el.dataset.paperEdged
      el.style.removeProperty('--card-tilt')
    })
  }

  onMounted(() => nextTick(() => requestAnimationFrame(enhance)))
  watch(() => route.path, async () => {
    reset()
    // Layout 常驻；PageContent 因 :key="route.path" 重挂，多等一拍再注入
    await nextTick()
    await nextTick()
    requestAnimationFrame(enhance)
  })
  onBeforeUnmount(reset)
}
