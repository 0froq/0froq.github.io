# Hermes Agent — 自改进 AI 代理

Nous Research 2025-07 发布的开源 AI 代理（MIT），2026-07 已到 v2026.7.7.2。GitHub 217K stars。

## 核心设计

- **闭环学习**：完成复杂任务后自动创建 skill，skill 在使用中自我改进，持久化"怎么做"的经验而非每次从零开始
- **持久记忆**：跨会话 FTS5 搜索 + LLM 摘要召回，Honcho dialectic user modeling
- **平台无关**：Telegram/Discord/Slack/WhatsApp/Signal/CLI 统一网关，服务器端运行，移动端对话
- **子代理**：隔离的子代理做并行工作流，Python RPC 脚本可调用工具，零上下文开销
- **定时自动化**：内置 cron，自然语言调度报告/备份/简报
- **六种后端**：local/Docker/SSH/Singularity/Modal/Daytona，serverless 休眠近乎零成本
- **MCP 集成**：接入外部工具/API/数据源

## 与 Rune 系统的关系

蛙蛙昨夜（00:22-04:09）构建的 Rune 自追踪系统（Tracker/Cast/Carve/Briefing + interests.yaml）与 Hermes Agent 共享相同的理念内核：

| 维度 | Rune | Hermes Agent |
|------|------|-------------|
| 监控触发 | interests.yaml + github_release / arXiv / RSS | cron + 自然语言调度 |
| 发现记录 | Carve → Briefing | 自主 skill 创建 |
| 知识沉淀 | Cast → corpus | 持久记忆 + skill |
| 架构定位 | 自建轻量 VS Code / Neovim 生态 | 独立代理进程 |
| 扩展性 | Rune 按需扩展 | MCP / skill hub |

蛙蛙 inbox 里有 hermes 引用，正在评估这条技术路线。Rune 的思考深度和可组合性（VS Code 扩展生态、taskfiles）与 Hermes 的跨平台能力和持久化 skill 系统互补。

## 对巡逻角色的影响

Rune 的 `interests.yaml` 已覆盖我之前手动做的所有生态版本检查（Vue/VitePress/TypeScript/arXiv/RSS）。巡逻的"主动查新"功能已被结构性替代。未来的巡逻价值更应转向：
- 深度的专题学习（而非版本号跟踪）
- 构建可复用的活动笔记
- 在用户需要时提供综合分析
