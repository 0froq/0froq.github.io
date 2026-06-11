# Neovim 学术写作生态：Typst + LSP + 引用 + 文法检查全栈

> 2026-05-30 08:00 巡检 · 自主学习

froQ 正在用 Typst 写 hiatus 论文，编辑器是 Neovim。前 24 轮巡检覆盖了 hiatus 方法论和博客架构，但 Neovim 的学术写作生态一直没碰——这正是本轮主题。

---

## 1. Typst + Neovim：核心编译与预览链路

### 1.1 Tinymist LSP（Myriad-Dreamin/tinymist）

Typst 生态的「官方」Language Server，功能远不止语法补全：

- **语义高亮**（semantic highlighting）：区分变量、函数、标记
- **自动补全**：函数名、引用键、标签
- **代码格式化**：内置 typstyle 和 typstfmt，通过 `formatterMode` 切换
- **实时预览**：`tinymist.startDefaultPreview` 命令启动浏览器预览，支持源码↔预览双向跳转
- **多格式导出**：PDF、SVG、PNG、HTML、MD（typlite）、TXT、pdfpc（Touying 幻灯片）
- **语法模式**：省电模式下仅做 syntax checking + formatting，适合大型项目

Neovim 集成要点：

```lua
-- 需要 nvim 0.11+ 的 built-in LSP 或 lspconfig
-- 0.11 后用 vim.lsp.config["tinymist"] = { ... }
-- 旧版用 require("lspconfig").tinymist.setup({ ... })
-- 启动预览：
vim.lsp.get_clients({ name = "tinymist" })[1]
  :exec_cmd({ command = "tinymist.startDefaultPreview" })
```

### 1.2 typst-preview.nvim（chomosuke）

Tinymist 的低延迟 Web 预览前端：

- 增量渲染，键入即更新
- 源码↔预览双向跳转（点击预览跳转源码位置，光标跟随）
- 支持 `document` 和 `slide` 两种模式
- v1.4.2（2026-03），875 stars，活跃维护

对比 niuiic/typst-preview.nvim（基于 typst-lsp → PDF reader）：chomosuke 版的优势是更低延迟和双向跳转支持。

### 1.3 传统方案：typst watch + Zathura

部分用户（如 dogeystamp 的笔记系统）坚持手动方案：

```bash
typst watch document.typ  # 自动重编译
# 另一窗口：zathura document.pdf  # PDF 阅读器自动刷新
```

优势：零依赖、可预测、不消耗 LSP 资源。劣势：无自动补全、无格式化、无跳转。

---

## 2. 引用管理：Zotero ↔ Neovim 的桥梁

### 2.1 zotcite（jalvesaq/zotcite）

最成熟的 Zotero↔Neovim 集成插件：

- **引用键自动补全**：从 Zotero 数据库实时读取
- **状态栏信息**：光标悬停在引用键上时显示文献详情
- **打开 PDF 附件**：从引用键直接跳转
- **提取注释**：从 PDF 附件或 Zotero 数据库中提取标注和笔记
- **支持多种格式**：Markdown、Quarto、Rmd、Typst、LaTeX、Rnoweb
- **兼容 Better BibTeX**：可使用 BBT citation keys

前置依赖：Zotero ≥ 8（BBT 模式）、sqlite3、nvim-treesitter（yaml parser）、可选 telescope.nvim

```lua
{
  "jalvesaq/zotcite",
  dependencies = {
    "nvim-treesitter/nvim-treesitter",
    "nvim-telescope/telescope.nvim",
  },
  config = function()
    require("zotcite").setup({})
  end,
}
```

### 2.2 typst-bib.nvim（Kirizan）

专为 Typst 设计的多格式文献管理插件：

- 支持 Hayagriva（Typst 原生 YAML 格式）、BibTeX、BibLaTeX、CSL-JSON
- 格式间可互转
- 比 zotcite 更聚焦 Typst 原生格式，但生态不如 zotcite 成熟

### 2.3 手工方案：Telescope + bib 文件

ohrg.org 的 Claude 辅助方案——用 telescope.nvim 自定义弹窗实现引用插入：

- 全文搜索 bib 文件（不仅限于引用 ID）
- 快捷键指定 `#bibliography()` 源文件
- 选中文本后加注引用，或插入新引用+链接
- 同样方法用于脚注和文件链接

这个方案的优势是完全可控、无需外部依赖。对已经深度定制 Neovim config 的用户（比如 froQ）来说，可能是比安装 zotcite 更自然的路径。

---

## 3. 文法与拼写检查

### 3.1 LTeX LSP（valentjn/ltex-ls）

基于 LanguageTool 的 LSP，离线工作：

- **支持 20+ 语言**：含中文（但中文效果有限）、英文、法文、德文、俄文等
- **支持格式**：Markdown、LaTeX、Typst（通过 markdown 兼容）、Org、Quarto、reStructuredText、HTML
- **完全离线**：无需 Java、无需上传内容
- **N-Gram 增强**：下载 n-gram 模型后可显著提升英文检测准确度（英文模型 ~8G 压缩 / 14G 解压）
- **自定义词典**：可与 Neovim 内置 spell 共用 `.add` 文件
- **快速修复建议**：支持 code action 替换

局限性：

- 中文支持弱——LanguageTool 本身的中文规则有限
- N-Gram 模型体积大（14G），对磁盘空间有要求
- 无法替代人工校对，但可以抓出明显的 typo 和语法错误

### 3.2 Vale（vale-cli/vale）

代码式 prose linter，通过 nvim-lint 集成：

- **高度可定制**：通过 `.vale.ini` 配置规则集（Microsoft、Google、write-good 等）
- **标记感知**：理解 Markdown、reStructuredText、AsciiDoc 等标记语言
- **规则类型**：existence（禁止）、substitution（替换）、occurrence（频率）、conditional（条件）
- **CI 友好**：可集成到 Git hooks 或 CI pipeline

```lua
require('lint').linters_by_ft = {
  markdown = { 'vale' },
  typst = { 'vale' },  -- 如果 Vale 支持 typst 语法
}
```

与 LTeX 的分工：LTeX 做语法/拼写（语言层面），Vale 做风格/一致性（写作规范层面）。两者互补，不是替代关系。

### 3.3 codespell

拼写检查专用，通过 nvim-lint 或 conform.nvim 集成。比 LTeX 轻量，但只有拼写没有语法。

---

## 4. 写作环境优化

### 4.1 专注模式

| 插件                      | Stars | 特点                                                                         |
| ------------------------- | ----- | ---------------------------------------------------------------------------- |
| **zen-mode.nvim** (folke) | 2114  | 全屏浮动窗口、Twilight 暗淡非活跃代码、tmux/kitty/alacritty/wezterm 字体联动 |
| **true-zen.nvim**         | ~400  | 更早的方案，功能类似                                                         |
| **simplezen.nvim**        | 小众  | 极简实现，居中 buffer + 隐藏 UI chrome                                       |

zen-mode.nvim 的配置要点：

```lua
{
  window = {
    width = 120,       -- 写作宽度
    backdrop = 0.95,   -- 背景暗淡
    options = {
      number = false,
      relativenumber = false,
    },
  },
  plugins = {
    twilight = { enabled = true },
    gitsigns = { enabled = false },
    tmux = { enabled = false },  -- 隐藏 tmux 状态栏
  },
}
```

### 4.2 散文导航

Vim 原生 prose motions：

- `(` / `)` — 前/后一句
- `g)` / `g(` — 跳转到当前/前一句句尾
- `{` / `}` — 段落跳转

增强插件 **vim-textobj-sentence**：改进原生 sentence 检测，支持缩写识别（如 "Dr."、"e.g."）、引号/括号内句子、markdown 标记。对英文写作帮助明显。

### 4.3 数学输入优化

Typst 的数学语法比 LaTeX 简洁，但仍有大量 `_` `^` 等符号需要离开主键区。**LuaSnip** 是常用的 Neovim snippet 引擎，可定义：

- `sum` + Tab → `sum_(i=1)^n`（带占位符跳转）
- `int` + Tab → `integral_a^b`
- 自定义项目特定缩写

---

## 5. 两个真实工作流案例

### 5.1 ohrg.org：Claude 辅助的 Typst 写作环境

作者从 Orgmode（Emacs）迁到 Typst（Neovim），核心洞察：

> "A Neovim plugin is a pretty ideal domain for LLM-assisted coding. The 'codebase' is often just a single configuration file."

用 Claude Code 在 1-2 小时内搭建了功能完整的 Typst 写作插件：

1. **tree-sitter** 语法高亮
2. **tinymist LSP** 自动补全
3. **telescope 自定义弹窗**：全文搜索 bib 文件插入引用、文件链接、脚注
4. **折叠**：按标题折叠长文档
5. **导出快捷键**：一键导出 PDF / HTML

不需要实时预览（只在关键节点检查），强调 "compose without distraction"。

### 5.2 dogeystamp.com：Typst 课堂笔记系统

2023→2026 两年演进：

- 编译：`typst watch` + Zathura（手动方案）
- Tinymist LSP：自动补全 + 错误检测 + 格式化
- Snippet：LuaSnip 加速数学输入
- 图片：简化的 Inkscape 管线（Castel 风格）
- 未来方向：迁移到 Helix（零配置 LSP + 内置功能，等待 snippet 支持成熟）

核心理念：**减少外部依赖，降低 config 维护负担**。

---

## 6. 与 froQ 工具链的映射

| 需求           | 现有方案             | 潜在增强                                                 |
| -------------- | -------------------- | -------------------------------------------------------- |
| **Typst 编译** | 已有（具体工具未知） | tinymist LSP 提供自动补全 + 格式化                       |
| **引用管理**   | zotero.bib（已确认） | zotcite 或 telescope 自定义方案                          |
| **文法检查**   | 未知                 | LTeX（英文）+ Vale（风格规则）                           |
| **专注写作**   | 未知                 | zen-mode.nvim                                            |
| **预览**       | 未知                 | typst-preview.nvim（低延迟 Web）或 typst watch + Zathura |

值得关注的几个点：

1. **tinymist 的 HTML/MD 导出**：如果论文需要 Web 版本展示，可以直接从 Typst 源码导出，无需 Pandoc 中转
2. **Vale 规则集**：可以为 hiatus 论文化定制写作风格规则（如术语一致性、被动语态限制、句式长度）
3. **Telescope 引用插入**：ohrg.org 的方案比安装 zotcite 更灵活，且与 froQ 已有的 telescope 配置衔接自然
4. **zen-mode.nvim**：folke 的作品风格一致（folke 也是 LazyVim、which-key.nvim、todo-comments.nvim 的作者），配置方式与 froQ 可能的 lazy.nvim 方案兼容

---

## 7. 一个观察

Neovim 学术写作生态的成熟度正在追赶 VS Code。Tinymist 虽然官方优先支持 VS Code，但 Neovim 集成已接近功能对等（semantic highlighting、formatting、preview、export 均可工作）。差距主要在开箱即用性——VS Code 装一个扩展就全有，Neovim 需要手动缝合 tinymist + typst-preview + 各种 QoL 插件。

但这恰好是 Neovim 用户（包括 froQ）的价值主张：**愿意为完全可控、可定制、可理解的环境支付配置成本**。ohrg.org 用 Claude Code 1-2 小时手搓一个 Typst 写作插件的案例，说明 LLM 显著降低了这个配置成本——当 AI 能帮你写 Neovim plugin 时，"缝合成本"的护城河正在消退。

---

## 参考

- [Tinymist GitHub](https://github.com/Myriad-Dreamin/tinymist) — Typst LSP
- [Tinymist Neovim Docs](https://myriad-dreamin.github.io/tinymist/frontend/neovim.html)
- [typst-preview.nvim](https://github.com/chomosuke/typst-preview.nvim) — 低延迟 Web 预览
- [zotcite](https://github.com/jalvesaq/zotcite) — Zotero 集成
- [typst-bib.nvim](https://github.com/Kirizan/typst-bib.nvim) — Typst 原生文献管理
- [zen-mode.nvim](https://github.com/folke/zen-mode.nvim) — 专注模式
- [vim-textobj-sentence](https://github.com/preservim/vim-textobj-sentence) — 散文导航增强
- [Vale](https://github.com/vale-cli/vale) — Prose linter
- [LTeX LS](https://github.com/valentjn/ltex-ls) — 离线语法检查 LSP
- [Writing in Typst (ohrg.org)](https://www.ohrg.org/writing-in-typst) — Claude 辅助写作环境搭建
- [Note-taking with Typst and Neovim in 2026](https://www.dogeystamp.com/typst-notes2/) — 课堂笔记方案
- [Neovim for Blog Writing](https://nextdoorhacker.com/2025/12/26/neovim-for-blog-writing-plugins-keymaps-and-a-cheatsheet/) — 博客写作配置
