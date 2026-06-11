# MCP 在 Neovim 中的实践应用

> 2026-05-30 05:00 自主学习

接续上一轮 MCP 生态概述，本轮深入 Neovim 生态中 MCP 的实际落地情况——有哪些可用插件、怎么配、能做什么、以及与 froQ 的工具链（Neovim + Ghostty + Zellij）的契合点。

## 一、Neovim MCP 生态全景

MCP 在 Neovim 中有两种角色：

| 角色                       | 方向              | 含义                                                                                                                                  |
| -------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Neovim 作为 MCP Client** | 外部工具 → Neovim | Neovim 消费外部 MCP 服务器的能力（如文件系统、数据库、API），在编辑器内通过 AI chat 插件调用                                          |
| **Neovim 作为 MCP Server** | Neovim → 外部 AI  | 将 Neovim 的编辑器功能（LSP、diagnostics、buffer 操作、terminal）暴露为 MCP 工具，供外部 AI 客户端（Claude Desktop、OpenCode 等）调用 |

目前生态有三个主要玩家：

- **mcphub.nvim**（1766⭐，v6.2.0）— 最全面的 MCP Client，同时内建 Native Server 实现双向能力
- **mcp-tools.nvim** — 专注 Server 方向，将 Neovim 功能暴露为 MCP 工具
- **mcp.nvim (zaucy)** — 轻量级 Server，TCP + JSON-RPC 2.0，可注册自定义 Lua 函数

---

## 二、mcphub.nvim — 全能型 MCP Hub

### 2.1 架构设计

mcphub.nvim 的核心是一个 Node.js 二进制 `mcp-hub`，架构分三层：

```
┌─────────────────────────────────────────┐
│         Neovim (mcphub.nvim)             │
│  ┌───────────────────────────────────┐  │
│  │   Chat Plugins (Avante / CC /     │  │
│  │   CopilotChat)                    │  │
│  └───────────┬───────────────────────┘  │
│              │ @mcp tool / #variables    │
│  ┌───────────▼───────────────────────┐  │
│  │   mcphub.nvim Lua Layer           │  │
│  │   • :MCPHub UI (nui.nvim)         │  │
│  │   • Server Manager                │  │
│  │   • Workspace Detection           │  │
│  └───────────┬───────────────────────┘  │
│              │ HTTP (localhost:37373)    │
└──────────────┼──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         mcp-hub (Node.js)               │
│  ┌───────────────────────────────────┐  │
│  │   Management API (37373/api)      │  │
│  │   • start/stop servers            │  │
│  │   • execute tools                 │  │
│  │   • real-time events              │  │
│  ├───────────────────────────────────┤  │
│  │   Unified MCP Endpoint            │  │
│  │   (37373/mcp)                     │  │
│  │   • 所有 server 能力聚合为一个     │  │
│  │   • 自动 namespace 防止冲突       │  │
│  └───────────┬───────────────────────┘  │
│              │                           │
│  ┌───────────▼───────────────────────┐  │
│  │   MCP Servers                     │  │
│  │   • STDIO (本地)                  │  │
│  │   • Streamable HTTP (远程)        │  │
│  │   • SSE (回退)                    │  │
│  └───────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

关键设计决策：

- **Unified Endpoint**：所有 MCP server 的能力聚合到单一 `37373/mcp` 端点，外部 MCP 客户端只需配一个 URL，自动获得所有工具
- **Namespace 避免冲突**：多个 server 提供同名工具时自动加前缀
- **Workspace 感知**：自动检测 `.mcphub/servers.json`、`.vscode/mcp.json`、`.cursor/mcp.json`，每个项目独立 hub 实例

### 2.2 能力覆盖

| 类别     | 能力                  | 支持       |
| -------- | --------------------- | ---------- |
| **传输** | STDIO                 | ✅         |
|          | Streamable HTTP       | ✅（主推） |
|          | SSE                   | ✅（回退） |
| **认证** | OAuth + PKCE          | ✅         |
|          | Headers (API Key)     | ✅         |
| **协议** | Tools                 | ✅         |
|          | Resources / Templates | ✅         |
|          | Prompts               | ✅         |
|          | Sampling              | ❌         |
|          | Roots                 | ❌         |

### 2.3 内建 Native Server

mcphub.nvim 自带两个 Zero-dependency 的 Native Server，直接在 Neovim 内运行：

**Neovim Server** — 暴露编辑器能力：

- 文件操作（读/写/搜索）
- Terminal 访问
- LSP 集成（hover、diagnostics、symbols）
- Buffer 管理

**MCPHub Server** — 插件管理：

- Server 生命周期控制
- 文档访问
- 插件管理工具

这意味着不安装任何外部 MCP server，Neovim 已经可以通过 MCP 协议与 AI 交互。

### 2.4 Chat 插件集成

支持三种主流 Neovim AI chat 插件：

| 插件                   | Tools               | Resources  | Prompts    | 图片 |
| ---------------------- | ------------------- | ---------- | ---------- | ---- |
| **Avante.nvim**        | ✅ `@mcp`           | ✅ `#变量` | ✅ `/命令` | ❌   |
| **CodeCompanion.nvim** | ✅ `@mcp`           | ✅         | ✅ `/命令` | ✅   |
| **CopilotChat.nvim**   | ✅ function calling | ✅         | ❌         | ❌   |

集成方式简洁——在 chat 插件配置中注入 `@mcp` tool：

```lua
-- Avante 集成
custom_tools = function()
  return { require("mcphub.extensions.avante").mcp_tool() }
end

-- CodeCompanion 集成
tools = {
  ["mcp"] = {
    callback = function()
      return require("mcphub.extensions.codecompanion")
    end,
    description = "Call tools and resources from the MCP Servers",
  },
}
```

### 2.5 其他亮点

- **VS Code 配置兼容**：直接读取 `.vscode/mcp.json`，一套配置跨 Neovim / VS Code / Cursor / Claude Desktop / Cline / Zed
- **JSON5 支持**：配置文件可以用注释和尾逗号
- **Lua Native MCP Server**：可以在 Lua 中直接编写 MCP tools/resources/prompts，无需外部进程
- **Marketplace**：浏览和安装已验证的 MCP server
- **Multi-instance 同步**：多个 Neovim 实例共享同一个 hub
- **Dev Mode**：文件变更时热重载 MCP server

---

## 三、mcp-tools.nvim — 将 Neovim 暴露为 MCP Server

与 mcphub.nvim 的 Client 定位不同，mcp-tools.nvim 专注于 **Server 方向**。

### 3.1 架构

```
Neovim Instance
├── mcp-tools.nvim (Lua)
│   ├── Tool Registry (Lua functions)
│   └── MCP Bridge (TypeScript, child process)
│       ├── 通过 socket 连接 Neovim
│       ├── 暴露工具 via MCP (Streamable HTTP)
│       └── 路由 tool calls 回 Lua
├── opencode.nvim → 自动发现并注册 MCP server
└── Amp terminal → 连接 MCP server
```

### 3.2 内建工具

| 工具                    | 功能                                                   |
| ----------------------- | ------------------------------------------------------ |
| `nvim_lsp_hover`        | LSP hover 信息查询                                     |
| `nvim_lsp_symbols`      | 文档符号                                               |
| `nvim_diagnostics_list` | LSP 诊断信息                                           |
| **DAP 集成**            | 调试会话、调用栈、变量、表达式求值                     |
| **Undo Tree**           | 撤销历史检查                                           |
| **Interview Tool**      | AI 可以通过 Neovim UI 向用户提问（单选/多选/自由文本） |

### 3.3 与 mcphub.nvim 的关系

二者可以互补使用：

- **mcphub.nvim**：让 Neovim 消费外部 MCP 能力（查文档、操作数据库、调用 API）
- **mcp-tools.nvim**：让外部 AI 消费 Neovim 编辑器能力（查看诊断、调试、LSP 符号）

---

## 四、纯本地 AI 编码工作流（2026 可落地）

Dan Saattrup 在 2026 年 1 月的方案展示了 **完全不依赖互联网的 AI 编码助手**，且基于 Neovim。

### 4.1 双模型策略

| 用途                | 模型               | 框架               | 推理引擎                       |
| ------------------- | ------------------ | ------------------ | ------------------------------ |
| **自动补全**（FIM） | Qwen2.5-Coder-7B   | llama.vim          | llama.cpp server（~1.8GB RAM） |
| **聊天/重构**       | GPT-OSS-20B (4bit) | CodeCompanion.nvim | LM Studio（~6GB RAM）          |

### 4.2 补全链路

```
Neovim → llama.vim → llama.cpp server (FIM endpoint)
                        ↓
              Qwen2.5-Coder-7B (Fill-in-the-Middle)
```

FIM 模型要求特殊的 `/infill` 端点，这是 llama.cpp 独有的（LM Studio 不支持）。llama.cpp 一键命令：

```bash
brew install llama.cpp
llama-server --fim-qwen-7b-default  # 自动下载模型并启动
```

Neovim 配置极简：

```lua
{
  "ggml-org/llama.vim",
  init = function()
    vim.g.llama_config = {
      show_info = false,
      keymap_accept_full = "§",
    }
  end,
}
```

### 4.3 聊天链路

```
Neovim → CodeCompanion.nvim → LM Studio (openai_compatible API)
                                  ↓
                           GPT-OSS-20B (4bit)
```

CodeCompanion 的 tool call 格式对模型敏感，目前只确认 GPT-OSS 系列兼容。配置中可注入项目编码规范文件：

```lua
rules = {
  python = {
    description = "Python conventions",
    files = { "~/path/to/CONVENTIONS.md" },
  },
},
```

### 4.4 该方案的限制

1. **模型兼容性脆弱**：CodeCompanion 的 tool call 解析只兼容少数模型
2. **单模型维护者风险**：CodeCompanion 由一人维护
3. **内存开销**：LM Studio 常驻 ~6GB，但支持 JIT 加载卸载
4. **FIM 模型选择有限**：仅 Qwen Coder 系列原生支持

---

## 五、与 froQ 工具链的契合分析

froQ 的工具栈：**Neovim + Ghostty + Zellij**，这些与 MCP 生态天然契合。

### 5.1 Zellij + tmux 的 LLM 常驻

Dan Saattrup 用 tmux 托管 llama.cpp server。对于 froQ 使用 Zellij 的场景，可以直接在 Zellij 的 pane 中运行：

```bash
# 在一个 dedicated pane 中
llama-server --fim-qwen-7b-default

# 或在另一个 pane 中
lms server  # LM Studio CLI（如果支持）
```

Zellij 的 layout 可以保存为配置文件，实现一键启动完整的 AI 辅助环境。

### 5.2 MCP 与 Ghostty

Ghostty 作为终端模拟器，其原生功能（分屏、tabs）不直接参与 MCP 链路，但：

- Ghostty 的 split 可以用来同时观察 Neovim + MCP server 日志
- 未来如果 Ghostty 支持 MCP（将终端 I/O 暴露为 MCP 工具），可以实现终端+编辑器统一 AI 控制面

### 5.3 对 hiatus 项目（Julia）的潜在应用

当前 hiatus 项目使用 Julia 生态，MCP 可以：

- 通过 Julia MCP server（如 `julia-mcp`）将 Julia REPL / 包管理暴露为 AI 工具
- 在 Neovim 中通过 mcphub.nvim 调用 Julia MCP server，实现在编辑器内执行 Julia 代码片段、查询文档、管理依赖
- 结合 CodeCompanion 的 `@mcp` tool，AI 可以直接在聊天中运行 Julia 分析

### 5.4 推荐的渐进集成路径

| 阶段        | 内容                                                                                           | 复杂度 |
| ----------- | ---------------------------------------------------------------------------------------------- | ------ |
| **Phase 1** | 安装 mcphub.nvim + 探索内建 Native Server（零外部依赖即可体验 MCP）                            | 低     |
| **Phase 2** | 接入 1-2 个外部 MCP server（如 fetch、filesystem），在 CodeCompanion/Avante 中通过 `@mcp` 调用 | 中     |
| **Phase 3** | 配置纯本地 LLM（llama.cpp + LM Studio），实现离线 AI 编码                                      | 中高   |
| **Phase 4** | 为 hiatus 项目配置 Julia MCP server，打通编辑器→AI→Julia 工作流                                | 高     |

---

## 六、关键结论

1. **MCP 在 Neovim 中已经成熟可用**：mcphub.nvim v6.2.0 覆盖了从传输到认证到集成的完整链路，1766 star 和 30 位贡献者表明生态活跃。

2. **Neovim 同时扮演 Client 和 Server**：消费外部能力 + 暴露编辑器功能，双向打通。

3. **纯本地 AI 编码是可行的**：Dan Saattrup 的方案证明了 2026 年可以在 Neovim 中实现完全离线的 AI 编码助手，仅需约 8GB RAM 开销。

4. **与 froQ 的 Zellij 工作流天然互补**：Zellij 的面板布局可以托管常驻 LLM 进程。

5. **hiatus 项目的 Julia 工具链可以通过 MCP 与 Neovim 统一**：`julia-mcp` server + mcphub.nvim + CodeCompanion 的组合有望打通 Julia 科学计算→Neovim 编辑→AI 辅助的闭环。

---

## 参考

- mcphub.nvim: https://github.com/ravitemer/mcphub.nvim
- mcp-tools.nvim: https://github.com/guill/mcp-tools.nvim
- mcp.nvim: https://github.com/zaucy/mcp.nvim
- Dan Saattrup, "Local AI Coding Assistant in Neovim in 2026": https://www.saattrupdan.com/posts/2026-01-18-local-ai-coding-assistant-in-nvim
