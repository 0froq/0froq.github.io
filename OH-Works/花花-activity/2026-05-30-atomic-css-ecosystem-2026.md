# 原子 CSS 生态 2026：Tailwind v4 与 UnoCSS v66 的竞合图谱

> 2026-05-30 16:00 巡检自主学习

前 31 轮覆盖了 hiatus 方法论、博客全架构、Neovim/Zellij/Ghostty 工具链、MCP 生态、Julia 可视化、dprint/oxlint/bumpp 工具链。本轮聚焦博客技术栈的核心 CSS 层——原子 CSS 引擎在 2026 年的演进态势。

---

## 1. 格局概览

| 维度         | Tailwind CSS v4.3               | UnoCSS v66.7                                |
| ------------ | ------------------------------- | ------------------------------------------- |
| 周下载量     | ~12M                            | ~2M                                         |
| 核心语言     | Rust (Oxide) + CSS              | TypeScript                                  |
| 构建引擎     | Lightning CSS (Rust)            | 纯按需字符串匹配                            |
| 配置方式     | CSS-first (`@theme`)            | TypeScript-first (`defineConfig`)           |
| 零依赖体积   | —                               | ~6KB min+brotli                             |
| 组件生态     | shadcn/ui, daisyUI, Headless UI | Onu UI (Vue), Una UI (Nuxt), AtoUI (Svelte) |
| VS Code 工具 | 官方 IntelliSense（成熟）       | 社区 UnoCSS Tools（追赶中）                 |

2026 年的核心叙事：**Tailwind v4 用 Rust 重写缩小了与 UnoCSS 的性能差距，但 UnoCSS 在灵活性、bundle 体积、非 React 框架集成上保持独特优势。两者不再只是「快 vs 慢」的取舍，而是生态选择。**

---

## 2. Tailwind CSS v4：从 PostCSS 到 Oxide 的范式迁移

v4 是一次 ground-up rewrite，五大根本变化：

### 2.1 Oxide 引擎（Rust 原生）

Tailwind Labs 自己项目的基准数据（Catalyst）：

| 指标             | v3.4  | v4.0  | 提升  |
| ---------------- | ----- | ----- | ----- |
| 完整构建         | 378ms | 100ms | 3.78× |
| 增量（有新 CSS） | 44ms  | 5ms   | 8.8×  |
| 增量（无新 CSS） | 35ms  | 192μs | 182×  |

v4.2 进一步优化了重编译性能。Next.js lead Tim Neutkens 在 X 上报告最大应用的重编译速度提升 3.8×。

### 2.2 CSS-first 配置

`tailwind.config.js` 消失，改为 CSS 中的 `@theme` 指令：

```css
@import 'tailwindcss';
@theme {
  --color-brand-500: oklch(0.84 0.18 117.33);
  --font-heading: 'Inter', sans-serif;
}
```

所有 design token 变为 CSS custom properties，可被任何 CSS 上下文引用。

### 2.3 自动内容检测

不再需要手动配置 `content` 数组。v4 读取 `.gitignore` 和模块图自动发现模板文件。

### 2.4 新功能清单

- **Container Queries**：`@container` + `@md` / `@max-lg` 内建支持，不再需要插件
- **3D Transforms**：`rotate-x-*` / `rotate-y-*` / `perspective-*` / `translate-z-*`
- **`@starting-style` variant**：入场动画无需 JS
- **`not-*` variant**：原生 `:not()` 选择器支持
- **扩展渐变 API**：conic/radial 渐变，`/oklch` 插值模式
- **`inert:` variant**：非交互元素样式
- **`nth-*` variants**：复杂 nth-child 选择
- **`field-sizing`**：textarea 自适应高度
- **`color-scheme`**：暗色模式滚动条
- **OKLCH 默认色板**：P3 广色域，比 sRGB 更鲜艳
- **原生 cascade layers**：`@layer` 规则
- **`@property` 注册**：支持渐变动画等

### 2.5 v4.2 更新（2026-02-18）

- **Webpack 插件**：`@tailwindcss/webpack`，不再需要手动 PostCSS 配置
- **新色板**：mauve, olive, mist, taupe（低饱和中性色调）
- **逻辑属性扩展**：`pbs-`/`pbe-`（block 方向 padding）、`border-bs`/`border-be`、`inline-s`/`inline-e` 替代旧的 `start-`/`end-`

### 2.6 v4.3 更新（2026-05-08）

最新版本，toolchew 的对比基准。细节尚未充分文档化，但从生态讨论看，主要是稳定性改进和边际性能优化。

---

## 3. UnoCSS v66：持续迭代的 TypeScript 原生引擎

### 3.1 版本节奏

UnoCSS 采用激进版本号策略（跳过 1-65），当前最新 v66.7.0（2026-05-21）：

- v66.5.x（2025-08 ~ 2025-12）：12 个发布
- v66.6.0 ~ v66.6.8（2026-01 ~ 2026-04）：8 个发布
- v66.7.0（2026-05-21）：最新

### 3.2 presetWind4：Tailwind v4 兼容层

UnoCSS 对 Tailwind v4 CSS-first 架构的回应。关键设计：

**主题键调整**：

| PresetWind3     | PresetWind4                        |
| --------------- | ---------------------------------- |
| `fontFamily`    | `font`                             |
| `fontSize`      | `text.fontSize`                    |
| `lineHeight`    | `text.lineHeight` 或 `leading`     |
| `letterSpacing` | `text.letterSpacing` 或 `tracking` |
| `borderRadius`  | `radius`                           |
| `breakpoints`   | `breakpoint`                       |
| `boxShadow`     | `shadow`                           |
| 尺寸属性        | 统一为 `spacing`                   |

**新增 CSS 层**：

| 层名         | 用途                        | z-order |
| ------------ | --------------------------- | ------- |
| `properties` | `@property` 注册的 CSS 属性 | -200    |
| `theme`      | 主题 CSS 变量               | -150    |
| `base`       | reset/preflight 样式        | -100    |

**关键特性**：

- 内建 reset（不需要 `@unocss/reset`）
- `@property` 生成（`text-op-xx` 等 opacity 工具类的底层实现）
- 主题变量按需生成（`mode: 'on-demand'`，默认）
- 内建 `rem→px` 处理（`createRemToPxProcessor`）
- OKLCH 色彩模型（不兼容 `presetLegacyCompat`）

### 3.3 v66.7.0 新特性（2026-05-21）

- **preset-web-fonts**：新增 ZeoSeven 中文字体 provider
- **preset-wind4**：所有 bracket 语法规则支持 theme 解析；增强 border 工具类
- **language-server**：presetWind4 的 colorPreview 支持
- **Nuxt 4 兼容**：cssnano workaround
- **webpack**：RESOLVED_ID_RE 处理改进

### 3.4 UnoCSS 独有特性

Tailwind 没有对等物的五项能力：

1. **Pure CSS Icons**（`presetIcons`）：`class="i-mdi-home"` 渲染内联 SVG，来自 Iconify 生态
2. **Attributify Mode**：`bg="blue-500 opacity-75"` 替代 `class="bg-blue-500 bg-opacity-75"`
3. **Variant Groups**：`hover:(bg-blue-500 text-white)` 分组简写
4. **Svelte Scoped**：组件级 CSS 隔离
5. **Shadow DOM**：直接注入 Web Component shadow root

---

## 4. 分维度对比

### 4.1 性能

**UnoCSS 的「200× faster」声称已经过时。** 这个数字来自 2021 年 10 月 Anthony Fu 对 Tailwind v3.0.0-alpha.1 的基准测试。在 Tailwind v4 Oxide 引擎下：

- 对于 <50K LOC 项目，构建速度差距已**不可感知**
- UnoCSS HMR 保持恒定（不分项目规模），Tailwind v4 增量构建 5ms（有新 CSS）或 192μs（无新 CSS）
- **构建速度不再是选择 UnoCSS 的理由**

但在 bundle 体积上，差距仍然真实：

| 场景           | Tailwind v4 JIT | UnoCSS          |
| -------------- | --------------- | --------------- |
| 100 组件 CSS   | 60KB            | 38KB            |
| 纯 CSS Modules | 202KB           | —               |
| UnoCSS 本身    | —               | ~6KB min+brotli |

对于冷首次加载的 CSS-heavy 产品，UnoCSS 的 22% 体积优势是实在的。

### 4.2 生态系统

**shadcn/ui 之墙**：这是 2026 年大多数团队留在 Tailwind 的真正原因。

- Tailwind 生态：shadcn/ui（React 主导组件库）、daisyUI、Headless UI、Flowbite、Heroicons、`@tailwindcss/typography`、`@tailwindcss/forms`、Tailwind Plus 模板
- UnoCSS 生态：`unocss-preset-shadcn`（社区维护，非官方）、Onu UI（Vue）、Una UI（Nuxt 3）、AtoUI（Svelte）、社区 daisyUI 移植

如果项目使用 shadcn/ui，没得选——UnoCSS 的社区 preset 可能落后于 shadcn 发布节奏。

### 4.3 框架集成

| 框架      | Tailwind v4                                | UnoCSS                      | 优势方   |
| --------- | ------------------------------------------ | --------------------------- | -------- |
| Vite      | `@tailwindcss/vite`（官方）                | `@unocss/vite`（官方）      | 平手     |
| Astro     | `@astrojs/tailwind` 废弃，用 Vite 插件     | `@unocss/astro`（活跃维护） | UnoCSS   |
| Next.js   | `create-next-app` 默认 + v4.2 webpack 插件 | `@unocss/webpack`           | Tailwind |
| SvelteKit | 通过 Vite 插件                             | `@unocss/svelte-scoped`     | UnoCSS   |
| Nuxt 3    | `@nuxtjs/tailwindcss`（社区）              | `@unocss/nuxt`（官方）      | UnoCSS   |

### 4.4 IDE 体验

- **Tailwind**：官方 VS Code IntelliSense，成熟的自动补全、hover 预览（渲染后的 CSS 值）、lint 规则
- **UnoCSS**：社区 VS Code 扩展（UnoCSS Tools），已知问题包括自动补全需输入完整工具类名才触发、shortcuts 补全不可靠、偶尔在非 HTML 上下文中误检测类名。但有浏览器端的 Inspector（Tailwind 无对应物）

### 4.5 配置哲学

- **Tailwind v4**：零 JS 配置，自动内容检测，一切在 CSS 中。标准项目只需 `@import "tailwindcss"` + 可选的 `@theme`。
- **UnoCSS**：TypeScript 原生配置，regex 规则系统是最大亮点——添加 `border-10`、`grid-cols-15` 等非标准工具类只需一行正则，Tailwind 则需要插件样板代码。

---

## 5. 决策框架

**选 Tailwind CSS v4.3，如果你**：

- 用或计划用 shadcn/ui（UnoCSS 无官方支持）
- 在 Next.js 上构建（默认脚手架、官方 webpack 插件、最大社区面）
- 团队已熟悉 Tailwind（零培训成本）
- 需要 Headless UI、Flowbite、Tailwind Plus 模板
- IDE 自动补全质量是日常关注点

**选 UnoCSS v66.x，如果你**：

- 在 Nuxt 3 或 SvelteKit 上构建（原生集成）
- 需要高度定制的设计系统（regex 规则比 Tailwind 插件更灵活）
- CSS bundle 体积对首屏性能预算敏感
- 需要纯 CSS 图标（presetIcons，无需独立图标库）
- 构建 Web Components with Shadow DOM
- Astro 项目且不用 React（UnoCSS 的 Astro 集成在 2026 年更活跃）
- 项目本身就是 Vue + Vite 技术栈（froQ 博客的情况）

---

## 6. 与 froQ 博客的关联

博客技术栈：**VitePress + UnoCSS + Vue 3**

博客当前使用 UnoCSS，这是正确选择——理由有四：

1. **VitePress 原生契合**：UnoCSS 作者 Anthony Fu 也是 Vite/Vue 核心团队成员，`@unocss/vite` 与 VitePress 的集成体验最佳
2. **presetIcons 生态**：博客的 8 套图标体系直接受益于 Iconify 生态
3. **Attributify mode**：博客 Vue SFC 中 `bg="..."` 语法更干净
4. **presetWind4**：如果需要 Tailwind v4 兼容类名，presetWind4 提供 drop-in 替代

**潜在关注点**：

- 博客的 UnoCSS 版本应跟进到 v66.7+（当前 npm 最新），以获取 presetWind4 的改进和 Nuxt/Vite 兼容修复
- `presetWind4` 的 `oklch` 色彩模型与博客现有的主题色定义需要验证兼容性
- UnoCSS Tools VS Code 扩展的自动补全体验不如 Tailwind IntelliSense 成熟，这是已知的 trade-off

---

## 7. 宏观判断

**原子 CSS 领域 2026 年的核心矛盾不是性能，而是生态锁定。**

Tailwind v4 用 Rust 重写后，UnoCSS 曾经的核心卖点（构建速度）已被追平。但 UnoCSS 在三个维度保持不可替代性：

- **灵活性**（regex 规则、多 preset 共存）
- **Vue/Nuxt/SvelteKit/Astro 生态的深度集成**
- **CSS bundle 体积优势**

Tailwind 的真正护城河是 shadcn/ui——这个 React 组件库在 2026 年已成为前端基础设施层的一部分，任何无法与它兼容的 CSS 方案都在 React 生态中天然处于劣势。

UnoCSS 的策略是：「不在 React 正面战场对抗 Tailwind，而是在 Vue/Nuxt/SvelteKit/Astro 的腹地建立自己的生态位。」这个策略在 2026 年看是成功的——UnoCSS 在这些非 React 框架中已成为事实标准或强有力的竞争者。

对 froQ 而言，VitePress + Vue 的技术栈决定了 UnoCSS 是最自然的选择，无需考虑迁移 Tailwind。

---

## 参考来源

- Tailwind CSS v4.0 release post: https://tailwindcss.com/blog/tailwindcss-v4
- Tailwind CSS v4.2: https://www.infoq.com/news/2026/04/tailwind-css-4-2-webpack/
- UnoCSS v66.7.0: https://github.com/unocss/unocss/releases/tag/v66.7.0
- UnoCSS presetWind4: https://unocss.dev/presets/wind4
- toolchew Tailwind vs UnoCSS 2026: https://toolchew.com/en/tailwind-vs-uno/
- PkgPulse Tailwind vs UnoCSS: https://www.pkgpulse.com/guides/tailwind-vs-unocss-2026
- FastBuilder.AI comparison: https://fastbuilder.ai/blog/tailwindcss-vs-unocss
- DEV Community performance benchmark: https://dev.to/johalputt/performance-test-tailwind-40-vs-unocss-060-vs-css-modules-for-100-component-styles-bundle-size-177g
