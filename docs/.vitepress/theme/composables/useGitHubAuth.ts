import type { AnnotationAuthError } from '../i18n/annotation'
import { computed, readonly, ref, shallowRef } from 'vue'

// ---- 内部 helpers ----
const CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID ?? ''

/**
 * GitHub Device Flow endpoints do not allow browser CORS.
 * Dev: Vite proxies `/__auth` → `https://github.com/login` (see config.mts).
 * Prod: set `VITE_GITHUB_AUTH_PROXY` to the froq-api Worker base
 * (e.g. https://froq-api.YOUR_SUBDOMAIN.workers.dev) — same Worker also serves
 * presence/stats/progress. Optionally set `VITE_FROQ_API` to override.
 */
const AUTH_BASE = (import.meta.env.VITE_GITHUB_AUTH_PROXY as string | undefined)?.trim() || '/__auth'

interface GitHubUser {
  login: string
  avatar_url: string
  name: string | null
}

interface DeviceCodeResponse {
  device_code: string
  user_code: string
  verification_uri: string
  expires_in: number
  interval: number
}

// ---- 单例状态 ----
const token = ref<string | null>(
  typeof localStorage !== 'undefined'
    ? localStorage.getItem('annotation_github_token')
    : null,
)
const user = shallowRef<GitHubUser | null>(null)
const isAuthenticating = ref(false)
const authError = ref<AnnotationAuthError | null>(null)

// Device Flow 进行中时展示的信息
const deviceInfo = ref<{ user_code: string, verification_uri: string } | null>(null)

// ---- 计算 ----
const isAuthenticated = computed(() => !!token.value)

// ---- 方法 ----

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function startDeviceFlow(): Promise<void> {
  authError.value = null

  if (!CLIENT_ID) {
    authError.value = { code: 'httpError', status: 0 }
    return
  }

  isAuthenticating.value = true

  let res: Response
  try {
    res = await fetch(`${AUTH_BASE}/device/code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ client_id: CLIENT_ID, scope: 'public_repo' }),
    })
  }
  catch {
    authError.value = { code: 'network' }
    isAuthenticating.value = false
    return
  }

  if (!res.ok) {
    authError.value = { code: 'httpError', status: res.status }
    isAuthenticating.value = false
    return
  }

  const data: DeviceCodeResponse = await res.json()

  deviceInfo.value = {
    user_code: data.user_code,
    verification_uri: data.verification_uri,
  }

  // 轮询等待用户授权
  await pollForToken(data.device_code, data.interval, data.expires_in)
}

async function pollForToken(
  device_code: string,
  interval: number,
  expires_in: number,
): Promise<void> {
  const start = Date.now()
  const maxWait = expires_in * 1000

  while (Date.now() - start < maxWait) {
    await sleep(Math.max(interval, 2) * 1000)

    let res: Response
    try {
      res = await fetch(`${AUTH_BASE}/oauth/access_token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          client_id: CLIENT_ID,
          device_code,
          grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
        }),
      })
    }
    catch {
      continue // 网络抖动，继续轮询
    }

    const data = await res.json()

    if (data.error === 'authorization_pending') {
      continue
    }

    if (data.error === 'slow_down') {
      interval += 5 // GitHub 要求降速
      continue
    }

    if (data.access_token) {
      token.value = data.access_token
      localStorage.setItem('annotation_github_token', data.access_token)
      deviceInfo.value = null
      isAuthenticating.value = false
      await fetchUser()
      return
    }

    // expired_token / access_denied / 其他
    authError.value = {
      code: 'verifyFailed',
      detail: data.error_description || data.error || 'unknown',
    }
    isAuthenticating.value = false
    deviceInfo.value = null
    return
  }

  // 超时
  authError.value = { code: 'timeout' }
  isAuthenticating.value = false
  deviceInfo.value = null
}

async function fetchUser(): Promise<void> {
  if (!token.value)
    return
  const res = await fetch('https://api.github.com/user', {
    headers: { Authorization: `Bearer ${token.value}` },
  })
  if (res.ok) {
    user.value = await res.json()
  }
}

function logout(): void {
  token.value = null
  user.value = null
  deviceInfo.value = null
  authError.value = null
  localStorage.removeItem('annotation_github_token')
}

function clearError(): void {
  authError.value = null
}

// 初始化：有 token 就把用户信息拉回来
if (typeof window !== 'undefined' && token.value) {
  fetchUser()
}

// ---- 导出 ----
export function useGitHubAuth() {
  return {
    token: readonly(token),
    user: readonly(user),
    isAuthenticated,
    isAuthenticating: readonly(isAuthenticating),
    deviceInfo: readonly(deviceInfo),
    authError: readonly(authError),
    startDeviceFlow,
    logout,
    clearError,
    fetchUser,
  }
}
