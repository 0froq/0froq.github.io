/**
 * 将纸边 SVG 的 viewBox / rect 同步为宿主 CSS 像素尺寸，
 * 避免 preserveAspectRatio="none" 非等比拉伸导致左右描边变粗。
 */
export function syncPaperEdgeSvgSize(
  svg: SVGSVGElement,
  host: HTMLElement,
  rect?: SVGRectElement | null,
) {
  const w = Math.max(1, Math.round(host.offsetWidth))
  const h = Math.max(1, Math.round(host.offsetHeight))
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`)
  svg.setAttribute('width', String(w))
  svg.setAttribute('height', String(h))
  const target = rect ?? svg.querySelector('rect.paper-edge-fill')
  if (target) {
    target.setAttribute('width', String(w))
    target.setAttribute('height', String(h))
  }
}

export function observePaperEdgeSvgSize(
  svg: SVGSVGElement,
  host: HTMLElement,
  rect?: SVGRectElement | null,
): () => void {
  const sync = () => syncPaperEdgeSvgSize(svg, host, rect)
  sync()
  const ro = new ResizeObserver(sync)
  ro.observe(host)
  return () => ro.disconnect()
}
