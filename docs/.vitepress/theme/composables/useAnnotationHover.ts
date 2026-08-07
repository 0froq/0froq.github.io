import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useAnnotationStore } from '../stores/annotation'
import { useAnnotationHighlight } from './useAnnotationHighlight'

/**
 * Highlight hit-test hover / click on content.
 */
export function useAnnotationHover(options: {
  prepareFromRange: (range: Range) => void
}) {
  const store = useAnnotationStore()
  const { hitTestHighlight, setHoverHighlight, clearAllHighlights } = useAnnotationHighlight()

  const hoveredCommentId = ref<string | null>(null)
  const hoverPosition = ref<{ x: number, y: number } | null>(null)
  const isNarrowScreen = ref(false)

  function updateScreenWidth() {
    isNarrowScreen.value = window.innerWidth < 900
  }

  const hoveredAnnotations = computed(() => {
    if (!hoveredCommentId.value)
      return []
    const hit = store.annotations.find(a => a.commentId === hoveredCommentId.value)
    if (!hit)
      return []
    const selected = hit.data.anchor?.selected
    if (!selected)
      return [hit]
    return store.annotations.filter(a => a.data.anchor?.selected === selected)
  })

  function handleMouseMove(e: MouseEvent) {
    if (!store.annotations.length)
      return
    const target = e.target as HTMLElement
    if (target.closest('.annotation-rail'))
      return
    const hit = hitTestHighlight(e.clientX, e.clientY)
    hoveredCommentId.value = hit
    hoverPosition.value = hit && isNarrowScreen.value ? { x: e.clientX, y: e.clientY } : null
    if (!isNarrowScreen.value) {
      setHoverHighlight(hit)
      store.setActiveCommentId(hit)
    }
    if (!hit && isNarrowScreen.value)
      setHoverHighlight(null)
  }

  function handleContentClick(e: MouseEvent) {
    if (!store.annotations.length)
      return
    const hit = hitTestHighlight(e.clientX, e.clientY)
    if (!hit)
      return
    const ann = store.annotations.find(a => a.commentId === hit)
    if (!ann?.domRange)
      return
    options.prepareFromRange(ann.domRange.cloneRange())
  }

  function bindHoverLifecycle() {
    onMounted(() => {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('click', handleContentClick)
      window.addEventListener('resize', updateScreenWidth)
      updateScreenWidth()
    })

    onBeforeUnmount(() => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('click', handleContentClick)
      window.removeEventListener('resize', updateScreenWidth)
      clearAllHighlights()
    })
  }

  return {
    hoveredCommentId,
    hoverPosition,
    isNarrowScreen,
    hoveredAnnotations,
    bindHoverLifecycle,
  }
}
