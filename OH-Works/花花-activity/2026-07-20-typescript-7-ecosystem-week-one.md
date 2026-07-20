# TypeScript 7.0 生态系统一周回顾（2026-07-20）

> 基于 Digital Applied 07-16 发布的深度分析，结合 Microsoft GA 公告、typescript-eslint 社区回应及各框架适配状态综合整理。

## 核心结论

**编译器稳定，生态系统断裂。** TS 7.0 的 Go 原生编译器本身没有出现阻塞级 regression，但工具链生态在多个承重环节明确断裂。

## 关键时间线

- 2026-07-08: TypeScript 7.0 GA（Go 原生端口，Project Corsa）
- 2026-07-16: 本篇分析的观察截止日

## 生态系统就绪状态

### ✅ 可直接迁移
| 层级 | 状态 | 说明 |
|------|------|------|
| **tsc** | 就绪 | 配置迁移工作：TS 6.0 deprecations 现为硬错误，默认值变更 |
| **esbuild** | 就绪 | 不依赖 TypeScript API，完全不受影响 |
| **Visual Studio (IDE)** | 就绪 | Insiders 3 构建已自动检测工作区启用 TS7 |
| **tsdown** | 部分就绪 | `--isolatedDeclarations` 时需要 `@typescript/typescript6` 兼容包 |

### ⚠️ 有变通方案
| 层级 | 状态 | 说明 |
|------|------|------|
| **VS Code** | 部分 | 需要 Marketplace 扩展；内置原生支持在 GA 一周后仍未发布 |
| **Angular** | 部分 | CLI type-checking (`tsc`) 可用 TS7，编辑器和模板诊断仍用 TS6 |

### ❌ 阻塞
| 层级 | 状态 | 预计解封 |
|------|------|----------|
| **typescript-eslint** | 阻塞 | **无承诺时间线**。支持范围 `>=4.8.4 <6.1.0`，GA 当日 #12518 被关闭为 "not planned"。一周后的改进提案只是一个更清晰的错误提示，而非兼容性修复 |
| **ESLint 核心仓库** | 阻塞 | eslint/eslint、eslint/rewrite、eslint/js 都等待 typescript-eslint 先支持 TS7 |
| **Vue / Svelte / MDX（Volar 工具链）** | 阻塞 | 模板类型检查嵌入 TypeScript 程序化 API（TS 7.0 未提供稳定版本） |
| **Astro（astro check、language server）** | 阻塞 | 跟踪讨论自 3 月 16 日开放，4 个月后仍无承诺方案 |

**关键洞察：Volar 工具链（Vue/Svelte）需要 TS 7.1 的稳定程序化 API，预计 ~2026年10月。**

## 性能验证

### Microsoft 基准测试（官方，5 个项目）
| 项目 | TS6 | TS7 | 加速比 |
|------|-----|-----|--------|
| VS Code | 125.7s | 10.6s | 11.9x |
| Sentry | 139.8s | 15.7s | 8.9x |
| Bluesky | 24.3s | 2.8s | 8.7x |
| Playwright | 12.8s | 1.47s | 8.7x |
| tldraw | 11.2s | 1.46s | 7.7x |

### 社区独立报告
- 单个未具名社区项目：45-60s → 4-8s（约 6x-15x，取决于端点）
- **结构盲点：没有人在重度 typescript-eslint 或 Volar 依赖的 monorepo 上测量过 TS7 性能，因为这些环境完全跑不起来。**

### 已知反转
- 浏览器内 WASM type-checking：部分场景比之前的 JS 实现更慢（LogRocket 测试）
- 内存：VS Code 代码库 5.2GB → 4.2GB（-18%），但提升幅度不如速度显著

## 当前推荐的三种运行模式

1. **完整 TS7 迁移**：纯 tsc + bundler 栈（Next.js、React、Node 服务）—— 现在可迁移
2. **拆分设置**：TS7 用于 tsc 项目检查，TS6 固定用于 ESLint —— 使用 Microsoft 的 `@typescript/typescript6` 兼容包提供 `tsc6` 二进制
3. **等待型**：Volar/API 依赖栈 —— 必须等到 TS 7.1（约 10 月）

## 对蛙蛙 blog 项目的影响

蛙蛙的项目使用 VitePress（Vue 技术栈）：
- **VitePress 本身**：VitePress 2.0 alpha.18 基于 Vite + Vue，生产构建通过 Vite bundler，不直接依赖 TypeScript API，理论上可以使用 TS7——但需要验证
- **Vue SFC 类型检查**：依赖 Volar / vue-tsc，Volar 嵌入了 TypeScript 程序化 API，**在 TS 7.1 发布前无法运行 TS7**
- **ESLint**：使用 typescript-eslint 则阻塞。如果使用 ESLint flat config 但不启用类型感知规则，在 `@typescript/typescript6` 兼容包的帮助下有可能运行
- **推荐方案**：短期保持 TS 6.x，等待 TS 7.1（~10 月）再统一迁移。拆分设置在 blog 场景的必要性有限

## 来源

- [TypeScript 7.0 GA Announcement](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/) — Microsoft DevBlogs
- [TypeScript 7 One Week In: Migration Readiness Check](https://www.digitalapplied.com/blog/typescript-7-native-compiler-early-adopter-migration-readiness) — Digital Applied
- [VS Code Team Blog: Iterating faster with TypeScript 7](https://code.visualstudio.com/blogs/2026/06/26/iterating-faster-with-ts-7)
- typescript-eslint #12518 / #12521 / eslint/eslint #21070
- [TypeScript 7.0 Is GA: The 10x Compiler Migration Playbook](https://www.digitalapplied.com/blog/typescript-7-0-ga-native-compiler-migration-playbook-2026)
