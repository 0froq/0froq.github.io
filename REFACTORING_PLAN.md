# **项目重构计划：迁移到 pnpm Workspace + Mono Repo 架构**

## **1. 背景与目标**

当前项目中，UI 组件（如 `QSeparator`、`QCheckbox`、`TaskList` 等）与文档站点（VitePress）混合在同一个代码库中，导致：

- **组件复用性差**：组件散落在 `docs/.vitepress/theme/components/` 各处，难以在其他项目复用
- **依赖管理混乱**：dashboard、tags、corpus、posts 各模块依赖关系不清晰
- **构建与测试耦合严重**：修改一个组件可能触发整个站点重新构建
- **难以独立发布或版本控制 UI 组件**：无法像 `npm install @myproject/ui` 一样使用

**目标**：将 UI 组件抽离为独立包，构建 **Mono Repo** 结构，通过 `pnpm workspace` 实现高效依赖管理与跨包引用，提升长期可维护性。

---

## **2. 什么是 Mono Repo？**

**Mono Repo** 是指将多个相关项目（如 UI 组件库、文档站、工具脚本）统一托管在一个 Git 仓库中，但各自拥有独立的 `package.json`、构建配置与发布流程。

**优势**：
- ✅ 共享工具链（TypeScript、ESLint、Prettier、UnoCSS）
- ✅ 一键安装所有依赖（`pnpm install`）
- ✅ 本地开发时组件修改可实时生效（`pnpm link` 自动生效）
- ✅ 避免重复依赖、版本冲突（pnpm 自动去重）
- ✅ 原子化提交：跨包改动可在一个 commit 中完成

**风险**：
- ⚠️ 仓库体积增大（但 pnpm 的硬链接机制可缓解）
- ⚠️ 权限与发布流程需规范（需配置 Changesets 或类似工具）
- ⚠️ 初期迁移成本高（需重构文件结构、更新导入路径）

> ✅ **评估结论**：若未来计划在多个站点中重度使用自定义 UI 组件（如复杂仪表盘、交互式表单），抽离 UI 库是**必要且高价值**的架构升级，将显著提升可维护性与团队协作效率。

---

## **3. 推荐文件结构（重构后）**

```
my-project/                    ← 根目录（Mono Repo）
├── packages/                  ← 所有子包存放处
│   ├──
│   │   ├── src/
│   │   │   ├── dashboard/     ← Dashboard 相关组件
│   │   │   │   ├── Layout.vue
│   │   │   │   ├── Home.vue
│   │   │   │   ├── Hints.vue
│   │   │   │   ├── Visions.vue
│   │   │   │   └── TaskList/
│   │   │   │       ├── TaskList.vue
│   │   │   │       └── TaskListItem.vue
│   │   │   ├── tags/          ← Tags 相关组件
│   │   │   │   ├── Layout.vue
│   │   │   │   ├── Home.vue
│   │   │   │   └── Detail.vue
│   │   │   ├── corpus/        ← Corpus 相关组件
│   │   │   │   ├── Layout.vue
│   │   │   │   ├── Home.vue
│   │   │   │   ├── Layer.vue
│   │   │   │   └── Article.vue
│   │   │   ├── posts/         ← Posts 相关组件
│   │   │   │   ├── Layout.vue
│   │   │   │   ├── Home.vue
│   │   │   │   └── Article.vue
│   │   │   ├── header/        ← Header 导航组件
│   │   │   │   ├── Nav.vue
│   │   │   │   ├── Logo.vue
│   │   │   │   ├── Layer.vue
│   │   │   │   └── Doing.vue
│   │   │   ├── common/        ← 通用组件
│   │   │   │   ├── DashboardItem.vue
│   │   │   │   ├── LinkUnderline.vue
│   │   │   │   ├── ProgressBarHeader.vue
│   │   │   │   ├── QSeperator.vue
│   │   │   │   ├── PostListSection.vue
│   │   │   │   ├── PostNavigation.vue
│   │   │   │   ├── TagDisplay.vue
│   │   │   │   ├── TagTreeNode.vue
│   │   │   │   └── TooltipPostInfo.vue
│   │   │   └── index.ts       ← 统一导出所有组件
│   │   ├── package.json       ← 名称：@myproject/ui
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts     ← Vite 构建配置
│   │   └── unocss.config.ts   ← UnoCSS 配置
│   │
│   └── docs/                  ← VitePress 文档站点
│       ├── .vitepress/
│       │   ├── theme/
│       │   │   ├── index.ts   ← 主题入口
│       │   │   └── style.css
│       │   └── config.ts      ← VitePress 配置
│       ├── src/
│       │   └── pages/         ← 页面级组件（仅含包装层）
│       │       ├── dashboard/
│       │       ├── tags/
│       │       ├── corpus/
│       │       └── posts/
│       ├── package.json       ← 名称：@myproject/docs
│       └── tsconfig.json
│
├── pnpm-workspace.yaml        ← 声明 workspace 包
├── package.json               ← 根级 package.json（管理全局脚本）
├── tsconfig.json              ← 根级 TS 配置（共享）
├── .eslintrc.cjs
├── .prettierrc
├── uno.config.ts              ← 根级 UnoCSS 配置（供所有包共享）
├── README.md                  ← 项目总览
└── scripts/                   ← 通用脚本（如发布、构建）
    └── release.sh
```

---

## **4. 如何在文档中引用 UI 组件？**

### 步骤 1：在 `packages/ui/package.json` 中声明

```json
{
  "name": "@myproject/ui",
  "version": "1.0.0",
  "type": "module",
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    },
    "./dashboard": {
      "import": "./dist/dashboard/index.js",
      "types": "./dist/dashboard/index.d.ts"
    },
    "./tags": {
      "import": "./dist/tags/index.js",
      "types": "./dist/tags/index.d.ts"
    },
    "./corpus": {
      "import": "./dist/corpus/index.js",
      "types": "./dist/corpus/index.d.ts"
    },
    "./posts": {
      "import": "./dist/posts/index.js",
      "types": "./dist/posts/index.d.ts"
    },
    "./header": {
      "import": "./dist/header/index.js",
      "types": "./dist/header/index.d.ts"
    },
    "./common": {
      "import": "./dist/common/index.js",
      "types": "./dist/common/index.d.ts"
    }
  },
  "files": ["dist"],
  "scripts": {
    "build": "vite build",
    "dev": "vite build --watch",
    "typecheck": "vue-tsc --noEmit"
  },
  "peerDependencies": {
    "vue": "^3.3.0",
    "vue-i18n": "^9.0.0",
    "vitepress": "^1.0.0"
  },
  "dependencies": {
    "@vueuse/core": "^10.0.0"
  }
}
```

### 步骤 2：在 `packages/docs/package.json` 中依赖

```json
{
  "name": "@myproject/docs",
  "type": "module",
  "scripts": {
    "dev": "vitepress dev",
    "build": "vitepress build",
    "preview": "vitepress preview"
  },
  "dependencies": {
    "@myproject/ui": "workspace:*",
    "vue": "^3.3.0",
    "vue-i18n": "^9.0.0"
  },
  "devDependencies": {
    "vitepress": "^1.0.0",
    "@vitejs/plugin-vue": "^5.0.0"
  }
}
```

### 步骤 3：在 `pnpm-workspace.yaml` 中声明

```yaml
packages:
  - 'packages/*'
```

### 步骤 4：在文档的 Vue 组件中直接导入

```vue
<!-- packages/docs/.vitepress/theme/pages/dashboard/Home.vue -->
<script setup lang="ts">
// ✅ 方式 1：从子包导入（推荐）
import { DashboardHome, DashboardVisions, DashboardHints } from '@myproject/ui/dashboard'

// ✅ 方式 2：从 common 导入通用组件
import { ProgressBarHeader, LinkUnderline } from '@myproject/ui/common'

// ✅ 方式 3：从 header 导入导航
import { HeaderNav } from '@myproject/ui/header'
</script>

<template>
  <HeaderNav :items="navItems" />
  <ProgressBarHeader title="Dashboard" />
  <DashboardHome />
</template>
```

### 步骤 5：构建与部署

```bash
# 根目录执行
pnpm install          # 安装所有依赖

# 开发模式（热更新）
pnpm --filter @myproject/ui dev      # 监听 UI 组件变化
pnpm --filter @myproject/docs dev    # 启动文档站点

# 生产构建
pnpm --filter @myproject/ui build    # 构建 UI 库
pnpm --filter @myproject/docs build  # 构建文档站点

# 一键构建全部
pnpm -r build
```

> ✅ **关键优势**：你无需手动复制组件代码，所有变更通过 `workspace:*` 实时同步，修改 `packages/ui/src/dashboard/Home.vue` 后，`packages/docs` 会自动热更新，避免"版本不同步"问题。

---

## **5. 重构步骤（分阶段执行）**

### **阶段 1：准备工作（低风险）**

| 操作 | 具体步骤 | 风险控制 |
|------|----------|----------|
| 初始化 | 创建 `packages/ui/` 和 `packages/docs/` 目录 | 保留原 `docs/` 目录，新建 `packages/docs/` 作为新站点 |
| 配置 pnpm | 创建 `pnpm-workspace.yaml`，运行 `pnpm install` | 验证是否识别两个包 |
| 依赖迁移 | 将根目录 `package.json` 中的 devDependencies 分类 | 构建工具放根目录，运行时依赖放对应包 |

### **阶段 2：迁移 UI 组件（中风险）**

| 操作 | 具体步骤 | 风险控制 |
|------|----------|----------|
| 组件迁移 | 将 `docs/.vitepress/theme/components/dashboard/*` 迁移到 `packages/ui/src/dashboard/` | 保留原文件，使用 `git mv` 保持历史记录 |
| 更新导入 | 修改组件内部相对路径导入（如 `@/LinkUnderline` → `@myproject/ui/common`） | 使用 IDE 批量重构 |
| 统一导出 | 在每个子目录创建 `index.ts`，统一导出组件 | 确保类型定义正确导出 |
| 构建配置 | 配置 `packages/ui/vite.config.ts` 支持 Vue + UnoCSS | 先在本地测试打包产物 |

### **阶段 3：迁移文档站点（中风险）**

| 操作 | 具体步骤 | 风险控制 |
|------|----------|----------|
| 配置迁移 | 将 `docs/.vitepress/config.ts` 迁移到 `packages/docs/` | 调整 alias 配置指向 `@myproject/ui` |
| 页面迁移 | 将 `docs/dashboard/`、`docs/tags/` 等 markdown 文件迁移 | 保持 frontmatter 不变 |
| 更新引用 | 修改所有组件导入语句 | 从相对路径改为 `@myproject/ui/*` |
| 主题迁移 | 迁移 `theme/index.ts` 和样式文件 | 确保 UnoCSS 预设一致 |

### **阶段 4：测试与验证（低风险）**

| 操作 | 具体步骤 | 风险控制 |
|------|----------|----------|
| 本地测试 | 运行 `pnpm --filter @myproject/docs dev` | 检查所有页面是否正常渲染 |
| 类型检查 | 运行 `pnpm --filter @myproject/ui typecheck` | 确保无 TS 错误 |
| 构建测试 | 运行 `pnpm -r build` | 验证产物是否正确生成 |
| 对比验证 | 对比新旧站点的构建产物 | 确保功能一致 |

### **阶段 5：清理旧代码（高风险，最后执行）**

| 操作 | 具体步骤 | 风险控制 |
|------|----------|----------|
| 删除旧文件 | 删除原 `docs/.vitepress/theme/components/` | 仅在确认新站点稳定后执行 |
| 更新 CI/CD | 修改 GitHub Actions 构建脚本 | 更新构建路径为 `packages/docs/` |
| 文档更新 | 更新根目录 `README.md` | 添加开发指南 |

---

## **6. 是否值得做？—— 评估结论**

| 维度 | 当前状态 | 重构后 | 评估 |
|------|----------|--------|------|
| **可维护性** | 低，组件散乱在各处，无版本控制 | 高，组件独立、可复用、可版本化 | ✅ 强烈推荐 |
| **协作效率** | 团队难并行开发，容易冲突 | 可多人同时改不同包，独立发布 | ✅ 强烈推荐 |
| **构建速度** | 每次修改触发全量构建 | 按包增量构建，缓存友好 | ✅ 改善明显 |
| **复用能力** | 无法在其他项目使用 | 可发布到 npm 供任意项目安装 | ✅ 战略性价值 |
| **学习成本** | 无 | 中等（需熟悉 pnpm workspace、monorepo 工具链） | ⚠️ 初期有门槛，但一次投入长期受益 |
| **技术债风险** | 持续累积 | 架构清晰，易于扩展 | ✅ 避免未来重构成本倍增 |

### **适合迁移的信号**：
- ✅ 已有 4+ 个页面模块（dashboard、tags、corpus、posts）
- ✅ 组件数量超过 20 个
- ✅ 计划在多个项目复用 UI（如未来做小程序、Electron 版本）
- ✅ 团队有 2+ 人协作开发

### **不适合迁移的信号**：
- ❌ 项目即将结束，不再维护
- ❌ 组件极少（< 10 个），且只在单一项目使用
- ❌ 团队不熟悉 pnpm / monorepo 工具链，且不愿学习

> ✅ **最终建议**：**建议启动重构**。你当前已有 dashboard、tags、corpus、posts 四个独立模块，组件数量超过 30 个，正是 Mono Repo 的典型应用场景。**不重构，未来技术债将成倍增长**。

---

## **7. 补充建议**

### **7.1 使用 Changesets 管理版本发布（推荐）**

```bash
# 安装
pnpm add -D @changesets/cli

# 初始化
pnpm changeset init

# 发布流程
pnpm changeset              # 选择要发布的包，填写 changelog
pnpm changeset version      # 自动更新版本号
pnpm changeset publish      # 发布到 npm
```

### **7.2 为 UI 组件添加 Storybook（可选，提升开发体验）**

```bash
# 在 packages/ui/ 中添加
pnpm add -D @storybook/vue3 @storybook/vite

# 创建 stories
packages/ui/src/dashboard/Home.stories.ts
```

### **7.3 共享配置抽离（进阶）**

```
packages/
  ├── ui/              # UI 组件库
  ├── docs/            # 文档站点
  └── config/          # 共享配置（可选）
      ├── tsconfig.base.json
      ├── eslint.config.js
      └── unocss.config.ts
```

### **7.4 文档站点入口文件更新**

在 `packages/docs/.vitepress/theme/index.ts` 中：

```typescript
import { h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'

// 从 UI 包导入组件
import { HeaderNav, HeaderLayer, HeaderLogo } from '@myproject/ui/header'
import { ProgressBarHeader, LinkUnderline } from '@myproject/ui/common'

// 导入样式
import '@myproject/ui/dist/style.css'
import './style.css'

export default {
  extends: DefaultTheme,
  Layout: () => h(DefaultTheme.Layout, null, {
    // 自定义布局插槽
  }),
  enhanceApp({ app }) {
    // 注册全局组件
    app.component('HeaderNav', HeaderNav)
    app.component('ProgressBarHeader', ProgressBarHeader)
    // ...
  }
} satisfies Theme
```

---

## **8. 快速开始模板**

我已为你准备了核心配置文件模板，复制以下内容即可开始：

### **根目录 `package.json`**

```json
{
  "name": "my-project",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "pnpm -r --parallel dev",
    "build": "pnpm -r build",
    "typecheck": "pnpm -r typecheck",
    "clean": "pnpm -r exec rm -rf dist node_modules"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.3.0"
  },
  "engines": {
    "node": ">=18",
    "pnpm": ">=8"
  }
}
```

### **根目录 `pnpm-workspace.yaml`**

```yaml
packages:
  - 'packages/*'

# 共享依赖 hoist 配置
sharedWorkspaceLockfile: true
preferWorkspacePackages: true
```

### **根目录 `.npmrc`**

```ini
shamefully-hoist=true
strict-peer-dependencies=false
auto-install-peers=true
```

---

## **下一步行动清单**

- [ ] 1. 在根目录创建 `packages/ui/` 和 `packages/docs/` 目录
- [ ] 2. 复制上述 `pnpm-workspace.yaml` 和 `.npmrc` 到根目录
- [ ] 3. 运行 `pnpm install` 验证 workspace 是否正常
- [ ] 4. 将 `docs/.vitepress/theme/components/dashboard/` 迁移到 `packages/ui/src/dashboard/`
- [ ] 5. 创建 `packages/ui/package.json` 和 `vite.config.ts`
- [ ] 6. 更新 `packages/docs/` 中的组件导入路径
- [ ] 7. 本地测试 `pnpm --filter @myproject/docs dev`
- [ ] 8. 逐步迁移其他模块（tags、corpus、posts）
- [ ] 9. 添加 Changesets 版本管理
- [ ] 10. 更新 CI/CD 构建脚本

---

**预计工作量**：2-3 天（熟悉后）
**长期收益**：显著提升可维护性、团队协作效率、组件复用能力
