# MCP 生态全景：协议、工具链与科学计算

> 2026-05-30 04:00 自主学习

## 1. MCP 是什么

Model Context Protocol（MCP）是 Anthropic 于 2024-11-25 开源的一个协议标准，用于规范 AI Agent 与外部工具/数据源之间的通信。它不是框架、不是编排层、不是 REST 的替代品——它是 **Agent 与工具之间的通用接口规范**。

当前稳定版本：**2025-11-25 spec**。自 2025 年 3 月 OpenAI 在 Agents SDK 中采纳后，MCP 已成为 AI 工具链领域最接近「通用标准」的存在。

### 三个核心原语

| 原语          | 含义             | 典型用途                     |
| ------------- | ---------------- | ---------------------------- |
| **Resources** | 只读数据         | 文件、数据库记录、API 响应   |
| **Tools**     | 可调用函数       | 创建工单、查询 CRM、搜索仓库 |
| **Prompts**   | 可复用的提示模板 | 标准化工作流、审查流程       |

生产环境中绝大多数 MCP 使用集中在 Tools——因为那是 Agent 实际调用的东西。

### 传输层

当前 spec 列出两种标准传输：

- **stdio**：本地使用，客户端将 MCP server 作为子进程启动
- **Streamable HTTP**：远程使用，替代旧的 HTTP+SSE（已 deprecated）

## 2. 采用现状（2026 Q2）

### 已验证的数据点

| 指标                       | 数值   | 来源                              |
| -------------------------- | ------ | --------------------------------- |
| 活跃公共 MCP 服务器        | 10K+   | Anthropic 2025-12 生态系统更新    |
| 官方注册表最新记录         | 9,652  | MCP Registry API 快照，2026-05-24 |
| GitHub mcp-server 主题仓库 | 15,926 | GitHub Search API                 |
| SDK 月下载量               | 97M+   | Anthropic 公告                    |
| 企业生产采用（有限+广泛）  | 41%    | Stacklok 2026 软件报告            |

### 企业采用阶段（Stacklok 调查，n=100 软件行业）

- 规划/评估中：29%
- 试点：30%
- 有限生产：29%
- 广泛生产：12%

**关键信号**：MCP 已从开发者小众协议进入主流 Agent 基础设施。主要 AI 平台（ChatGPT、Cursor、Gemini、Copilot、VS Code、Vercel）均已提供第一方 MCP 支持文档。

### 传输层迁移

Streamable HTTP 取代 HTTP+SSE 是老教程与新现实的最大差异点。如果读到的 MCP 教程还讲 SSE，协议机制相同但传输方式已更新。

## 3. MCP vs REST API vs SDK

这是工程师初次接触 MCP 时最核心的疑问。

| 维度     | REST API                   | SDK               | MCP                                       |
| -------- | -------------------------- | ----------------- | ----------------------------------------- |
| 状态模型 | 无状态、同步               | 无状态、同步      | 有状态会话                                |
| 能力发现 | 开发者读文档               | 开发者读 SDK 文档 | Agent 运行时自动发现                      |
| 集成方式 | 硬编码端点                 | 硬编码 SDK 调用   | Agent 自行决策调用哪些工具                |
| 可组合性 | 低（每个客户端需单独集成） | 低                | 高（同一 server 可被任意 MCP 客户端使用） |
| 适用场景 | 确定性调用（定时同步数据） | 开发者写代码      | Agent 动态决策                            |

**决策规则**：Agent 需要动态决定调用哪些工具 → MCP。逻辑确定性（总是调同一个端点）→ REST 直接调用就够了。

### MCP 的成本

MCP 会话是有状态的，这增加了水平扩展的运维复杂度。自托管 MCP server 在规模化时需要管理 session state。托管平台（Composio、Pipedream、Knit）会处理这个问题。

## 4. 基础设施层：自建 vs 托管

### 三层模型

1. **Client 层**：Cursor、Claude Desktop、Cline、Windsurf、VS Code agent mode、Goose
2. **Server 层**：开发者编写的工具暴露层（stdio 或 HTTP）
3. **Infrastructure 层**：认证、OAuth token 管理、数据规范化、会话管理

绝大多数团队的痛点不在 Server 层（写一个 MCP server 几小时就能完成），而在 Infrastructure 层。连接生产环境的多个系统，每个都需要 OAuth、token 刷新、数据规范化——这是「数周搭建、数月维护」的工作。

### 托管平台对比

| 平台               | 定位                                        | 优势                                      | 局限                                      |
| ------------------ | ------------------------------------------- | ----------------------------------------- | ----------------------------------------- |
| **Zapier MCP**     | 8,000+ 应用、40,000+ action                 | 覆盖面最广                                | 表层自动化，缺少深层 API 操作             |
| **Pipedream**      | 事件驱动工作流 → MCP tools                  | 适合 webhook 触发场景                     | 序列触发模型与 Agent 动态工具调用哲学不同 |
| **Knit**           | 垂直深度（HRIS/ATS/CRM/Payroll/Accounting） | 统一 schema、150+ 预构建 server、访问控制 | 覆盖面窄于 Zapier                         |
| **Composio/Nango** | OAuth token 管理                            | 专门处理令牌生命周期                      | 不提供统一数据 schema                     |

### 实用建议

- **开发者工具**（GitHub/Linear/Jira/Slack）：用官方或社区成熟 server，别自己造
- **业务数据**（HR/薪资/招聘系统）：每个系统有独立 OAuth 和字段命名，托管平台的价值在这里
- **内部系统**（数据库/内部 API）：自建，不该经过第三方代理
- **不要连太多 server**：40 个 MCP server = 500 个 tools → context window 浪费、名称冲突、延迟增加。按用途构建专注的 Agent

## 5. Julia + MCP：科学计算的新接口

### julia-mcp（aplavin, 2026-02）

解决 Julia 开发中的核心痛点：AI coding assistant 每次运行代码都要承受 Julia 的启动和编译开销。

**设计特点**：

- 持久化 Julia 会话：变量、函数、已加载包在调用间保持
- 全自动：按需启动、崩溃恢复、关闭清理
- 按项目隔离：每个项目目录独立的 Julia 进程
- 纯 stdio 通信：不涉及 TCP 端口管理
- 自动加载 Revise.jl：代码变更无需重启

**技术栈**：Server 用 Python 写（MCP 协议生态 Python 最成熟），依赖仅 `uv` 和 Julia 本身。

**已知问题**：

- Cursor 中 `uv` 不在系统 PATH 时需用绝对路径
- segfault 可能导致内存泄漏（与 Claude Code TUI 交互时）
- AI 可能尝试修改 `.julia` 目录中的文件（sandbox 建议）

### 其他 Julia MCP 生态

- **MCPRepl.jl**：共享 REPL，人和 AI 都能交互
- **Kaimon.jl**：AI Agent 与 Julia 之间的网关，新项目（2026-02）
- **tmux 方案**：DIY 路线，Claude 直接读写 tmux session 中的 Julia REPL

### 科学计算的 MCP 实践：arXiv 2508.18489

Pan et al. (2025) 报告了在科学计算和 HPC 领域使用 MCP 的经验：

**核心理念**：在成熟科研基础设施（Globus Transfer/Compute/Search、计算设施状态 API、Octopus event fabric、Garden、Galaxy）之上构建 thin MCP server 包装层，使 Agent 能够发现、调用、组合科研能力。

**案例研究覆盖**：

- 计算化学
- 生物信息学
- 量子化学
- 文件系统监控

**开放挑战**：Agent 主导科学的评估与信任问题。

### 对 hiatus 项目的启示

froQ 的 hiatus 项目使用 Julia 生态（约束断点搜索 + slope-level 分类），如果将来希望让 AI Agent 协助跑分析、调参数、生成图表，julia-mcp 提供了零摩擦的路径：

1. 克隆 julia-mcp → 注册到 Cursor/Claude → AI 获得持久化 Julia 会话
2. 避免了每次调用 `julia script.jl` 的重编译开销
3. 包和数据在会话间保持加载，适合迭代式分析

## 6. Neovim + MCP：编辑器作为 Agent 工具

### mcp.nvim（zaucy）

让 Neovim **成为** MCP server，外部 AI 客户端可以连接 Neovim、执行注册的 Lua 函数、以编程方式与编辑器交互。

**架构**：

- 自动为每个工作目录启动 MCP server
- TCP 通信（JSON-RPC 2.0），绑定到随机端口
- 支持 LSP 风格帧和原始 JSON 行
- 通过 `McpServerReady` autocommand 通知外部客户端端口号

**可扩展性**：用 Lua 注册自定义 tool，AI 可以调用任何你暴露的 Neovim 功能。

### 与 froQ 工具链的契合点

froQ 深度使用 Neovim。如果配合 mcp.nvim：

- AI Agent 可以在不离开 Neovim 的前提下操作编辑器
- 可以把 LiG.nvim、LSP 诊断、buffer 操作包装为 MCP tools
- 但 mcp.nvim 目前是 TCP 方案（非 stdio），与 Claude Desktop/Cursor 的主流 stdio 集成需要桥接

## 7. 安全考量

MCP 最大的采纳障碍不是技术复杂度，而是安全（Stacklok 报告中安全是首要阻碍因素）。

**最安全的渐进策略**：

1. 从**只读、高价值**集成开始（文档、分析、工单跟踪、仓库搜索）
2. 写操作、客户数据、支付操作、管理操作 → 置于显式审批门控后
3. 加上审计日志

**沙箱问题**：Julia 社区已有反馈——AI 可能「自作主张」修改 `.julia` 目录中的文件。需要文件系统访问边界控制（spec 中的 Roots 原语就是为此设计的，定义允许的 URI/filesystem 边界）。

## 8. 关键要点

1. **MCP 已是主流**：10K+ 公共 server、41% 企业生产中、所有主流 AI 平台支持
2. **协议在进化**：Streamable HTTP 替代 HTTP+SSE，spec 新增 elicitation/roots/sampling
3. **写 server 简单，管 infrastructure 难**：自建 MCP server 几小时，OAuth/会话管理/数据规范化是真正的成本
4. **Julia 生态刚起步**：julia-mcp 解决了持久化会话的核心痛点，但生态成熟度远不如 Python/TypeScript
5. **Neovim 双向集成**：mcp.nvim 让 Neovim 成为 MCP server，Agent 可编程操作编辑器
6. **科学计算 + MCP 是前沿方向**：潘等人的论文展示了 thin-wrapper 架构在 HPC 领域的可行性
7. **不要贪多**：每个 MCP server 的 tool list 都会进入 context window，按用途构建专注 Agent

## 后续可探索方向

- MCP 的 Roots/Elicitation/Sampling 等高级原语的实际应用
- Claude Code 与 julia-mcp 的实战测试（hiatus 项目作为试验场）
- mcp.nvim + Claude Desktop 的集成桥接方案
- MCP 安全审计工具和 sandbox 方案
- Knit/Composio 等托管平台的深度对比（如果 froQ 考虑 Agent 连接多个外部系统）
