# Rune Annotation System — 实施计划 (v2)

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** froQ 的 VitePress 博客全站文本级批注系统。GitHub Device Flow 认证（零后端），GitHub Discussions 存储（零数据库），跨设备可用。

**架构：**

- 认证：GitHub Device Flow → access_token 存 localStorage → 前端直调 GitHub REST API
- 存储：每页面一个 Discussion（懒创建），每条批注一个 Comment（body = JSON）
- 锚定：上下文指纹（prefix + selected + suffix + occurrence）→ DOM 搜索匹配
- Rune 消费：Cast/Carve 通过 `gh api graphql` 拉批注数据

**当前上下文：**

- 博客路径：`/Users/oQ/2_areas/knowledge_management/blog`
- GitHub 部署：0froq/0froq.github.io（GitHub Pages 静态托管）
- 技术栈：Vue 3 + TypeScript + VitePress + UnoCSS + pnpm
- 自定义 theme：`docs/.vitepress/theme/`

---

## 前置准备（froQ 操作）

### Step 0: 创建 GitHub OAuth App

1. 打开 https://github.com/settings/developers → New OAuth App
2. Application name: `froQ Blog Annotations`
3. Homepage URL: `https://0froq.github.io`
4. Authorization callback URL: `https://0froq.github.io`（Device Flow 用不到，但必填）
5. ⚠️ **关键：** 创建后进入 App settings → 开启 "Device Flow"（默认关闭）
6. 记录 Client ID（不需要 Client Secret）
7. 在 `/Users/oQ/2_areas/knowledge_management/blog/.env.local` 中写入：
   ```
   VITE_GITHUB_CLIENT_ID=你的ClientID
   ```

### Step 0b: 在 repo 启用 Discussions

1. 打开 https://github.com/0froq/0froq.github.io/settings
2. Features → 勾选 Discussions

---

## Part 1: 认证模块（GitHub Device Flow）

### Task 1: 创建 useGitHubAuth composable

**Files:**

- Create: `docs/.vitepress/theme/composables/useGitHubAuth.ts`

Device Flow 三步：

```
1. POST https://github.com/login/device/code
   → { device_code, user_code, verification_uri, interval }

2. 展示 user_code 给用户 → 用户去 verification_uri 输入

3. 轮询 POST https://github.com/login/oauth/access_token
   → { access_token }
```

```typescript
// useGitHubAuth.ts
import { computed, ref } from 'vue'

const CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID

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

const token = ref<string | null>(
  typeof localStorage !== 'undefined'
    ? localStorage.getItem('annotation_github_token')
    : null,
)
const user = ref<GitHubUser | null>(null)
const isAuthenticated = computed(() => !!token.value)
const isAuthenticating = ref(false)
const deviceAuthInfo = ref<{
  user_code: string
  verification_uri: string
} | null>(null)

async function startDeviceFlow(): Promise<void> {
  isAuthenticating.value = true
  const res = await fetch('https://github.com/login/device/code', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      client_id: CLIENT_ID,
      scope: 'public_repo',
    }),
  })
  const data: DeviceCodeResponse = await res.json()

  deviceAuthInfo.value = {
    user_code: data.user_code,
    verification_uri: data.verification_uri,
  }

  // 开始轮询
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
    await sleep(interval * 1000)

    const res = await fetch(
      'https://github.com/login/oauth/access_token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          client_id: CLIENT_ID,
          device_code,
          grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
        }),
      },
    )

    const data = await res.json()

    if (data.error === 'authorization_pending') {
      continue // 用户还没输入
    }

    if (data.access_token) {
      token.value = data.access_token
      localStorage.setItem('annotation_github_token', data.access_token)
      deviceAuthInfo.value = null
      isAuthenticating.value = false
      await fetchUser()
      return
    }

    // 其他错误（expired_token, access_denied 等）
    isAuthenticating.value = false
    deviceAuthInfo.value = null
    throw new Error(data.error_description || data.error)
  }
}

async function fetchUser(): Promise<void> {
  if (!token.value)
    return
  const res = await fetch('https://api.github.com/user', {
    headers: { Authorization: `Bearer ${token.value}` },
  })
  user.value = await res.json()
}

function logout(): void {
  token.value = null
  user.value = null
  localStorage.removeItem('annotation_github_token')
}

// 初始化时如果有 token，fetch user
if (token.value) {
  fetchUser()
}

export function useGitHubAuth() {
  return {
    token,
    user,
    isAuthenticated,
    isAuthenticating,
    deviceAuthInfo,
    startDeviceFlow,
    logout,
    fetchUser,
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
```

**验证：** Dev 环境下点击登录 → 弹出 device code → 浏览器打开 `verification_uri` 输入 → 轮询拿到 token → 显示用户名

---

## Part 2: 数据模型 & GitHub API

### Task 2: 类型定义

**Files:**

- Create: `docs/.vitepress/theme/types/annotation.ts`

```typescript
export interface AnnotationAnchor {
  selected: string
  prefix: string
  suffix: string
  occurrence: number
}

export interface AnnotationData {
  version: 1
  pagePath: string
  anchor: AnnotationAnchor
  text: string
  status: 'active' | 'resolved' | 'outdated'
  createdAt: string
}

export interface ResolvedAnnotation {
  commentId: number
  commentUrl: string
  author: {
    login: string
    avatarUrl: string
  }
  data: AnnotationData
  domRange: Range | null
}
```

### Task 3: GitHub Discussions API composable

**Files:**

- Create: `docs/.vitepress/theme/composables/useGitHubDiscussions.ts`

常量：`REPO_OWNER = '0froq'`, `REPO_NAME = '0froq.github.io'`

核心方法（全部用原生 fetch + GitHub REST API）：

```
// === Discussion 管理 ===

findDiscussionByPage(pagePath: string, token: string): Promise<number | null>
  → GET /repos/{owner}/{repo}/discussions?per_page=100
  → 遍历，检查 body 中是否包含 <!-- page: {pagePath} -->
  → 找到返回 discussion number，否则 null

createDiscussion(pagePath: string, title: string, token: string): Promise<number>
  → POST /repos/{owner}/{repo}/discussions
  → body: { title, body: `<!-- page: {pagePath} -->`, category_id: ... }
  → 返回 discussion number

findOrCreateDiscussion(pagePath: string, title: string, token: string): Promise<number>
  → findDiscussionByPage → 有则返回，无则 createDiscussion

// === Comment 管理 ===

getAnnotations(discussionNumber: number, token: string): Promise<ResolvedAnnotation[]>
  → GET /repos/{owner}/{repo}/discussions/{number}/comments?per_page=100
  → 过滤 body 中含 { "version": 1 的 comment
  → 解析 JSON → ResolvedAnnotation[]

createAnnotation(discussionNumber: number, data: AnnotationData, token: string): Promise<number>
  → POST /repos/{owner}/{repo}/discussions/{number}/comments
  → body: JSON.stringify(data, null, 2)
  → 返回 comment ID

updateAnnotation(commentId: number, data: Partial<AnnotationData>, token: string): Promise<void>
  → PATCH /repos/{owner}/{repo}/discussions/comments/{commentId}
  → body: JSON.stringify(data, null, 2)
```

**Discussion category：**
创建 Discussion 时需要 `category_id`。先通过
`GET /repos/{owner}/{repo}/discussions/categories`
获取可用 category 列表，选第一个（通常是 "General"）。

### Task 4: 指纹计算 & DOM 锚定工具

**Files:**

- Create: `docs/.vitepress/theme/utils/annotationFingerprint.ts`

两个导出函数：

```typescript
/**
 * 从 Selection 计算锚定指纹
 */
export function computeAnchor(selection: Selection): AnnotationAnchor | null {
  if (!selection.rangeCount)
    return null
  const range = selection.getRangeAt(0)
  const selected = range.toString().trim()
  if (!selected)
    return null

  // 获取选中文本在页面文本中的位置
  const container = document.getElementById('content') || document.body
  const { textNodes, combined } = walkTextNodes(container)

  const startOffset = findOffset(textNodes, range.startContainer, range.startOffset)
  const endOffset = findOffset(textNodes, range.endContainer, range.endOffset)

  const PREFIX_LEN = 30
  const SUFFIX_LEN = 30

  const prefixStart = Math.max(0, startOffset - PREFIX_LEN)
  const suffixEnd = Math.min(combined.length, endOffset + SUFFIX_LEN)

  const prefix = combined.slice(prefixStart, startOffset)
  const suffix = combined.slice(endOffset, suffixEnd)

  const searchStr = escapeRegex(prefix + selected + suffix)
  const regex = new RegExp(searchStr, 'g')
  let occurrence = 0
  let match: RegExpExecArray | null
  while ((match = regex.exec(combined)) !== null) {
    occurrence++
    if (match.index === prefixStart)
      break
  }

  return { selected, prefix, suffix, occurrence }
}

/**
 * 在 DOM 中查找锚定位置，返回 Range 或 null（stale）
 */
export function findAnchorInDOM(
  container: HTMLElement,
  anchor: AnnotationAnchor,
): Range | null {
  const { textNodes, combined } = walkTextNodes(container)
  const searchStr = escapeRegex(anchor.prefix + anchor.selected + anchor.suffix)
  const regex = new RegExp(searchStr, 'g')

  let match: RegExpExecArray | null
  let count = 0
  while ((match = regex.exec(combined)) !== null) {
    count++
    if (count === anchor.occurrence) {
      const prefixEnd = match.index + anchor.prefix.length
      const selectedEnd = prefixEnd + anchor.selected.length
      return createRangeFromOffsets(textNodes, prefixEnd, selectedEnd)
    }
  }
  return null
}
```

内部 helper：`walkTextNodes`（递归遍历子元素收集 textNode + 拼接完整文本）、`createRangeFromOffsets`（将字符偏移映射回 textNode 偏移并创建 Range）、`escapeRegex`（转义正则特殊字符）。

---

## Part 3: UI 组件

### Task 5: AnnotationPopover.vue

**Files:**

- Create: `docs/.vitepress/theme/components/annotation/AnnotationPopover.vue`

功能：

- 选中文本后在选区上方/下方弹出
- 未登录状态：显示"登录 GitHub 以批注"按钮 → 触发 Device Flow
- Device Flow 进行中：显示 `user_code` + `verification_uri`，引导用户操作
- 已登录：textarea + 提交按钮 + 取消按钮
- 提交时：计算指纹 → findOrCreateDiscussion → createAnnotation → emit 'created'
- 按 Escape 或点击外部关闭

定位逻辑：用 `selection.getRangeAt(0).getBoundingClientRect()` 确定弹出位置。

### Task 6: AnnotationSidebar.vue

**Files:**

- Create: `docs/.vitepress/theme/components/annotation/AnnotationSidebar.vue`

功能：

- 固定在页面右侧（或作为 overlay 侧边栏）
- 列出当前页面所有批注（按位置排序）
- 每条显示：作者头像、用户名、批注文本（截断）、时间
- 点击条目 → 滚动到对应高亮位置
- stale 批注：灰色、`[原文已变更]` 标记、仍保留内容
- 开关按钮（默认展开），未登录或未批注页面时不显示

### Task 7: useAnnotationHighlight.ts

**Files:**

- Create: `docs/.vitepress/theme/composables/useAnnotationHighlight.ts`

功能：

- 接收 `ResolvedAnnotation[]`
- 对每个 annotation，调用 `findAnchorInDOM` 获取 Range
- 为每个 Range 创建高亮 `<mark>` 元素（背景色根据状态区分：active=黄色，stale=灰色）
- 路由切换时清理所有高亮
- 返回 `highlight(annotations)` 和 `clearAll()` 方法

### Task 8: AnnotationClient.vue（主组件）

**Files:**

- Create: `docs/.vitepress/theme/components/annotation/AnnotationClient.vue`

功能：

- 使用 `provide/inject` 向下传递认证状态和 annotations 列表
- `onMounted`：检查是否有 token → fetch user → 查找页面对应的 Discussion → fetch annotations → highlight
- 监听 `mouseup`：检测非空选区 → 显示 Popover
- 监听 `keydown` Escape → 关闭 Popover
- 协调 Popover / Sidebar / Highlight 三组件
- 路由变化时：cleanup + 重新加载新页面的 annotations

---

## Part 4: VitePress 集成

### Task 9: 在 Layout.vue 中注入 AnnotationClient

**Files:**

- Modify: `docs/.vitepress/theme/Layout.vue`

```vue
<script setup>
import AnnotationClient from './components/annotation/AnnotationClient.vue'
</script>

<template>
  <div ...>
    <PageHeader />
    <PageContent :key="route.path" />
    <!-- 全站启用批注，仅在客户端渲染 -->
    <ClientOnly>
      <AnnotationClient />
    </ClientOnly>
    <ButtonVerticalNavigation ... />
    <PageFooter />
  </div>
</template>
```

`ClientOnly` 确保 AnnotationClient 只在浏览器端运行（SSR 不执行）。

### Task 10: 环境变量

**Files:**

- Create/Modify: `.env.local`（已创建，不提交）
- Create: `.env.example`

```
# .env.example
VITE_GITHUB_CLIENT_ID=your_github_oauth_app_client_id
```

`.gitignore` 确认 `.env.local` 在忽略列表中。

---

## Part 5: Rune Pipeline 集成

### Task 11: 更新 Cast prompt

**Files:**

- Cast cron job `5335355cfa98`（通过 `cronjob action='update'`）

在 Cast prompt 的"步骤 1. 读取上下文"中新增：

```markdown
### 1b. 读取 froQ 批注

运行：
gh api graphql -f query='
query {
repository(owner:"0froq", name:"0froq.github.io") {
discussions(first:30, orderBy:{field:UPDATED_AT, direction:DESC}) {
nodes {
number
title
url
updatedAt
comments(last:10) {
nodes {
body
author { login }
createdAt
}
}
}
}
}
}'

解析流程：

- 对每个 discussion，检查 comments 的 body 中是否含 "pagePath"
- 提取所有 annotation 数据（pagePath、text、createdAt）
- 如发现近 24h 的批注 → 视为 high-priority 信号
- 如有新批注 → 必须产出 activity note（不适用"安静姿态"规则）
```

### Task 12: 更新 Carve prompt

**Files:**

- Carve cron job `dfc8510889f2`

在 Carve prompt 新增步骤：

```markdown
### 读取 froQ 批注

执行与 Cast 相同的 gh api graphql 查询。

在产出文件的 `## froQ 反馈` 节中，实际列出：

- 批注内容
- 批注来源页面
- 批注时间

如有多个批注，按时间排序。如有批注指向本 Carve 评估的同一内容 → 优先解读该方向并标明 froQ 的输入。

如果在 `## froQ 反馈` 节写入实际批注内容，则不再写"均为空白占位"。
```

---

## Part 6: 部署（GitHub Pages）

GitHub Pages 是纯静态托管。Device Flow 不需要任何后端服务，部署就是 `vitepress build` → push → GitHub Pages 自动部署。无需额外配置。

唯一需要注意：`.env.local` 中的 `VITE_GITHUB_CLIENT_ID` 在 build 时会被 Vite 内联到 JS bundle 中。Client ID 是公开信息，暴露在静态站点里没有问题（没有 client_secret）。

---

## 风险与权衡

| 风险                                                | 缓解                                                                  |
| --------------------------------------------------- | --------------------------------------------------------------------- |
| Device Flow 用户体验多一步（手动输入 code）         | 一次登录，token 存 localStorage，长期有效                             |
| token 存 localStorage → XSS 风险                    | scope 最小化（仅 `public_repo`），token 可随时在 GitHub 设置中 revoke |
| DOM 匹配失败 → stale 批注                           | stale 是正常设计，不丢数据，注释仍可阅读                              |
| Discussion 查找需遍历                               | blog 全站页面数有限，Discussion 总量可控                              |
| 移动端文本选择体验差                                | 桌面端为主，移动端接受阅读体验                                        |
| GitHub API rate limit（未认证 60/h，已认证 5000/h） | 已认证用户调用，5000/h 对批注场景绰绰有余                             |

---

## 实施顺序

1. **Step 0-0b**（froQ 手动）：创建 OAuth App + 启用 Discussions
2. **Task 1**：认证 composable → 本地验证 Device Flow 能拿到 token
3. **Task 2-4**：类型 + API composable + 指纹工具
4. **Task 5-8**：UI 组件（Popover → Sidebar → Highlight → Client）
5. **Task 9**：集成到 Layout.vue → 本地验证全流程
6. **Task 10**：环境变量清理
7. **Task 11-12**：Rune cron job prompt 更新
8. **部署测试**：`vitepress build` → push → 生产验证
