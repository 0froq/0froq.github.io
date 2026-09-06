# Nuxt 4 迁移上下文 — 2026-08-27

> 巡检发现：用户博客项目 froQ 已从 VitePress 迁移到 Nuxt 4。
> 此前的长期记忆与活动笔记大量基于 VitePress 生态（vitepress-2-alpha-18 等），
> 本笔记记录这次技术栈切换，之后对话应以 Nuxt 4 为准。

## 迁移事实

- 最新提交 `1270dd8 feat(nuxt): ship froQ site on Nuxt 4 with paper/ink UI`
- 跟进修复 `e0277b2 fix(nuxt): harden board assets and prerender for Pages deploy`
- `docs/.vitepress/` 目录已被移除
- 目标部署：Cloudflare Pages（含 `CNAME`、`_routes.json` 风格的 prerender 硬化）
- 旧技术栈 VitePress 2 生态跟踪（alpha.18 → Vue 3.6 rc 链）到此画上句点，不再适用当前源码

## 新架构

- **框架**：Nuxt 4 + Nuxt Content，markdown 在 `docs/posts` 与 `docs/corpus`
- **UI 语言**：paper / ink 设计（EB Garamond + CJK fallback，Instrument Sans 变量字体）
- **样式**：UnoCSS（`@unocss/nuxt` + extractor-mdc）
- **内容模型**：`content.config.ts`（@nuxt/content 4 schema）；面板/场景用 `docs/scraps.toml`
- **图片处理**：`nuxt.config.ts` 自定义递归 walk 挂载 content 图片资产目录（`*-assets` 约定）
- **服务端**：`server/`；配套 Cloudflare worker 在 `workers/froq-api`（`api.froq.me`，用于 emoji 反应等）
- **产品定位**（PRODUCT.md）：主页首页为安静签名页 + 左边 intro（froQ SVG + 散文），右侧留白放 section 入口；下方 sticky scrapboard（碎碎念）。Dashboard 尚未迁移（"show an honest empty desk"）。Voice：精确、微讽、不over-explain。

## 测试栈

- `vitest.config.ts`（vitest + happy-dom + globals + setup.ts）
- `tests/` 已有 `annotationFingerprint.test.ts`——从旧 VitePress theme 带过来的 annotation 指纹测试
- `test/` 目录为空占位
- `dist/`、`build/` 生成物未提交（`?? dist`）

## 隐患标注（待用户确认）

1. **vitest alias 陈旧**：`vitest.config.ts` 里
   `'~': docs/.vitepress/theme` 与 `'@': docs/.vitepress/theme/components`
   仍指向**已删除的** `docs/.vitepress`（目录不存在）。
2. **坏 import**：`tests/annotationFingerprint.test.ts`：
   - `import ... from '~/types/annotation'`
   - `import ... from '~/utils/annotationFingerprint'`
   这两个模块全项目均不存在——`computeAnchor`/`findAnchorInDOM`、
   `AnnotationAnchor` 类型没能跟随迁移。若源码在 `app/` 下有对应实现，alias 需改到
   Nuxt 4 的实际路径（`app/`）；若模块已废弃，测试文件应与旧 theme 一并清理。
   结论：当前 `vitest run` 会因解析失败而报红。

> 备注：若该测试对应的注解锚定功能在 Nuxt 版本里另换了实现（比如移到 app/utils 不同命名），
> 只需修正 alias 指向，无需删除测试，取舍由蛙判断。

## 待办呼应（Rune / inbox，01:00–01:07 轮）

inbox 自动化正常：全库 8 页 Notion captures，无 08-26/08-27 日期页，
08-25 StyleX 碎片仍以 `neo-inbox-2026-08-25.md` 为准；本轮 0 新增碎片、0 状态转移、无 outbox 推送。
无异常。