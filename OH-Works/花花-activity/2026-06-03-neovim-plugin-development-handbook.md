# Neovim 插件开发全手册

> 从目录结构到 CI/CD，构建一个专业级 Neovim Lua 插件的完整方法论。
> 直接服务于 LiG.nvim 及其他开源插件开发。

---

## 一、插件目录结构

Neovim 通过 `runtimepath` 机制发现插件。标准目录布局：

```
my-plugin.nvim/
├── lua/                    # Lua 模块（按需加载，等价于 Vimscript 的 autoload/）
│   └── my-plugin/
│       ├── init.lua        # require('my-plugin') 的入口
│       ├── config.lua      # 默认配置
│       ├── core.lua        # 核心逻辑
│       └── utils.lua       # 内部工具（避免命名为 util.lua——容易变成垃圾场）
├── plugin/                 # 启动时自动执行（轻量入口，不要在此 require 全部模块）
│   └── my-plugin.lua       # 注册 commands、keymaps、autocommands
├── ftplugin/               # 文件类型特定初始化（仅在打开对应文件类型时执行）
│   └── rust.lua            # 仅在 rust 文件中加载
├── autoload/               # Vimscript 的按需加载（仅限 Vimscript 插件，Lua 用 lua/ 目录代替）
├── doc/                    # Vimdoc 帮助文档
│   └── my-plugin.txt       # :help my-plugin 的入口
├── tests/ (或 spec/)       # 测试文件
│   └── my-plugin_spec.lua
├── scripts/                # 构建/测试辅助脚本
├── .github/workflows/      # CI 配置
│   └── ci.yml
├── .stylua.toml            # 代码格式化配置
├── .luacheckrc             # Linting 配置
├── .luarc.json             # lua-language-server 配置
├── README.md               # 项目文档（同时也是 vimdoc 的源）
└── LICENSE
```

### 关键原则

- **`plugin/` 文件要轻**：只注册 commands、keymaps、autocommands。不要在此 `require` 重型模块。在回调内部做按需 `require`。
- **`lua/` 是主体**：所有业务逻辑放在 `lua/` 下，利用 Lua 的 `require()` 缓存机制天然实现单例。
- **用 `vim.g.loaded_*` 防重复加载**：遵循 Vim 惯例，允许用户通过设置 `vim.g.loaded_my_plugin = 1` 禁用插件。

```lua
-- plugin/my-plugin.lua
if vim.g.loaded_my_plugin then
  return
end
vim.g.loaded_my_plugin = true

-- 注册命令（在回调内 require，不在此处 require）
vim.api.nvim_create_user_command("MyCmd", function()
  require("my-plugin").do_something()
end, {})

-- 注册 <Plug> 映射
vim.keymap.set("n", "<Plug>(MyPluginAction)", function()
  require("my-plugin.core").action()
end)
```

---

## 二、最佳实践清单（来自 nvim-neorocks/nvim-best-practices）

### 2.1 类型安全

Lua 是动态类型语言——配置场景下足够灵活，但大型项目中是隐患。用 **LuaCATS 注解** + **lua-language-server** 在 CI 中提前捕获 bug。

**推荐工具链：**

- [lua-language-server](https://github.com/LuaLS/lua-language-server) — 类型检查 + 自动补全
- [lua-typecheck-action](https://github.com/marketplace/actions/lua-typecheck-action) — CI 集成
- [luacheck](https://github.com/mpeterv/luacheck) — 额外 linting
- [lazydev.nvim](https://github.com/folke/lazydev.nvim) — 开发时的 Neovim API 类型补全

```lua
---@class myplugin.Config
---@field enable boolean
---@field strategy "fast" | "accurate"

---@type myplugin.Config
local default_config = {
  enable = true,
  strategy = "fast",
}
```

### 2.2 用户命令：用子命令替代扁平命令

❌ 不要这样做（污染命令命名空间）：

```
:RocksInstall {arg}
:RocksPrune {arg}
:RocksUpdate
```

✅ 这样做（子命令 + 自动补全）：

```
:Rocks install {arg}
:Rocks prune {arg}
```

通过 `complete` 回调实现子命令 + 参数的两级补全。常用库：[mega.cmdparse](https://github.com/ColinKennedy/mega.cmdparse) 可省去大部分样板代码。

### 2.3 Keymaps：使用 `<Plug>` 映射

❌ 不要在插件内自动创建大量 keymap——会与用户映射冲突。
❌ 不要用自定义 DSL 来配置 keymap——重复造轮子 + 用户学习成本。

✅ 提供 `<Plug>` 映射，让用户自己绑定：

```lua
-- 在你的插件中
vim.keymap.set("n", "<Plug>(MyPluginAction)", function()
  print("Hello")
end)

-- 在用户配置中（一行代码，插件未安装也不会报错）
vim.keymap.set("n", "<leader>h", "<Plug>(MyPluginAction)")
```

`<Plug>` 映射的优势：

- 支持 `expr = true` 等高级选项
- 内置 mode 处理，同一映射在不同 mode 下行为不同
- 可用 `hasmapto()` 检测用户是否已绑定
- 插件被禁用时不会产生错误

### 2.4 初始化：不要强制 `setup()`

这是 Neovim 社区争议最大的话题之一。mrcjkb 有[详尽的论述](https://mrcjkb.dev/posts/2023-08-22-setup.html)解释为什么 `setup()` 是一种反模式。

**核心论点：**

- 强制 `setup()` 使插件无法开箱即用
- 用户必须 `require` 插件才能配置，妨碍了按需加载
- 配置和初始化应该严格分离

✅ **推荐做法：**

**方案 A**：用 `vim.g` 全局变量作为配置入口（不需要 `require` 插件即可配置）：

```lua
-- 用户 init.lua 中（不加载插件本身）
vim.g.my_plugin_config = {
  strategy = "periodic",
}
```

**方案 B**：提供可选的 `setup(opts)` 函数，但仅用于覆盖默认配置，不包含初始化逻辑。初始化在 `plugin/` 脚本中自动完成。

**例外情况（`setup()` 可以接受）：**

- 需要兼容 Neovim ≤ 0.6
- 插件实际是 monorepo 包含多个子插件
- 集成的另一个插件强制要求

### 2.5 按需加载：插件作者的责任，不是用户的

❌ 不要依赖插件管理器（lazy.nvim 等）来实现按需加载——这会给用户增加不必要的开销。

✅ 利用 Neovim 的内置机制自己处理：

- `plugin/` 文件中的注册代码天然轻量
- 在命令/keymap 回调内做 `require`
- 文件类型特定逻辑放 `ftplugin/`

```lua
-- ❌ 坏——eager loading
local mymod = require("my-plugin.heavy-module")
vim.api.nvim_create_user_command("MyCmd", function()
  mymod.do_work()
end, {})

-- ✅ 好——lazy loading
vim.api.nvim_create_user_command("MyCmd", function()
  require("my-plugin.heavy-module").do_work()
end, {})
```

### 2.6 配置合并

用 `vim.tbl_deep_extend("force", default, user)` 合并用户配置，让用户只需提供要修改的字段。

```lua
---@type myplugin.Config
local defaults = {
  enable = true,
  strategy = "fast",
  timeout = 5000,
}

local M = {}

function M.setup(opts)
  M.config = vim.tbl_deep_extend("force", defaults, opts or {})
end

return M
```

---

## 三、测试

Neovim 插件测试有三大流派：

### 3.1 plenary.nvim test_harness（传统方案）

最广泛使用的方案。提供 Busted 风格 DSL（`describe`/`it`），可以访问 Neovim API。

```lua
-- tests/my_plugin_spec.lua
local plenary_dir = os.getenv("PLENARY_DIR") or "/tmp/plenary.nvim"
if not vim.loop.fs_stat(plenary_dir) then
  vim.fn.system({ "git", "clone", "https://github.com/nvim-lua/plenary.nvim", plenary_dir })
end
vim.opt.rtp:prepend(plenary_dir)

local helpers = require("plenary.test_harness")

describe("my-plugin", function()
  it("should do something", function()
    local result = require("my-plugin").do_something()
    assert.equals("expected", result)
  end)
end)
```

**运行方式：**

```bash
nvim --headless -c "PlenaryBustedDirectory tests/ {minimal_init = 'tests/minimal_init.lua'}"
```

**局限性：** plenary-test 是 busted 的精简实现，不支持 `setup`/`teardown`/`insulate`/`expose`/`finally` 以及标签过滤等特性。

### 3.2 mini.test（现代方案）

echasnovski 专为 Neovim 插件设计的测试框架，是 mini.nvim 生态的一部分。

**特性：**

- 层级化测试 + hooks + 参数化 + 过滤（从当前文件/光标位置运行）
- 子 Neovim 进程管理 + 屏幕截图测试
- Busted 风格接口模拟
- 可定制 reporter（buffer 模式用于交互，stdout 模式用于 headless CI）

```lua
-- tests/test_my_plugin.lua
local T = MiniTest.new_set()

T["basic test"] = function()
  local result = require("my-plugin").compute(1, 2)
  MiniTest.expect.equality(result, 3)
end

return T
```

### 3.3 busted + luarocks + nlua（标准 Lua 生态方案）

Neovim ≥ 0.9 可用 `nvim -l` 作为 Lua 解释器运行 busted 测试。

**优势：**

- 使用标准 Lua 测试框架
- 利用 luarocks 管理依赖，可复现
- 标准 `.rockspec` 声明测试依赖

**配置：**

`.busted` 文件：

```lua
return {
  _all = {
    coverage = false,
    lpath = "lua/?.lua;lua/?/init.lua",
    lua = "nlua",  -- Neovim-Lua CLI adapter
  },
  default = { verbose = true },
}
```

`{plugin}-scm-1.rockspec`：

```lua
rockspec_format = '3.0'
package = 'my-plugin.nvim'
version = 'scm-1'
test_dependencies = {
  'lua >= 5.1',
  'nlua',
  'busted',
}
source = { url = 'git://github.com/user/my-plugin.nvim' }
build = { type = 'builtin' }
```

**CI 推荐工具：** [nvim-busted-action](https://github.com/nvim-neorocks/nvim-busted-action)

### 选择建议

| 场景                         | 推荐              |
| ---------------------------- | ----------------- |
| 快速原型、小型插件           | plenary.test      |
| 需要屏幕截图测试、子进程管理 | mini.test         |
| 大型插件、追求生态标准化     | busted + luarocks |
| 已有 plenary 依赖            | 沿用 plenary.test |

---

## 四、文档生成

### 4.1 vimdoc 格式规范

Neovim 帮助文档使用 vimdoc 格式。核心约定：

- 标签：`*plugin-name.txt*` 定义帮助标签
- 标题行：`*tag*` 后跟 Tab + 简短描述
- 用 `|link|` 创建交叉引用
- 用 `>` 前缀创建 preformatted 代码块
- 用 `-` 前缀创建列表（flow layout，不硬换行）

### 4.2 panvimdoc：从 Markdown 自动生成 vimdoc

[panvimdoc](https://github.com/kdheepak/panvimdoc) 是当前最成熟的方案——用 Pandoc 将 Markdown 转为 vimdoc。

**核心思路：** README.md 作为单一数据源，CI 自动生成 `doc/*.txt`。

**GitHub Actions 配置（最小）：**

```yaml
name: panvimdoc
on:
  push:
    branches: [main]
    paths:
      - README.md
      - .github/workflows/panvimdoc.yml

permissions:
  contents: write

jobs:
  docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: kdheepak/panvimdoc@v4.0.1
        with:
          vimdoc: ${{ github.event.repository.name }}
          description: A Neovim plugin for...
      - uses: stefanzweifel/git-auto-commit-action@v5
        with:
          commit_message: 'docs: auto generate vimdoc'
```

**其他选项：**

- [ibhagwan/ts-vimdoc.nvim](https://github.com/ibhagwan/ts-vimdoc.nvim) — 基于 Tree-sitter Markdown parser，纯 Neovim 方案
- [wincent/docvim](https://github.com/wincent/docvim) — Haskell 实现
- [FooSoft/md2vim](https://github.com/FooSoft/md2vim) — Go 实现

---

## 五、代码质量工具

| 工具                                                                | 用途                    | CI 集成                       |
| ------------------------------------------------------------------- | ----------------------- | ----------------------------- |
| [stylua](https://github.com/JohnnyMorganz/StyLua)                   | Lua 代码格式化          | `stylua --check .`            |
| [luacheck](https://github.com/mpeterv/luacheck)                     | 静态分析 + lint         | `luacheck lua/`               |
| [lua-language-server](https://github.com/LuaLS/lua-language-server) | 类型检查                | `lua-language-server --check` |
| [selene](https://github.com/Kampfkarren/selene)                     | 现代 Lua linter（更快） | `selene lua/`                 |

### .stylua.toml 推荐配置

```toml
column_width = 100
line_endings = "Unix"
indent_type = "Spaces"
indent_width = 2
quote_style = "AutoPreferDouble"
call_parentheses = "Always"
```

---

## 六、CI/CD 完整工作流

### 6.1 推荐矩阵

```yaml
name: CI
on:
  pull_request:
  push:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: JohnnyMorganz/stylua-action@v4
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          version: latest
          args: --check .

  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: mrcjkb/lua-typecheck-action@v1
        with:
          directories: lua

  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        neovim_version:
          - v0.9.5
          - v0.10.4
          - nightly
    steps:
      - uses: actions/checkout@v4
      - uses: rhysd/action-setup-vim@v1
        with:
          neovim: true
          version: ${{ matrix.neovim_version }}
      - name: Run tests
        run: |
          nvim --headless -c "PlenaryBustedDirectory tests/"
```

### 6.2 版本发布自动化

**方案 A：release-please**
[googleapis/release-please](https://github.com/googleapis/release-please) 基于 Conventional Commits 自动生成 changelog 和版本 PR。

**方案 B：luarocks-tag-release**
[luarocks-tag-release](https://github.com/marketplace/actions/luarocks-tag-release) 在推送 tag 时自动发布到 LuaRocks。

### 6.3 发布渠道矩阵

| 渠道                   | 适用场景              | 工具                             |
| ---------------------- | --------------------- | -------------------------------- |
| GitHub Releases        | 所有用户              | release-please + tag             |
| LuaRocks               | 系统级安装、依赖管理  | luarocks-tag-release             |
| lazy.nvim / rocks.nvim | Neovim 插件管理器社区 | 无需额外操作，天然支持 GitHub 源 |

---

## 七、发布检查清单

在首次发布前确认：

- [ ] `plugin/` 文件设置了 `vim.g.loaded_*` 守卫
- [ ] README.md 包含安装说明（至少 lazy.nvim 和 rocks.nvim 两种方式）
- [ ] `doc/*.txt` 已通过 panvimdoc 自动生成
- [ ] CI 覆盖：stylua 格式检查 + luacheck/selene lint + lua-language-server 类型检查 + 多版本 Neovim 测试
- [ ] `.luarc.json` 配置了 lua-language-server（兼容 Neovim API + 项目结构）
- [ ] LICENSE 文件存在（推荐 MIT）
- [ ] 代码中 `require` 调用在回调内部（按需加载）
- [ ] 提供 `<Plug>` 映射而非自动创建 keymap
- [ ] 用户命令使用子命令模式（如果命令数量 > 3）
- [ ] LuaCATS 注解覆盖公开 API
- [ ] 配置与初始化逻辑分离
- [ ] `.stylua.toml` 和 `.luacheckrc` 存在于仓库中

---

## 八、与 froQ 工具链的连接点

### 8.1 LiG.nvim 直接映射

LiG.nvim 作为 Neovim 插件，本手册覆盖了其完整开发生命周期：

- **结构**：`plugin/lig.lua`（轻量入口）→ `lua/lig/init.lua`（主逻辑）
- **测试**：选择 mini.test（echasnovski 生态，与 mini.nvim 一致）或 plenary.test（社区主流）
- **文档**：README.md → panvimdoc → `doc/lig.txt`
- **发布**：GitHub Releases + LuaRocks（[08:00 轮许可证框架中已推荐 MIT](2026-06-03-open-source-licensing-decision-framework.md)）
- **CI**：stylua + luacheck + 多 Neovim 版本测试矩阵

### 8.2 与已有知识体系的缝合

- **Vim 模态编辑**（[05-30 Neovim Lua 生态](2026-05-30-neovim-lua-ecosystem.md) + [06-01 工具哲学](2026-06-01-tool-philosophy-extended-mind.md)）：本手册的插件架构原则（状态机、composable commands、按需加载）是模态编辑思想的工程化延伸
- **命名哲学**（[05-31 命名设计实践](2026-05-31-naming-as-design-practice.md) + [06-02 东西方命名哲学](2026-06-02-naming-philosophy-east-west.md)）：插件命名（`<Plug>(Name)` 语法、命令名空间、模块路径）是「异质化命名制造认知距离」在开发者工具中的实践
- **开源贡献策略**（[05-30 开源贡献](2026-05-30-open-source-contribution-strategy.md)） + **许可证框架**（[06-03 许可证](2026-06-03-open-source-licensing-decision-framework.md)）：本手册的 CI/CD 和发布管线是其工程落地
- **Dotfiles 哲学**（[06-01 工具哲学](2026-06-01-tool-philosophy-extended-mind.md)）：写插件是写 dotfiles 的自然延伸——从配置自己的环境到为他人构建环境的组件

### 8.3 工具选择原则在插件开发中的体现

froQ「工具的优雅直接关联思维的清晰」的三层含义在此找到具体实例：

1. **Heidegger 层（不可见性）**：好的插件 API 让用户忘记插件存在——`<Plug>` 映射、开箱即用的默认值、不需要 `setup()` 就能工作
2. **Extended Mind 层（可靠耦合）**：`require()` 的缓存机制、`plugin/` 的启动保证、vimdoc 的 `:help` 即时可达
3. **Vim 语言层（认知翻译成本为零）**：子命令模式、composable mappings、buffer-local 作用域——插件的交互方式与 Vim 本身的模态语言同构

---

## 参考资料

- [nvim-neorocks/nvim-best-practices](https://github.com/nvim-neorocks/nvim-best-practices) — DOs and DON'Ts 官方指南
- [Neovim `:h lua-plugin`](https://neovim.io/doc/user/lua-plugin.html) — 官方 Lua 插件开发文档
- [Neovim `:h lua-guide`](https://neovim.io/doc/user/lua-guide.html) — Lua 配置完整指南
- [mrcjkb: Why a `setup` function is an anti-pattern](https://mrcjkb.dev/posts/2023-08-22-setup.html)
- [mrcjkb: Test Neovim plugins with luarocks and busted](https://mrcjkb.dev/posts/2023-06-06-luarocks-test.html)
- [kdheepak/panvimdoc](https://github.com/kdheepak/panvimdoc) — Markdown → vimdoc 转换
- [nvim-mini/mini.test](https://github.com/nvim-mini/mini.test) — 现代 Neovim 测试框架
- [linrongbin16/ci-template.nvim](https://github.com/linrongbin16/ci-template.nvim) — CI 模板项目
- [ColinKennedy/nvim-best-practices-plugin-template](https://github.com/ColinKennedy/nvim-best-practices-plugin-template) — 最佳实践插件模板
