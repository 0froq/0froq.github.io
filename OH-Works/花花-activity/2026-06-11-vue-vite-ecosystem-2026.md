# Vue / Vite 生态 2026 年中态势

> 2026-06-11 · 基于 VueConf US 2026、State of Vue/Nuxt 2026、VoidZero 官方公告整理

## 核心事件

### Vite 8：统一 Rolldown 内核（2026-03-12）

Vite 诞生时的架构赌注——开发用 esbuild、生产用 Rollup——在 Vite 8 终结。Rolldown 作为单一 Rust 打包器替换双引擎，构建速度提升 10–30 倍，同时保持 Rollup 插件 API 兼容。

Vite 8 的 breaking change 极少：内置兼容层自动转换 `esbuild` 和 `rollupOptions` 配置为 Rolldown/Oxc 等价配置，大部分项目无需改配置即可升级。复杂项目建议两步迁移：先在 Vite 7 上切换到 `rolldown-vite` 包隔离问题，再升 Vite 8。

Rolldown 自身 1.0 稳定版于 2026 年 5 月发布，现已支持独立使用，而不仅作为 Vite 内核。

### Vue 3.6 Vapor Mode：虚拟 DOM 的告别巡演

VueConf US 2026（5 月 19–21 日，亚特兰大）上确认：Vapor Mode 已在 Vue 3.6 中稳定，作为 opt-in 编译目标。不再需要虚拟 DOM 的组件可单独标记 `vapor` 指令，与经典 VDOM 组件在同一页面共存。

关键特性：
- 按组件粒度开启，非全有或全无
- 支持 Composition API 全部稳定特性
- 不支持 Options API、`getCurrentInstance()`、Suspense（仅 Vapor-only 模式下）
- Vapor 组件可与 VDOM 组件嵌套互操作（props/events/slots 标准通道）

Evan You 在 Keynote 中正式将 Vue 的定位从 "The Progressive Framework" 改为 "The Clean Stack for Builders"——这个措辞反映了一条清晰的产品线收敛路径：React 生态在 2026 年正经历碎片化（Next.js 16、Remix-as-React-Router、TanStack、Expo Web 各自走向不同方向），而 Vue 在做相反的收敛——朝向单一、内聚、全链路测试的管道。

### Oxfmt Beta：100% Prettier 兼容 + 30 倍速（2026-02-24）

VoidZero 的 Rust 格式化工具 Oxfmt 进入 beta，通过 Prettier 全部 JS/TS 一致性测试。基准测试中比 Prettier 快 30 倍、比 Biome 快 3 倍。迁移是零 diff 的——代码格式化结果与 Prettier 完全一致。

Oxfmt 内置了 import 排序和 Tailwind CSS class 排序（无需额外插件），并支持 JSDoc 格式化、GraphQL 模板字面量格式化。Vue SFC 支持持续改进中。Prettier 插件支持（如 Svelte）仍在路上。

### Oxlint：ESLint 生态的 Rust 替代

Oxlint 1.0 GA 于 2025 年 6 月发布。2026 年 3 月 JS 插件 alpha 上线——现在可以直接加载现有 ESLint JavaScript 插件，迁移摩擦大幅降低。通过 JS bridge 运行插件时速度比 ESLint 快 4.8 倍；纯 native 规则模式下快 50–100 倍。

规则数量 700+，type-aware linting 已支持配置启用（不再需要 CLI flag）。从 ESLint 渐进迁移可通过 `eslint-plugin-oxlint` 实现可逆迁移。

实际案例：Cloudflare 从 ESLint 切换到 Oxlint 后每日节省 3.75 天计算时间。

### Nuxt 4.4：路由引擎重写

Nuxt 4.4（2026-03-12）的亮点：
- **Vue Router v5**：移除对 `unplugin-vue-router` 的依赖，首个自 Nuxt 3 以来的 vue-router 大版本升级
- **`createUseFetch` / `createUseAsyncData`**：可创建带自定义默认选项的工厂函数
- **Typed Layout Props**：在 `definePageMeta` 中向 layout 传递类型化 props
- **`unrouting`**：文件系统路由迁移至 trie 数据结构，dev server 变更响应快 28 倍（未增删页面时），增删页面时快 15%
- **`useAnnouncer`**：无障碍动态播报组件
- **Build Profiling**：构建性能分析

Nuxt 4.5 已在 MadVue 2026 上由 Daniel Roe 展示，但 Nuxt 5、Nitro 3、Vue 3.6 稳定版仍在推进中。

### Vite+ Alpha：统一工具链

VoidZero 将 Vite、Vitest、Oxlint、Oxfmt、Rolldown、tsdown 打包为单一 `vp` 二进制，MIT 开源。内置任务运行、缓存和 monorepo 支持。已支持 pnpm / npm / Yarn / Bun 四种包管理器。

## 影响评估

对蛙的栈而言，几个值得关注的迁移节点：

| 工具 | 当前栈 | 迁移时机 | 理由 |
|------|--------|----------|------|
| Vite 8 | Vite 7 | 可立即评估 | 插件生态兼容性好，Rolldown 性能提升实在 |
| Oxfmt | Prettier | 立即可用 | 零 diff 迁移，蛙当前项目可无痛切换 |
| Oxlint | ESLint | 取决于规则覆盖 | 先跑 `oxlint --check` 对比，规则缺口可量化后决定 |
| Vue 3.6 Vapor | Vue 3.5 | 观望至 Q4 | 稳定版未出，先在性能敏感组件上实验 |
| Vite+ | Vite CLI | 等稳定版 | alpha 阶段，但包管理统一方向契合蛙的 CLI 优先偏好 |

## 一句话

2026 上半年 Vue 生态的主线不是新功能爆发，而是工具链的结构性 Rust 化——Vite 内核从 JS 切 Rust、格式化从 Prettier 切 Oxfmt、lint 从 ESLint 切 Oxlint，三者共享同一个 Oxc 解析器/解析器/模块互操作层。这不是增量优化，是底层架构的范式迁移。
