import type { AnnotationAnchor } from '../types/annotation'
import { useData, useRoute } from 'vitepress'
import { computed, nextTick, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAnnotationStore } from '../stores/annotation'
import { getAnnotationContentRoot } from '../utils/annotationRoot'
import { useAnnotationHighlight } from './useAnnotationHighlight'
import { useGitHubAuth } from './useGitHubAuth'
import { getReadAccessToken, useGitHubDiscussions } from './useGitHubDiscussions'

const SLASHES_RE = /^\/+|\/+$/g

/**
 * Page-scoped load/submit for annotations.
 * Load only looks up an existing Discussion (lazy create on first submit).
 * Reads work for guests via VITE_GITHUB_READ_TOKEN; writes require user OAuth.
 */
export function useAnnotationPage() {
  const route = useRoute()
  const { page } = useData()
  const { t } = useI18n({ useScope: 'global' })
  const store = useAnnotationStore()
  const { isAuthenticated, token } = useGitHubAuth()
  const { findDiscussion, findOrCreateDiscussion, getAnnotations, createAnnotation } = useGitHubDiscussions()
  const { highlightAnnotations, clearAllHighlights } = useAnnotationHighlight()

  const submitting = ref(false)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const pendingAnchor = ref<AnnotationAnchor | null>(null)

  const pagePath = computed(() => {
    let p = route.path.replace(SLASHES_RE, '')
    if (!p)
      p = 'index'
    return p
  })

  const pageTitle = computed(() => page.value.title || (typeof document !== 'undefined' ? document.title : '') || route.path)

  async function loadAnnotations() {
    const accessToken = getReadAccessToken(token.value)
    if (!accessToken) {
      store.setAnnotations([])
      return
    }

    loading.value = true
    error.value = null

    try {
      // Lazy: look up only — do not create empty Discussions on visit
      const discussion = await findDiscussion(pagePath.value, accessToken)

      if (!discussion) {
        store.setAnnotations([])
        return
      }

      const result = await getAnnotations(discussion.number, accessToken)

      await nextTick()
      const content = getAnnotationContentRoot() || document.body
      highlightAnnotations(result, content)
      store.setAnnotations(result)
    }
    catch (e: any) {
      console.error('[annotation] 加载批注失败:', e)
      error.value = e.message || 'error.load'
      store.setAnnotations([])
    }
    finally {
      loading.value = false
    }
  }

  /**
   * anchorOverride:
   *   - undefined → text annotation from pendingAnchor
   *   - null → article-level comment
   *   - anchor → reuse (e.g. reply)
   */
  async function handleSubmit(
    text: string,
    anchorOverride?: AnnotationAnchor | null,
    replyToId?: string,
    replyToSnapshot?: { commentId: string, author: string, text: string },
  ) {
    if (!token.value) {
      console.error('[annotation] 未登录，无法提交批注')
      error.value = 'error.notLoggedIn'
      return
    }

    submitting.value = true

    try {
      const anchor = anchorOverride === undefined ? pendingAnchor.value : anchorOverride
      if (anchorOverride === undefined && !pendingAnchor.value) {
        console.error('[annotation] 无可用锚点（选区已丢失）')
        error.value = 'error.noAnchor'
        return
      }

      const discussion = await findOrCreateDiscussion(
        pagePath.value,
        t('discussionTitle', { title: pageTitle.value }),
        token.value,
      )

      await createAnnotation(discussion.id, {
        version: 1,
        pagePath: pagePath.value,
        anchor: anchor ?? null,
        text,
        ...(replyToSnapshot ? { replyTo: replyToSnapshot } : {}),
        status: 'active',
        createdAt: new Date().toISOString(),
      }, token.value, replyToId)

      clearAllHighlights()
      await loadAnnotations()

      const sel = window.getSelection()
      if (sel)
        sel.removeAllRanges()
      pendingAnchor.value = null
    }
    catch (e: any) {
      console.error('[annotation] 提交批注失败:', e)
      error.value = e.message || 'error.submit'
    }
    finally {
      submitting.value = false
    }
  }

  function bindRouteAndAuthWatchers() {
    watch(() => route.path, () => {
      clearAllHighlights()
      store.setAnnotations([])
      store.setActiveCommentId(null)
      pendingAnchor.value = null
      nextTick(() => {
        loadAnnotations()
      })
    })

    // Login/logout: reload with user || read token; do not clear on logout
    // (guests should still see annotations via the read token).
    watch(isAuthenticated, () => {
      loadAnnotations()
    })
  }

  return {
    pagePath,
    pageTitle,
    submitting,
    loading,
    error,
    pendingAnchor,
    loadAnnotations,
    handleSubmit,
    bindRouteAndAuthWatchers,
    isAuthenticated,
  }
}
