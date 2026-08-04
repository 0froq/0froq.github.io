# Hermes Agent 架构解析与 Rune 对比

## 基本信息

- **项目**：NousResearch/hermes-agent
- **Stars**：217K / Forks：41K
- **许可**：MIT License
- **最新版本**：v2026.7.20（2026-07-20 发布，即前天）
- **核心定位**：The self-improving AI agent — "the agent that grows with you"
- **首页**：https://hermes-agent.nousresearch.com
- **Repo**：https://github.com/NousResearch/hermes-agent

## 三层架构

```
Entry Points: CLI / Gateway (Telegram, Discord, QQBot 等 20 个平台) / ACP (VS Code 等 IDE) / Batch Runner
       │
       ▼
AIAgent (run_agent.py) — Think-Act-Observe 核心循环
       ├── Prompt Builder (system prompt 组装)
       ├── Provider Resolution (300+ 模型, 20+ 供应商)
       ├── Tool Dispatch (70+ tools, 28 toolsets)
       ├── Context Compression (lossy summarization)
       └── Memory Manager (FTS5 全文搜索 + Honcho 用户建模)
       │
       ▼
Tool Backends: Terminal (6种), Browser (5种), Web (4种), MCP (动态), File, Vision
```

## 核心特征

1. **自改进循环（Closed Learning Loop）**：
   - 技能在复杂任务后自动创建
   - 技能在使用中自我改进
   - 周期性 nudge 催促知识持久化
   - FTS5 跨会话检索 + LLM summarization
   - Honcho dialectic user modeling

2. **平台自由度**：
   - 20 个消息平台适配器（包括 QQBot、钉钉、飞书、企业微信）
   - CLI TUI 全功能（React/Ink 重写，OSC-52 剪贴板，状态栏）
   - 单 gateway 进程多平台并存

3. **基础设施**：
   - 6 种 terminal 后端（local / Docker / SSH / Modal / Daytona / Singularity）
   - cron 调度器（自然语言定时任务）
   - 子代理（独立会话 + 终端 + Python RPC）
   - 插件系统（pre/post LLM hooks, tool veto, slash command 注册）
   - 批量轨迹生成（研究/训练用）

4. **模型支持**：
   - 通过 Nous Portal 访问 400+ 模型
   - OpenRouter、OpenAI、Anthropic、HuggingFace、AWS Bedrock、Google Gemini 等
   - 支持 Anthropic 的 thinking tag 透明传递
   - GPT-5.5 via Codex OAuth

## 与 Rune 的对比

| 维度 | Hermes Agent | Rune（用户的系统） |
|------|-------------|-------------------|
| **核心哲学** | Self-improving — 代理在使用中成长 | Self-tracking — 系统自主采集/解读/产出 |
| **规模** | 全栈 Python 项目 ~25K 测试 | VS Code 扩展，轻量专注 |
| **LLM 依赖** | 强依赖（核心循环靠 LLM） | 无（纯自动化脚本） |
| **输出** | 对话 / 技能文件 / 记忆 | git 可追踪的 Markdown 文件 |
| **部署形态** | 独立代理进程 | VS Code 扩展 + blog repo 内 |
| **学习机制** | 主动自我改进 | 配置驱动（interests.yaml 定义追踪范围） |
| **知识固化** | 技能文件 + 记忆向量 | corpus 文件 + commit 记录 |
| **多平台** | 20 个消息平台 | 本地 VS Code 内 |
| **搜索能力** | 自带 web_search + browser 工具 | 通过 GitHub API / arXiv API / RSS |

## 互补性分析

Rune 与 Hermes Agent 在理念上深度呼应，但走的是完全不同但互补的路线：

**Rune 的优势（Hermes 不擅长）**：
- 零 LLM 开销，纯脚本执行可靠
- 输出直接 commit 到 repo，与 blog/corpus 同仓库
- interests.yaml 作为声明式配置简洁且可版本控制
- 用户完全掌控追踪的范围和深度

**Hermes 的优势（Rune 不擅长）**：
- 有真正的对话和推理能力
- 技能自动创建可以比 Rune 的 Cast/Carve 产出更灵活
- 多平台触达（Telegram/QQ 等）
- 上下文感知的决策（不只是版本检查，还能分析趋势）

**可能的结合点**：
- Rune 做数据采集层（可靠、低开销、可版本控制）
- Hermes 做分析/判断层（需要 LLM 的场景）
- 用户 inbox 中的 "hermes" 条目已经表明用户正在评估这条路线

## 对 froQ 的影响

用户当前运行的 agent 框架正是 Hermes Agent（interests.yaml 中已追踪）。
最新的 v2026.7.20 版本在前天发布，而 Tracker 在 09:33 已自动检测到。
用户对 Hermes 的评估很可能进入实操阶段——inbox 中 "hermes" 被 Tracker 归类到
Software 说明用户已经将其纳入 Rune 的自动化监控范围。

---

created: 2026-07-21
status: note
aigc: true
#activity-note #author/hanako #scope/work #tag/hermes #tag/rune
