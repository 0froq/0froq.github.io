import type { Composer } from 'vue-i18n'

export type AnnotationAuthError
  = | { code: 'network' }
    | { code: 'httpError', status: number }
    | { code: 'verifyFailed', detail: string }
    | { code: 'timeout' }

export const annotationMessages = {
  en: {
    time: {
      today: 'Today',
      daysAgo: '{count} day ago | {count} days ago',
      thisYear: '{month}/{day}',
      full: '{month}/{day}/{year}',
    },
    status: {
      approximate: 'Source text may have changed',
      ambiguous: 'Position uncertain',
      stale: 'Source text changed',
    },
    expand: {
      more: 'More',
      collapse: 'Less',
    },
    submit: 'Annotate',
    submitting: 'Submitting…',
    comment: 'Comment',
    loading: 'Loading annotations…',
    discussionTitle: 'Annotations: {title}',
    list: {
      title: 'Annotations ({count})',
      articleCommentPlaceholder: 'Comment on this article… (⏎ submit, Shift+⏎ newline)',
    },
    popover: {
      placeholder: 'Write an annotation…',
      hint: '⏎ submit · Esc cancel',
      loginPrompt: 'Sign in to annotate',
      loginButton: 'Sign in with GitHub',
      connecting: 'Connecting to GitHub…',
      deviceFlowHint: 'Open the link and enter the verification code:',
      retry: 'Retry',
    },
    selection: {
      copy: 'Copy',
      copied: 'Copied',
      comment: 'Comment',
    },
    reply: {
      replyTo: 'Reply to',
      placeholderGeneric: 'Reply… (⏎ send, Esc close)',
      placeholderToUser: 'Reply to {user}… (⏎ send, Esc close)',
    },
    reaction: {
      THUMBS_UP: 'Thumbs up',
      THUMBS_DOWN: 'Thumbs down',
      LAUGH: 'Laugh',
      HOORAY: 'Hooray',
      CONFUSED: 'Confused',
      HEART: 'Heart',
      ROCKET: 'Rocket',
      EYES: 'Eyes',
    },
    rail: {
      prefix: 'Rail',
      checked: 'Show',
      unchecked: 'Hide',
      unanchored: 'Unanchored ({count})',
    },
    auth: {
      network: 'Cannot reach GitHub. Check your network.',
      httpError: 'GitHub returned an error ({status}). Check Client ID configuration.',
      httpError405: 'Auth proxy missing (405). Set VITE_GITHUB_AUTH_PROXY to a Cloudflare Worker URL.',
      verifyFailed: 'Verification failed: {detail}',
      timeout: 'Verification timed out. Please sign in again.',
    },
    error: {
      empty: 'Please enter content',
      load: 'Failed to load annotations',
      submit: 'Failed to submit annotation',
      comment: 'Failed to comment',
      reply: 'Failed to reply',
      notLoggedIn: 'Not signed in. Please sign in with GitHub first.',
      noAnchor: 'Please select text again before annotating',
      submitterNotReady: 'Annotation submitter is not ready',
    },
  },
  zh: {
    time: {
      today: '今天',
      daysAgo: '{count} 天前',
      thisYear: '{month}月{day}日',
      full: '{year}年{month}月{day}日',
    },
    status: {
      approximate: '原文可能已修改',
      ambiguous: '位置不确定',
      stale: '原文已修改',
    },
    expand: {
      more: '更多',
      collapse: '收起',
    },
    submit: '批注',
    submitting: '提交中…',
    comment: '评论',
    loading: '加载批注中…',
    discussionTitle: '批注: {title}',
    list: {
      title: '批注 ({count})',
      articleCommentPlaceholder: '评论这篇文章…（⏎ 提交，Shift+⏎ 换行）',
    },
    popover: {
      placeholder: '写下批注…',
      hint: '⏎ 提交 · Esc 取消',
      loginPrompt: '登录以添加批注',
      loginButton: '使用 GitHub 登录',
      connecting: '正在连接 GitHub…',
      deviceFlowHint: '打开链接并输入验证码：',
      retry: '重试',
    },
    selection: {
      copy: '复制',
      copied: '已复制',
      comment: '评论',
    },
    reply: {
      replyTo: '回复',
      placeholderGeneric: '回复…（⏎ 发送，Esc 关闭）',
      placeholderToUser: '回复 {user}…（⏎ 发送，Esc 关闭）',
    },
    reaction: {
      THUMBS_UP: '赞',
      THUMBS_DOWN: '踩',
      LAUGH: '笑',
      HOORAY: '庆祝',
      CONFUSED: '困惑',
      HEART: '心',
      ROCKET: '火箭',
      EYES: '眼睛',
    },
    rail: {
      prefix: '侧栏',
      checked: '展开',
      unchecked: '隐藏',
      unanchored: '无法定位 ({count})',
    },
    auth: {
      network: '无法连接 GitHub，请检查网络',
      httpError: 'GitHub 返回错误 ({status})，请检查 Client ID 配置',
      httpError405: '缺少登录代理（405）。请配置 VITE_GITHUB_AUTH_PROXY 指向 Cloudflare Worker。',
      verifyFailed: '验证失败: {detail}',
      timeout: '验证超时，请重新登录',
    },
    error: {
      empty: '请输入内容',
      load: '加载批注失败',
      submit: '提交批注失败',
      comment: '评论失败',
      reply: '回复失败',
      notLoggedIn: '未登录，请先使用 GitHub 登录',
      noAnchor: '请重新选择文本后再批注',
      submitterNotReady: '批注提交器未就绪',
    },
  },
} as const

export function resolveAuthError(
  t: Composer['t'],
  error: AnnotationAuthError | null,
): string {
  if (!error)
    return ''
  switch (error.code) {
    case 'network':
      return t('auth.network')
    case 'httpError':
      if (error.status === 405) {
        return t('auth.httpError405')
      }
      return t('auth.httpError', { status: error.status })
    case 'verifyFailed':
      return t('auth.verifyFailed', { detail: error.detail })
    case 'timeout':
      return t('auth.timeout')
  }
}

/** Known i18n keys pass through `t()`; API / unknown messages display as-is. */
export function resolveAnnotationMessage(
  t: Composer['t'],
  te: Composer['te'],
  message: string | null,
): string {
  if (!message)
    return ''
  return te(message) ? t(message) : message
}
