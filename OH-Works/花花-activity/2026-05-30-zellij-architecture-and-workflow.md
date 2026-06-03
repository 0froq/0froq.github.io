# Zellij：终端工作区的架构、插件系统与 Neovim 集成

> 巡检自主学习，2026-05-30 09:00

Zellij 是用 Rust 编写的终端 multiplexer（v0.44.1，2026-04-07 发布），31K+ GitHub stars，180 位贡献者。定位是 "terminal workspace with batteries included"——与 tmux 同属 multiplexer 但设计哲学截然不同。

---

## 1. 架构设计

### 1.1 多进程 + 多线程模型

Zellij 采用三层架构，Client 和 Server 作为独立进程，通过 Unix domain socket（protobuf 编码）通信：

```
┌──────────────┐     Unix Socket      ┌──────────────────────┐
│  zellij-client │ ◄─────────────────► │   zellij-server       │
│  (用户交互)     │     protobuf IPC    │  (会话管理)            │
└──────────────┘                      └──────────────────────┘
                                              │
                                        WASM 沙箱
                                              │
                                      ┌───────┴───────┐
                                      │  Plugin Layer   │
                                      │ (built-in + 第三方) │
                                      └───────────────┘
```

Server 内部按职责划分专用线程，每个线程有独立的消息队列（`Bus<T>`）和事件循环：

| 线程 | 入口函数 | 指令枚举 | 职责 |
|------|---------|---------|------|
| Server | `start_server()` | `ServerInstruction` | 会话生命周期，client attach/detach |
| Route | `route_thread_main()` | `Action` | 中心路由，将 Action 转为线程指令 |
| Screen | `screen_thread_main()` | `ScreenInstruction` | UI 渲染、tab/pane 管理、布局应用 |
| PTY | `pty_thread_main()` | `PtyInstruction` | 终端进程 spawn/kill、PTY I/O |
| Plugin | `plugin_thread_main()` | `PluginInstruction` | WASM 插件加载/卸载、事件分发 |
| PTY Writer | `pty_writer_main()` | `PtyWriteInstruction` | 异步写入 PTY fd |
| Background Jobs | `background_jobs_main()` | `BackgroundJob` | HTTP 下载、文件 I/O |

线程间通信通过 **类型安全的消息通道**（typed instruction enums + MPSC），Route 线程充当中心调度器，将用户 Action 转换为目标线程的指令。

### 1.2 核心设计原则

1. **进程隔离**：Client/Server 独立进程，Client 挂掉不影响 Session
2. **线程专业化**：每个子系统独立线程，不互相阻塞
3. **类型安全消息**：编译期保证消息类型正确，不存在无效消息
4. **插件沙箱**：WASM 沙箱 + 显式权限，插件间完全隔离
5. **配置级联**：默认值 → 用户配置 → 运行时覆盖，清晰优先级

---

## 2. 配置系统：KDL

Zellij 使用 [KDL](https://kdl.dev/)（不是 YAML/TOML）作为配置语言。macOS 默认路径：`~/Library/Application Support/org.Zellij-Contributors.Zellij/config.kdl`

### 2.1 配置热加载

Zellij **主动监听配置文件变化**，大多数字段即时生效，无需重启。这使得调试配置极其高效。

### 2.2 关键配置块

```kdl
// 主题
themes {
  default {
    fg "#cdd6f4"
    bg "#1e1e2e"
    // ...
  }
}

// 快捷键（分模式）
keybinds {
  normal {
    bind "Ctrl g" { SwitchToMode "locked"; }
    bind "Alt n" { NewPane; }
    bind "Alt h" "Alt Left" { MoveFocusOrTab "Left"; }
  }
  pane {
    bind "h" "Left" { MoveFocus "Left"; }
    bind "p" { SwitchFocus; }
  }
  locked {
    bind "Ctrl g" { SwitchToMode "normal"; }
  }
  // resize, scroll, session, tab, move, tmux 等模式
}

// 插件声明
plugins {
  autolock location="https://github.com/.../zellij-autolock.wasm" {
    is_enabled true
    triggers "nvim|vim|git|fzf|zoxide"
  }
}

load_plugins {
  autolock
}

// 布局文件也可独立
// zellij -l my-layout.kdl
```

### 2.3 布局系统

布局文件定义 pane 和 tab 的排列：

```kdl
layout {
  tab name="dev" {
    pane split_direction="vertical" {
      pane command="nvim"
      pane size="30%" command="lazygit"
    }
  }
  tab name="server" {
    pane command="npm run dev"
  }
}
```

支持：tiled panes、floating panes（可指定位置/大小）、stacked panes。

---

## 3. 插件系统：WASM 沙箱

### 3.1 为什么是 WASM

- **语言无关**：任何编译到 WASM 的语言都能写插件（Rust 官方支持，社区有 Python/Go 方案）
- **沙箱隔离**：插件崩溃不影响核心系统，恶意识别通过权限系统控制
- **免编译分发**：`.wasm` 二进制跨平台直接运行
- **与 pane 平权**：插件是 workspace 中的一等公民，可渲染 UI、订阅事件、控制 Zellij

### 3.2 开发模型

使用 `zellij-tile` crate（Rust），核心 trait：

```rust
use zellij_tile::prelude::*;

#[derive(Default)]
struct MyPlugin;

impl ZellijPlugin for MyPlugin {
    fn load(&mut self, configuration: BTreeMap<String, String>) {
        // 订阅事件
        subscribe(&[EventType::KeyPress, EventType::PaneUpdate]);
    }

    fn update(&mut self, event: Event) -> bool {
        // 处理事件，返回 true 触发 render
        true
    }

    fn render(&mut self, rows: usize, cols: usize) {
        // 渲染 UI
        println!("Hello from plugin!");
    }
}

register_plugin!(MyPlugin);
```

还有 `ZellijWorker` trait 用于后台长运行任务。

### 3.3 内置插件（Zellij 自身 UI 就是插件构建的）

- **Status Bar**：状态栏
- **Tab Bar**：标签栏
- **Session Manager**（`Ctrl o + w`）：可视化会话切换
- **Welcome Screen**：启动界面
- **Strider（Filepicker）**：文件系统导航 + 模糊查找
- **Configuration Screen**：交互式配置管理

这些全部开源在 `zellij-org/zellij/tree/main/default-plugins`，可作为插件开发参考。

---

## 4. 核心 UX 特性

### 4.1 浮动窗格（Floating Panes）

- 快捷键 `Alt f` 切换显示/隐藏
- 可拖动（鼠标或键盘 `Ctrl h + 方向`）
- 可置顶（Pinned）：`Ctrl p + i`，始终悬浮在上层
- 持久化：隐藏后进程继续运行
- 典型用途：跑测试、tail 日志、实时监控

### 4.2 堆叠窗格（Stacked Panes）

- `Alt +` 将 pane 堆叠到相邻 pane，`Alt -` 解堆叠
- 堆叠后在有限空间内保持多个 pane 可见（标题栏可见）
- 支持堆叠 resize 算法：按 30% 屏幕比例调整，有 undo chain
- 可对整叠 split（`Ctrl p + r/d`），新 pane 加入堆叠

### 4.3 会话管理

- **Session Manager**（`Ctrl o + w`）：可视化切换、创建、管理
- **Session Resurrection**：关闭的 session 可复活，跨重启保留 pane 结构和命令
- **Welcome Screen**（`zellij -l welcome`）：终端"开始菜单"

### 4.4 Web 客户端与协作

- 内建 Web Server，浏览器直接访问 session
- URL 书签：`http://localhost:8082/my-project`
- 远程 session：`zellij attach https://my-server:8082/my-session`
- 只读分享 token：观察者模式
- 多人协作：真正的 multiplayer 支持

### 4.5 多 Pane 批量操作

- `Alt + 左键拖拽` 多选 pane
- 批量关闭、移动到新 tab、堆叠、切换焦点

---

## 5. Neovim 集成：两种路径

Zellij 和 Neovim 存在键位冲突（`Ctrl o`/`Ctrl t`/`Ctrl p` 等），核心矛盾：Zellij 用 Ctrl 切换模式，Neovim 用 Ctrl 做编辑操作。社区有两种解决方案：

### 5.1 路径 A：autolock 插件（推荐大多数用户）

安装 `zellij-autolock`，自动检测 Neovim 进程并锁定 Zellij：

```kdl
plugins {
  autolock location="https://github.com/fresh2dev/zellij-autolock/releases/latest/download/zellij-autolock.wasm" {
    is_enabled true
    triggers "nvim|vim|git|fzf|zoxide|atuin"
    reaction_seconds "0.3"
  }
}
load_plugins { autolock }
```

进入 Neovim 时 Zellij 自动锁定（键位全部传给编辑器），退出时自动解锁。

### 5.2 路径 B：tmux 模式（深度 tmux 用户迁移）

清空 Normal 模式所有快捷键，以 tmux 模式作为枢纽：

```kdl
keybinds {
  normal clear-defaults=true {
    bind "Ctrl f" { SwitchToMode "Tmux"; }
  }
  tmux clear-defaults=true {
    bind "Ctrl f" { Write 2; SwitchToMode "Normal"; }
    bind "Esc" { SwitchToMode "Normal"; }
    bind "g" { SwitchToMode "Locked"; }
    bind "p" { SwitchToMode "Pane"; }
    bind "t" { SwitchToMode "Tab"; }
    bind "n" { SwitchToMode "Resize"; }
    bind "h" { SwitchToMode "Move"; }
    bind "s" { SwitchToMode "Scroll"; }
    bind "o" { SwitchToMode "Session"; }
    bind "q" { Quit; }
  }
}
```

Normal 模式完全透明（所有键直达 Neovim），需要 multiplexer 功能时 `Ctrl f` 进入 tmux 模式再操作。这对重度 Neovim 用户最友好。

### 5.3 Ghostty + Zellij 特定冲突

macOS 上 Ghostty 的 `macos-option-as-alt = true`（Zellij 需要 Alt 键）会导致：

- `Option+Right` → `ESC+f` → Zellij 解释为 `Alt+f`（ToggleFloatingPanes）
- `Option+Left` → `ESC+b` → Zellij 解释为 `Alt+b`

修复：将 `Alt f` 重绑到 `Alt Shift f`，移除 `Alt left`/`Alt right` 绑定。

---

## 6. 与 tmux 的对比

| 维度 | tmux | Zellij |
|------|------|--------|
| 语言 | C | Rust |
| 配置语言 | 自定义 | KDL |
| 配置热加载 | `tmux source-file` | 自动监听 |
| 插件系统 | tpm + shell 脚本 | WASM 沙箱 |
| UI 组件 | 需外部工具 | 内置 status-bar/tab-bar/session-manager |
| 浮动窗格 | 通过插件实现 | 原生支持 |
| 堆叠窗格 | 无 | 原生支持 |
| 会话复活 | 需插件（tmux-resurrect） | 内置 |
| Web 客户端 | 第三方方案 | 内置 |
| 多人协作 | 无 | 内置 |
| 学习曲线 | 陡峭（需记快捷键） | 温和（屏幕提示 + 模式 UI） |
| 键位冲突 | 可完全自定义 | 模式化，但 Neovim 有冲突 |
| 成熟度 | 15 年+，生态庞大 | 5 年，快速增长 |

---

## 7. 与 froQ 工具链的关联

froQ 使用的工具链：Ghostty + Zellij + Neovim（含 Zellij 托管常驻进程）。从这个组合看：

1. **键位策略选择**：如果 froQ 使用 `autolock` 路径，则无需重映射；如果用 tmux-mode 路径则需自定义配置
2. **hiatus Julia 项目**：可利用 Zellij 布局文件创建专用 workspace（一个 tab 跑 Julia REPL，一个跑脚本，一个监视输出）
3. **多 Agent 架构**：Zellij 的 session resurrection 对多窗口工作流有长期价值（跨重启恢复复杂 workspace）
4. **远程访问**：如果需要远程跑 hiatus 的长时间计算，Web client 比 SSH + tmux 更轻量

---

## 8. 推荐社区插件

- **zellij-autolock**：自动锁（Neovim 用户必装）
- **zellij-forgot**：`Ctrl y` 模糊搜索快捷键（学习期神器）
- **zellij-whale**：Docker 容器内自动 attach
- **monocle**：专注模式（自动全屏当前 pane）

---

## 参考

- 官方文档：https://zellij.dev/documentation/
- 架构分析：https://deepwiki.com/zellij-org/zellij/2-architecture
- Ghostty + Zellij 配置指南：https://lysenko.dev/posts/ghostty-zellij-bootstrap-kit-for-neovim-users/
- Zellij + Neovim tmux 模式：https://shoukoo.github.io/blog/zellij-love-neovim/
