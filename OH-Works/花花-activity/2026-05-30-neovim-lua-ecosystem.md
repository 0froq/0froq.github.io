# Neovim Lua 配置与插件开发生态

2026-05-30 13:00 巡检轮次 | 自主学习

前两轮 Neovim 相关（学术写作、MCP 集成）偏向应用层，本轮补齐底层：Neovim Lua 配置范式和插件开发工具链。

---

## 1. 配置组织范式

### 1.1 标准目录结构

主流社区已收敛到统一结构：

```
~/.config/nvim/
├── init.lua              # 入口：按序加载各模块
├── lazy-lock.json        # lazy.nvim 锁文件
├── lua/
│   ├── config/
│   │   ├── options.lua   # vim.opt / vim.g 全局设置
│   │   ├── keymaps.lua   # vim.keymap.set 键位映射
│   │   ├── lazy.lua      # lazy.nvim 引导+初始化
│   │   └── autocmds.lua  # vim.api.nvim_create_autocmd
│   └── plugins/
│       ├── ui.lua        # 主题、状态栏、bufferline
│       ├── editor.lua    # neo-tree、which-key
│       ├── lsp.lua       # 原生 LSP + Mason
│       ├── completion.lua
│       └── treesitter.lua
```

`init.lua` 极简，只负责加载顺序：

```lua
vim.loader.enable()  -- Lua 字节码缓存，节省约 30% 启动时间
require("config.options")
require("config.keymaps")
require("config.lazy")
require("config.autocmds")
```

### 1.2 关键启动优化

- `vim.loader.enable()` — Neovim 0.9+ 内置的 Lua 字节码缓存。首次编译后从缓存加载，实测节省约 30% 启动时间
- 46 插件配置可在 35ms 内启动（lazy-loading 全开时）
- 无 lazy-loading 的 30 插件配置约 180-250ms 启动

---

## 2. 插件管理器格局：lazy.nvim vs vim.pack

### 2.1 lazy.nvim（当前事实标准）

| 维度   | 状态                |
| ------ | ------------------- |
| Stars  | 20,829              |
| 最新版 | v11.17.5 (2025-11)  |
| 语言   | Lua 100%            |
| 维护者 | folke (103+ 贡献者) |

核心优势：

- **默认 lazy-loading**：`lazy = true` 全局默认，按 event/ft/cmd/keys 按需加载
- **自动缓存和字节码编译**：减少运行时开销
- **声明式 spec**：每个插件一个 table，放在 `lua/plugins/` 下自动被发现
- **UI 面板**：`:Lazy` 提供安装/更新/同步/清理/profiling 的 TUI

典型 spec 示例：

```lua
{
  "nvim-telescope/telescope.nvim",
  cmd = "Telescope",
  dependencies = { "nvim-lua/plenary.nvim" },
  keys = { { "<leader>f", "<cmd>Telescope find_files<cr>", desc = "Find files" } },
}
```

### 2.2 vim.pack（0.12 内置）

Neovim 0.12 (2026-03-29) 引入了原生 Lua 实现的 `vim.pack`：

**优势：**

- 零外部依赖，Neovim 核心团队维护
- 干净的 API：`vim.pack.add("user/repo")` 声明依赖
- Lockfile 支持：`$XDG_CONFIG_HOME/nvim/nvim-pack-lock.json`
- `:Pack install` / `:Pack update` 极简命令

**致命短板（当前）：**

- **无 lazy-loading**。只有 start（启动加载）和 opt（手动 `:packadd`）两种模式
- 没有 event/filetype/command 触发式的按需加载
- 实测：30 插件 start-only → 180-250ms，远慢于 lazy.nvim 的 55-70ms

**0.13 改进（2026-05）：**

- 新增 `vim.pack` 功能增强，社区讨论活跃
- Lazy 作者 folke 表示 lazy.nvim 会长期共存
- 共识：新配置可尝试 vim.pack（<15 插件场景），已有 lazy.nvim 配置不值得迁移

### 2.3 决策框架

| 场景                | 推荐                               |
| ------------------- | ---------------------------------- |
| <15 插件，新配置    | vim.pack（零引导代码）             |
| >20 插件            | lazy.nvim（lazy-loading 不可或缺） |
| 已有 lazy.nvim 配置 | 不要迁移                           |
| 需要分发给他人      | vim.pack（零安装步骤）             |

---

## 3. 插件开发工具链

### 3.1 LuaLS (lua-language-server)

Neovim 官方推荐的 Lua LSP。核心能力：

- 支持 Lua 5.1-5.5 + LuaJIT
- 20+ EmmyLua 注解类型（`---@param`、`---@return`、`---@type`、`---@field`、`---@class`）
- 动态类型检查、自动补全、跳转定义、查找引用
- Neovim 特定：识别 `vim` 全局、runtime 文件库

Neovim 项目级 `.luarc.json`：

```json
{
  "runtime.version": "LuaJIT",
  "runtime.path": ["lua/?.lua", "lua/?/init.lua"],
  "diagnostics.globals": ["vim"],
  "workspace.checkThirdParty": false,
  "workspace.library": ["$VIMRUNTIME"]
}
```

Neovim 自身代码库大量使用 LuaCATS 注解，在 CI 中借助 LuaLS 做静态检查。

### 3.2 StyLua

Neovim 社区的标准 Lua 格式化器（Rust 实现，速度快）。

- Neovim 自身使用 `.stylua.toml` 定义格式化规则
- 通过 conform.nvim 或 nvim-lint 集成到 Neovim 中
- 支持 `.stylua.toml` 项目级配置
- 可配合 pre-commit hook：`stylua` / `stylua-system` / `stylua-github`

### 3.3 luarocks

官方推荐的 Lua 包管理器。适用于：

- 插件有编译依赖（C/Rust 组件）
- 插件需要被其他插件作为依赖引用
- 发布到 luarocks.org 供社区发现

Neovim 0.9+ 通过 `vim.lsp.luarocks` 内置 luarocks 路径解析。

### 3.4 测试框架

**三足鼎立：**

| 框架                  | 定位                                   | 状态                   |
| --------------------- | -------------------------------------- | ---------------------- |
| plenary.nvim busted   | 传统社区标准，BDD 风格                 | 已停止维护             |
| nvim-test (lewis6991) | 轻量替代，直接 fork 自 neovim 核心测试 | 活跃 (v1.4.0, 2026-03) |
| plentest.nvim         | treesitter 团队 fork，精简自包含       | 内部使用               |

**`nvim-test` 特点：**

- 命令行工具，非 Neovim 插件
- 支持指定 runner 和 target Neovim 版本（含 nightly）
- 底层调用 busted，兼容 plenary 测试语法
- 用法：`nvim-test --runner_version 0.12.0 --target_version 0.12.0`

**典型测试结构：**

```lua
describe("myplugin", function()
  before_each(function()
    -- setup
  end)

  after_each(function()
    -- teardown
  end)

  it("should do something", function()
    local result = require("myplugin").do_something()
    assert.equals("expected", result)
  end)

  pending("future feature", function()
    -- not yet implemented
  end)
end)
```

---

## 4. 插件模块设计模式

Neovim 官方文档（`:help lua-plugin`）推荐的模式：

```lua
-- lua/myplugin/init.lua
local M = {}

-- 私有状态（local，不导出）
local state = {
  initialized = false,
  config = {},
}

-- 默认配置
local defaults = {
  enabled = true,
  timeout = 5000,
}

function M.setup(opts)
  if state.initialized then
    vim.notify("myplugin: already initialized", vim.log.levels.WARN)
    return
  end
  state.config = vim.tbl_deep_extend("force", defaults, opts or {})
  vim.validate({
    enabled = { state.config.enabled, "boolean" },
    timeout = { state.config.timeout, "number" },
  })
  state.initialized = true
end

function M.get_config()
  return vim.deepcopy(state.config)
end

return M
```

**关键约定：**

- `M = {}` 模式：导出 table，不是全局变量
- 状态保持 local：防止外部直接修改
- `vim.deepcopy` 返回配置：避免引用泄漏
- `vim.validate()`：类型校验用户配置

### 4.1 插件入口（plugin/ 目录）

```lua
-- plugin/myplugin.lua
-- 此文件在启动时加载，应保持极小，避免 eager require()
if vim.g.loaded_myplugin == 1 then
  return
end
vim.g.loaded_myplugin = 1

vim.api.nvim_create_user_command("MyPlugin", function(opts)
  require("myplugin").setup()  -- 延迟 require，在首次命令调用时才加载
end, { nargs = "?", desc = "Start MyPlugin" })
```

### 4.2 健康检查

```lua
-- lua/myplugin/health.lua
local M = {}

function M.check()
  vim.health.start("myplugin")
  if vim.fn.has("nvim-0.10.0") == 1 then
    vim.health.ok("Neovim >= 0.10.0")
  else
    vim.health.error("Neovim >= 0.10.0 required")
  end
  if vim.fn.executable("rg") == 1 then
    vim.health.ok("ripgrep found")
  else
    vim.health.warn("ripgrep not found (recommended)")
  end
end

return M
```

`:checkhealth` 自动发现此文件并执行。

---

## 5. Neovim 0.12 "Batteries Included" 转向

0.12 (2026-03-29) 是一次方向性发布：

| 新增/增强                               | 说明                                                                       |
| --------------------------------------- | -------------------------------------------------------------------------- |
| `vim.pack`                              | 内置插件管理器                                                             |
| 原生 LSP 扩展                           | `selectionRange`、`inlineCompletion`、`linkedEditingRange`、`documentLink` |
| `'autocomplete'` 选项                   | 原生 insert-mode 自动补全（无需第三方补全插件）                            |
| Treesitter 内建                         | 解析器和语法高亮默认启用，不再需要 nvim-treesitter 插件                    |
| 内置插件                                | `:Undotree`、`:DiffTool`                                                   |
| `vim.lsp.config()` / `vim.lsp.enable()` | 新的原生 LSP 配置 API（替代 lspconfig 模式）                               |
| `vim.net.request()`                     | 原生 HTTP 客户端                                                           |
| `vim.fs`                                | 文件系统操作 API 扩展                                                      |

**0.13 路线图**：官方称为 "Year of Batteries Included"，进一步推进功能内置化。

### 5.1 迁移注意事项（从 0.11 → 0.12）

- `vim.loop` → `vim.uv`（全局替换）
- 可删除 `nvim-treesitter` 插件块（高亮已内置）
- `:sign-define diagnostics` → `vim.diagnostic.config()`
- LSP 迁移到 `vim.lsp.config()` 模式
- 插件管理器：**不改**（lazy.nvim 继续正常工作）

---

## 6. 与 froQ 工具链的关联

froQ 深度定制 dotfiles，Neovim 配置哲学与他的工具观高度契合。本轮识别了几个潜在关注点：

1. **lazy.nvim profiling**：`:Lazy profile` 可精确定位启动瓶颈，对追求启动速度的配置极有价值
2. **LuaLS + StyLua 工具链成熟度**：如果未来写 Neovim 插件（比如 hiatus 项目的 Julia-Neovim 桥接），这套工具链可以直接用
3. **vim.pack 的 watch 策略**：目前不适合迁移（lazy-loading 是刚需），但关注 0.13 的 lazy-loading 增强
4. **nvim-test**：比 plenary 更轻量，如果给工具写测试，这是更好的选择
5. **vim.loader.enable()**：检查是否已启用，这一个调用能节省约 30% 启动时间

---

## 7. 信息源

- Neovim 官方文档：`:help lua-plugin`、`:help dev-patterns`、`:help lua-guide`
- nvim-neorocks/nvim-best-practices：社区维护的 DOs/DON'Ts
- folke/lazy.nvim：插件管理器文档 (lazy.folke.io)
- echasnovski 的 vim.pack 指南 (2026-03)
- lewis6991/nvim-test：测试框架
- LuaLS/lua-language-server：Lua LSP
- JohnnyMorganz/StyLua：Lua 格式化器
