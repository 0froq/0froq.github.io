# 博客 Data Layer 完整架构分析

## 概览

博客的数据层由 9 个 data loader 组成，底层采用两种不同的 VitePress loader 模式，数据源分布在 markdown 内容文件和 dashboard YAML 文件中。

## 两种 Loader 模式

### 1. `createContentLoader`（VitePress 内置）

用于读取和渲染 markdown 文件，自动处理 frontmatter、HTML 渲染、摘要提取。

- **posts.data.ts**：`posts/**/!(index).md` → 文章列表，按创建时间倒序
- **corpus.data.ts**：`corpus/!(_template)/!(index).md` → corpus 条目列表，按创建时间倒序
- **tags.data.ts**：从构建时生成的 `tags.json` 读取标签列表（构建时由 `scripts/generate-tags.mjs` 生成）

### 2. `defineLoader`（文件监听型）

用于监听 YAML 文件变更，在文件改变时重新加载数据。

- **board.data.ts**：`docs/dashboard/board.yml` → 主面板（active/done/backlog 三列）
- **backlog.data.ts**：`docs/dashboard/monthBacklogs/*.yml` → 月度 backlog，按月份倒序
- **day.data.ts**：`docs/dashboard/dayTodos/*.yml` → 每日任务记录，按日期倒序
- **week.data.ts**：`docs/dashboard/weekTasks/*.yml` → 每周任务看板（含四象限 legacy 兼容）
- **vision.data.ts**：`docs/dashboard/visions/global.yml` + `year-*.yml` → 长期愿景（全局 + 年度）
- **hints.data.ts**：`docs/dashboard/hints/fence.yml` + `tip.yml` → 行为提示（fence 约束 / tip 建议）

## 数据源：Dashboard YAML 体系

```
docs/dashboard/
├── board.yml              # 主面板：active / done / backlog
├── dayTodos/              # 每日任务（28 个文件，2026-03-22 至今）
├── weekTasks/             # 每周任务（9 个文件，以周一起始日期命名）
├── monthBacklogs/         # 月度 backlog（3 个文件，2026-03~05）
├── visions/               # 长期愿景
│   ├── global.yml         # 全局愿景（全职开源、独立开发者、设计键盘、旅居）
│   └── year-2026.yml      # 年度目标（50-100 GitHub Stars、完成论文并发表）
├── hints/                 # 行为提示
│   ├── fence.yml          # 硬约束/边界规则
│   └── tip.yml            # 软建议/提示
└── advisor/               # AI advisor 上下文
    ├── context.md         # 滚动更新的当前状态（论文进展、近期变更、待解决）
    ├── hard.md            # 硬性上下文（身份、作息、长期项目）
    └── 2026-*-start|end.md  # 每日 start/end 总结（20 个文件）
```

### board.yml 任务状态模型

任务分三列：
- **active**：当前进行中，状态为 inProgress / notStarted
- **done**：已完成，含 completed 时间戳
- **backlog**：待评估，不在此迭代中

任务属性：title、status、priority（high/medium/low）、dod（definition of done）、notes（含 url 支持）、tags、since、completed。

### 规划系统简化的痕迹

AGENTS.md 提到「规划系统简化」任务（已于 05-28 完成），方向是从多层 YAML + advisor 体系 → 滚动 board.yml + 单一 context.md。但当前代码显示 dayTodos/weekTasks/monthBacklogs 仍存在并配有 data loader，说明迁移是渐进式的：board.yml 已作为主面板存在，旧数据源保留供历史查阅。

## 类型系统

所有类型定义集中在 `docs/.vitepress/theme/types/`：

| 文件 | 内容 |
|------|------|
| dashboard.ts | BoardTask、DayTask、WeekTask、BacklogItem、VisionItem、HintItem 等任务类型 |
| content.ts | CorpusData、PostsData、TagsData 等内容类型 |
| nav.ts | NavItem、ContentNavItem、RouteI18n 等导航和 i18n 类型 |
| activity.ts | 活动相关类型（自主活动记录等） |
| plotly.ts | Plotly 图表配置类型 |
| lakeTemperature.ts | 湖温数据专用类型 |

## 跨领域工具函数

`docs/.vitepress/theme/utils/`：

| 文件 | 功能 |
|------|------|
| usePostUtils.ts | 阅读时间计算（中文 400 字/分、英文 225 词/分、代码块 1 块/分）、标签层级展开（`a/b/c` → `{a, a/b, a/b/c}`）、分类标准化 |
| useRouteI18n.ts | 路由级别的国际化路径处理 |
| useTagUtils.ts | 标签过滤和层级导航逻辑 |
| useStringOperation.ts | 字符串操作工具 |
| toChineseNumber.ts | 阿拉伯数字 → 中文数字转换（年份用） |
| chartTheme.ts | Plotly 图表主题配置 |
| contentNav.ts | 内容导航树构建 |
| deepMerge.ts | 深度合并对象 |
| renderMdInline.ts | 行内 Markdown 渲染 |
| statistics/ | 统计相关工具 |

## 数据流

```
YAML 文件（源码）                    Markdown 文件（源码）
     │                                     │
     ▼                                     ▼
defineLoader() watch             createContentLoader() glob
     │                                     │
     ├─ board.data.ts                      ├─ posts.data.ts
     ├─ backlog.data.ts                    ├─ corpus.data.ts
     ├─ day.data.ts                        │
     ├─ week.data.ts                       │
     ├─ vision.data.ts                     │
     └─ hints.data.ts                      │
     │                                     │
     ▼                                     ▼
  Dashboard 数据                      Content 数据
     │                                     │
     └──────────────┬──────────────────────┘
                    ▼
           Theme Components
           (useData() / import { data })
                    │
                    ▼
              Layout.vue
           ┌─────┼─────┐
     PageHeader PageContent PageFooter
```

## 架构特征

1. **构建时与运行时的分层**：`scripts/generate-tags.mjs` 在 `vitepress dev/build` 前运行，生成 `tags.json`，再由 `tags.data.ts` 在运行时读取。这种模式把重型标签提取放在构建时，运行时只需轻量读取。

2. **YAML 作为数据源**：所有非内容型数据使用 YAML 而非 markdown frontmatter。YAML 更适合作结构化配置，比 TOML/JSON 更可读，比 markdown frontmatter 更适合嵌套结构。

3. **渐进式迁移**：board.yml 已作为新主面板存在，但旧的 dayTodos/weekTasks/monthBacklogs data loaders 仍保留。`week.data.ts` 中的 `safeWeekData()` 函数包含 quadrants legacy 兼容逻辑（四象限→平铺 tasks）。

4. **中英双语支持**：vision 和 hints 数据通过 `locale` 字段区分 zh/en，data loader 按 locale 分组输出，前端通过 i18n 切换显示。

5. **类型安全**：所有 data loader 都导出了明确的 TypeScript 类型声明（`declare const data: X`），确保消费端类型正确。

## 与 VitePress 默认方案的差异

VitePress 默认的 data loading 主要通过 `createContentLoader` 处理 markdown 内容。本项目扩展了两种模式：
- 自定义 `defineLoader` + YAML 处理更复杂的结构化数据
- 构建时脚本 + 运行时 loader 的混合模式（tags）
