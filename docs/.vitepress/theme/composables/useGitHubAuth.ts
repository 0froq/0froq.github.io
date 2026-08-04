import { computed, readonly, ref, shallowRef } from 'vue'

// ---- 内部 helpers ----
const CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID ?? ''

// 开发环境通过 Vite proxy 绕开 CORS，生产环境需要配置 Cloudflare Worker 或类似
const AUTH_BASE = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  ? '/__auth'     // Vite proxy
  : 'https://github.com/login'

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
const authError = ref<string | null>(null)

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
  isAuthenticating.value = true

  let res: Response
  try {
    res = await fetch(`${AUTH_BASE}/device/code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ client_id: CLIENT_ID, scope: 'public_repo' }),
    })
  }
  catch {
    authError.value = '无法连接 GitHub，请检查网络'
    isAuthenticating.value = false
    return
  }

  if (!res.ok) {
    authError.value = `GitHub 返回错误 (${res.status})，请检查 Client ID 配置`
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
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
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
    authError.value = data.error_description || `验证失败: ${data.error}`
    isAuthenticating.value = false
    deviceInfo.value = null
    return
  }

  // 超时
  authError.value = '验证超时，请重新登录'
  isAuthenticating.value = false
  deviceInfo.value = null
}

async function fetchUser(): Promise<void> {
  if (!token.value) return
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
