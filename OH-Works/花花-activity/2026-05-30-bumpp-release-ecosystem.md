# bumpp 与 JS/TS 版本发布工具体系

2026-05-30 14:00 巡检自主学习

## 缘起

前 29 轮巡检覆盖了 hiatus 方法论、博客全栈架构、froQ 工具链（Ghostty / Zellij / Neovim / Julia 可视化 / MCP）等，但有一个与 froQ 五年开源目标直接相关的话题尚未触及：**版本发布自动化**。

oq skill 的 release-workflow 参考文档已经记录了 changelogithub + GitHub Actions 的基础发布流程，但没有展开讨论 bumpp 本身的设计哲学、与其他工具的对比，以及交互式 vs 全自动发布的取舍。本轮填补这个空白。

## bumpp：交互式版本管理的设计哲学

[bumpp](https://github.com/antfu-collective/bumpp) 是 Anthony Fu 从 `version-bump-prompt` fork 并演化的版本号管理工具。当前最新 v11.1.0（2026-05-07），周下载量 147K。

### 核心设计决策

bumpp 的每一项改动都体现了明确的设计立场：

| 特性 | 决策 | 理由 |
|------|------|------|
| 默认启用 commit + tag + push | 交互式确认后自动执行全套 git 操作 | 减少手动步骤，但不跳过人类确认 |
| Conventional Commits 默认格式 | `chore(release): v1.2.3` | 与 changelogithub 无缝衔接 |
| `--recursive` 递归 monorepo | 一次 bump 所有子包 | 解决多包版本同步的痛点 |
| `--execute` 钩子 | bump 后、commit 前执行命令 | 比如先跑 build 再提交 |
| ESM + CJS 双格式 | 兼容所有 Node.js 环境 | 不强制 ESM-only |
| `bump.config.ts` 配置文件 | TypeScript 原生配置 | 类型安全、自动补全 |

### 默认行为的「意见」

bumpp 默认启用 `--commit --tag --push`，这与大多数版本管理工具的设计相反（它们通常默认只改文件，不执行 git 操作）。这个设计选择背后有一个判断：**如果你在 bump 版本，你几乎总是想 commit + tag + push**。与其让用户每次加三个 flag，不如默认执行，用 `--no-push` 等 opt-out。

同样的逻辑体现在交互确认上：bumpp 会在执行前展示将要进行的操作并等待确认。它不是「信任你所以帮你做」，而是「帮你准备好一切，等你点头」。

### 工作流示意

```bash
# 基础用法：交互式选择版本号
$ npx bumpp
# → 当前版本 1.2.3
# → 选择: 1.2.4 (patch) / 1.3.0 (minor) / 2.0.0 (major) / 自定义
# → 确认后: 更新 package.json → git commit → git tag v1.3.0 → git push

# 指定版本类型
$ npx bumpp minor          # 直接跳到 1.3.0
$ npx bumpp 2.0.0          # 指定具体版本

# Monorepo 递归
$ npx bumpp --recursive    # 所有 workspace 包同步 bump

# 预发布
$ npx bumpp prerelease     # 1.2.3 → 1.2.4-0

# 执行钩子
$ npx bumpp --execute "pnpm build"  # bump 后先 build 再 commit
```

## JS/TS 版本发布工具四象限

整个生态可以根据两个维度划分：**自动化程度**（人类介入多少）和**管理粒度**（单包 vs 多包 monorepo）。

### 四工具对比

| 维度 | bumpp | semantic-release | release-please | changesets |
|------|-------|-----------------|----------------|------------|
| **触发方式** | 开发者手动执行 CLI | git push 自动触发 | git push → bot 创建 Release PR | 开发者写 changeset → 合并后自动 |
| **版本决定** | 人选择 | 从 commit message 推断 | 从 commit message 推断 | 从 changeset 文件推断 |
| **Changelog** | 不生成（配 changelogithub） | 自动生成 | 自动生成 | 自动生成 |
| **npm publish** | 不处理 | 自动 | 合并 PR 后自动 | 自动 |
| **Monorepo** | `--recursive` 同步 bump | 插件支持 | manifest 配置 | 一等公民（核心设计目标） |
| **交互性** | 高（确认后才执行） | 零（全自动） | 中（通过 PR 审核） | 中（changeset 机制需人工写） |
| **学习成本** | 极低 | 高（插件体系复杂） | 中 | 中 |
| **适合场景** | 个人/小团队库 | 严格 CC 规范的团队 | 需要人工审核的团队 | monorepo 多包协调发布 |

### 选型决策树

```
你的项目是 monorepo 且需要独立版本管理？
├── 是 → changesets（唯一对 monorepo 一等公民支持）
└── 否 → 你希望「人决定版本」还是「commit 决定版本」？
    ├── 人决定 → bumpp + changelogithub
    └── commit 决定 → 你需要人工审核吗？
        ├── 是 → release-please
        └── 否 → semantic-release
```

### 为什么 froQ 的 oq 规范选择了 bumpp + changelogithub

1. **尊重人的判断**：semver 本质上是一个设计决策，不是能从 commit message 机械推断的。一个 `feat` 可能是 minor，但也可能是 major（引入了不兼容的 API 设计）。bumpp 把决定权留给人。
2. **最小依赖**：bumpp 是一个零配置、零插件的 CLI 工具。对比 semantic-release 需要 5+ 插件和复杂配置，心智负担低一个数量级。
3. **与 Conventional Commits 兼容但不强制**：bumpp 的默认 commit message 是 `chore(release): v...`，但你可以自定义。即使项目没有严格执行 CC，bumpp 也正常工作。
4. **changelogithub 互补**：bumpp 管版本号 + tag，changelogithub 从 tag 间 CC 历史生成 changelog。两个工具各司其职，通过 CI 串联。

## bumpp 进阶用法

### 配置文件 `bump.config.ts`

```ts
import { defineConfig } from 'bumpp'

export default defineConfig({
  // 同时 bump 多个文件
  files: ['package.json', 'jsr.json', 'deno.json'],

  // 自定义 commit message
  commit: 'release: v%s',

  // 自定义 tag name
  tag: 'v%s',

  // push 到指定 remote
  push: true,

  // 全部 yes（跳过确认）
  all: process.env.CI === 'true',

  // 预发布 id
  preid: 'beta',
})
```

### Monorepo 递归

```bash
# 递归 bump 所有 workspace 包
npx bumpp --recursive

# 只 bump 指定包
npx bumpp --recursive --filter @scope/pkg-a --filter @scope/pkg-b
```

递归模式下，bumpp 会遍历 `pnpm-workspace.yaml`（或 `package.json` 的 `workspaces`）中的所有包，统一更新版本号。

### `--execute` 钩子的实际用途

```bash
# 场景 1: bump 前先确保构建通过
npx bumpp --execute "pnpm build && pnpm test"

# 场景 2: 生成 changelog 后再 commit
npx bumpp --execute "pnpm changelog"

# 场景 3: 同时发布到多个 registry
npx bumpp --execute "pnpm publish --registry https://registry.npmjs.org"
```

`--execute` 在 bump 之后、commit 之前执行。如果命令失败（非零退出码），bumpp 会中止，不会提交。

### CI 中使用

```yaml
# .github/workflows/release.yml 中使用 bumpp 的替代方案
# 标准做法是把 bump 留给开发者本地执行，CI 只负责 changelog + GitHub Release
# 但如果需要在 CI 中自动 bump（比如定时发布），可以：

- name: Bump version
  run: npx bumpp patch --all --no-push
  # --all: 跳过交互确认
  # --no-push: 在后续步骤中统一 push
```

## changelogithub 互补角色

bumpp 只管版本号和 tag，changelog 生成交给 [changelogithub](https://github.com/antfu/changelogithub)：

```yaml
# CI 中：tag push → 生成 changelog → 创建 GitHub Release
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # 需要完整历史来生成 changelog

      - run: npx changelogithub
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

changelogithub 做的事情：
1. 读取自上一个 tag 以来的所有 CC 格式的 commit
2. 按类型分组（feat → Features, fix → Bug Fixes, etc.）
3. 生成 Markdown changelog
4. 创建 GitHub Release 并附带 changelog

### 配置自定义分组

```ts
// changelogithub.config.ts
import { defineConfig } from 'changelogithub'

export default defineConfig({
  types: {
    feat: { title: '🚀 新功能' },
    fix: { title: '🐛 修复' },
    perf: { title: '⚡ 性能' },
    refactor: { title: '🏗️ 重构' },
    docs: { title: '📚 文档' },
  },
  // 按 scope 分组（monorepo 场景）
  scopeMap: {
    'core': '核心库',
    'cli': '命令行工具',
    'docs': '文档站点',
  },
})
```

## 与 oq 规范的衔接

oq skill 中 release-workflow 参考文档已经包含了 changelogithub 的标准 CI 配置。bumpp 作为版本 bump 的前置步骤，与 changelogithub 的分工如下：

```
开发者本地                     CI (GitHub Actions)
───────────                    ───────────────────
1. 写代码 + CC commit
2. npx bumpp              →    push tag v1.0.0
                                ↓
3. git push              →    npx changelogithub
                                ↓
                              创建 GitHub Release
                              (含自动生成的 changelog)
```

这个流程的核心理念：**发布决策（版本号）由人做，发布执行（changlog + Release）由机器做**。

## 关键教训

### 1. 全自动发布的隐性成本

semantic-release 看起来很理想——commit 即发布。但它的隐性成本在于：
- 团队必须严格遵循 CC 规范，一个错误的 `fix:` 前缀可能触发意外的 major bump
- 调试发布问题需要在 CI 日志中翻找
- 插件生态系统复杂，`@semantic-release/changelog` + `@semantic-release/git` + `@semantic-release/npm` + `@semantic-release/github` 四个插件之间的交互需要理解

对于小团队和个人项目，bumpp 的「交互确认」模式的实际时间成本接近于零（bump 本身只需要 5 秒），但消除了全自动的所有不确定性。

### 2. Monorepo 的版本管理没有银弹

changesets 对 monorepo 的支持最完善（`linked` / `fixed` 包组、内部依赖自动更新），但它引入了一个额外的 changeset 文件层，需要每个 contributor 学习。bumpp 的 `--recursive` 简单粗暴——所有包统一版本号——适合版本号同步的 monorepo（如 Turborepo 的 `internal` 包），但不适合独立版本管理的 monorepo。

### 3. `--execute` 是安全网

很多人在 CI 中发现构建失败时 tag 已经 push 了。bumpp 的 `--execute "pnpm build && pnpm test"` 在 commit 之前验证，构建失败则整个 bump 回滚。这是一个小特性但有大的安全意义。

## 延伸阅读

- bumpp: https://github.com/antfu-collective/bumpp
- changelogithub: https://github.com/antfu/changelogithub
- semantic-release: https://github.com/semantic-release/semantic-release
- release-please: https://github.com/googleapis/release-please
- changesets: https://github.com/changesets/changesets
- Conventional Commits: https://www.conventionalcommits.org/
- Oleksii Popov 的三工具实战对比: https://oleksiipopov.com/blog/npm-release-automation/
