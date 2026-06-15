# Swift / iOS 生态 2026：WWDC26 后的全景图

> 2026-06-15 巡检自主学习笔记
> 来源：WWDC26 What's New in Swift (Session 262)、Apple Newsroom 2026-06-08、blakecrosley.com 深度解读

蛙蛙近期活跃于 iOS/Swift 子任务，WWDC26 刚落下帷幕（6 月 8-12 日），Swift 生态发生了一系列根本性变化。本篇梳理对开发者最相关的变更。

---

## Swift 6.3 & 6.4：一次发布两个版本

Apple 首次在同一个 WWDC 周期内联合发布两个 Swift 版本。变化清晰分为两层：日常人体工学改进，和面向性能敏感代码的所有权系统落地。

### 日常人体工学（每个开发者都会感受到的）

- **`any P?` 不再需要括号**——以前 `let x: (any P)?`，现在 `let x: any P?`
- **`anyAppleOS` 统一平台版本声明**——把十几个 `@available` 平台名压缩成一个。有例外时用 `anyAppleOS` 做默认值，再加平台特定属性
- **`@diagnose` 属性**——在单个声明级控制警告行为：可以只在某函数内压制 depreciation 警告而不影响项目全局，也可以在某安全关键函数内启用严格内存安全检查
- **`::` 模块选择器**——当两个模块都导出同名类型时，`Rocket::SaturnV` 明确指向模块而非类型。避免 dot syntax 的歧义
- **`defer` 中调用 async 函数**——旧限制已移除，异步清理现在和同步清理一样自然
- **`~Sendable` 语法**——显式声明一个类型不应是 Sendable，不阻止子类成为 Sendable
- **`weak let` 支持**——原只需 `@unchecked Sendable` 因为有 `weak var` 的类，切到 `weak let` 即可通过完整 Sendable 检查

### 所有权系统到达普通代码（值得深读的部分）

这是多年的编译器项目落地到日常类型的关键时刻。

**核心思想**：数据要从一处到另一处时，传统做法是拷贝。如果存储空间保持分配且双方遵守 Swift 的独占规则，拷贝就是不必要的。**borrow** 授予对现有存储的读访问而不拷贝；**mutate** 授予独占写访问。编译器在编译期验证两者。

具体落地：

- **`Iterable` 协议**——新的 for-in 循环载体，元素通过 borrow 而非拷贝获取。支持不可拷贝元素，跳过引用计数开销。一个 `for` 循环优先尝试 `Sequence`，回退到 `Iterable`。`Iterable` 迭代器批量返回 span（而非逐个返回），对可一次性返回全部元素的类型显著提升效率
- **`borrow`/`mutate` 访问器**——替代 `get`/`set`。以 2KB 的 `UniqueBox` 为例：用 `get`/`set` 改一个元素要完整拷贝进出；用 `borrow`/`mutate` 直接原地修改，并支持不可拷贝值
- **新标准库类型**：
  - `UniqueArray`——不可拷贝版 Array，存储不可拷贝元素且无引用计数开销，不固定大小
  - `UniqueBox`——使用新访问器的标准库类型
  - `Continuation`——编译期确保恰好 resume 一次，比 `CheckedContinuation` 更安全、与 `UnsafeContinuation` 一样高效
  - `Ref`/`MutableRef`——单值的 borrow/mutation 容器，可存变量、传递、返回、用于泛型类型
- `Equatable`、`Comparable`、`Hashable` 现可用于不可拷贝类型
- 关联类型现在可以是不可拷贝或不可逃逸的

### 标准库与 Foundation

- **任务取消屏蔽**：`withTaskCancellationShield`——在一段短区域内取消检查始终返回 false，确保磁盘写入等异步清理能在任务取消后跑完
- **`mapKeyedValues`**：同时传入 key 和旧值，替代 `mapValues` 后手动重建字典
- **新文件路径类型**：基于 Swift System，处理平台差异
- **Foundation 继续迁移**：`Data` 更快的 span 访问、比较、迭代、修改；`NSURL` 和 `CFURL` 统一为单一 Swift 实现，更快更省内存；`ProgressManager` 新进度报告类型（原生 async/await）；`Subprocess` 包 1.0 发布

---

## Xcode 27：Agentic Coding 时代

Xcode 27 是 Apple silicon only，体积缩小 30%，性能提升，可自定义工具栏和主题系统。

**Agentic Coding** 是今年的主角：

- 接入 Anthropic、Google、OpenAI 的模型和 agent
- 对话式 agent 支持交互式规划、多轮 Q&A、内嵌 Markdown 渲染、代码变更预览
- Agent 能自行验证工作（写并运行测试、在 Playgrounds 中隔离尝试想法、用 Preview 检查视觉变更、在 Device Hub 中与模拟器交互）
- **插件系统**：通过 MCP（Model Context Protocol）和 Agent Client Protocol 扩展。GitHub 和 Figma 首批提供无缝集成
- Xcode Cloud 速度翻倍，新增 Metal 应用和 visionOS 构建支持

> 对 CLI 优先的蛙蛙来说：Xcode 的 agentic coding 能力通过 MCP 协议开放，意味着 Neovim 端也能接同样的 agent API。这不是换工具的问题，是生态能力外溢。

---

## SwiftUI 2026：Liquid Glass + 性能内建

- **Liquid Glass** 设计语言持续演进：用户可调透明度滑块、更佳可读性、无障碍适配
- SwiftUI 无需改代码即可更高效：状态初始化优化、布局渲染加速
- **更少的自定义 UI 需求**：系统组件覆盖更多场景

---

## 跨平台：Apple 终于认真了

2026 年是 Swift 跨平台动作最大的一年：

- **官方 Android SDK** —— 通过 swift.org 分发，不再只是社区项目
- **WebAssembly 桥接加速** —— JavaScript 互操作更快
- **`@C` 属性** —— 将 Swift 函数导出到 C，反向桥接
- **Swift Build 后端** —— 现在默认驱动 Swift Package Manager，已测试数千个开源包

这意味着 Swift 不再只是 Apple 平台语言。对蛙蛙作为「系统构建者」的定位：Swift 值得作为通用语言纳入工具箱。

---

## MLX Swift：Apple Silicon 上的数值计算

值得特别关注，因为它桥接了蛙蛙的环境科学/GIS 背景与 iOS 开发：

- NumPy 风格的数组计算，自动 GPU 执行
- `grad` 自动微分
- 同一引擎同时服务 Swift、Python、C++、C 前端
- gRPC Swift 也达到生产就绪：从 `.proto` 文件生成类型化客户端，同时支持 unary 和 bidirectional streaming RPC，可部署到 Linux 容器

---

## Intelligence Frameworks：AI 内建

- **App Intents + Siri AI**：应用内容和能力更易被系统发现，支持个人上下文理解、应用动作、屏幕感知
- **Foundation Models 框架**：单一原生 Swift API，支持更强端侧模型（含图像输入）、服务器模型、自定义技能
- **Apple × Google Gemini**：新一代 Foundation Models 与 Gemini 合作定制，Apple Silicon 和 Private Cloud Compute 上运行
- **Core AI 框架**：专为在设备上运行模型设计，利用 Apple silicon 统一内存和 Neural Engine 架构优化，可在设备上部署完整 LLM
- **Small Business Program**：App Store 首次下载量 < 200 万的开发者可免费使用 PCC 上的 Foundation Models

---

## 测试生态成熟

- **Swift Testing ↔ XCTest 双向互操作**：四种模式（limited / complete / strict / none），Xcode 27 默认启用 complete
- 从此 XCTest 断言在 Swift Testing 测试中正常工作，反之亦然
- 迁移路径清晰：不必一次性全部迁移

---

## 对蛙蛙的意义

1. **所有权系统对「模拟器思维」的吸引力**——borrow/mutate 的编译期保证是架构层面的优雅，和蛙蛙对「工具有底层拓扑」的追求一致
2. **跨平台不再是口号**——Android SDK 官方支持让 Swift 成为真正的通用语言，降低了「只服务 Apple 平台」的心理门槛
3. **MLX Swift 桥接 GIS 背景**——如果之后想做 iOS 上的空间数据处理或科学可视化原型，MLX Swift 和 gRPC Swift 提供了不绕道 Python 的路径
4. **Agentic Coding 的 MCP 协议**——Neovim 也能接入同样的 agent 生态，新旧工具链之间的鸿沟在变窄
5. **Foundation 重写为纯 Swift**——底层质量提升意味着 Swift 在系统编程层面的可信度在上升

---

_2026 年的 Swift 正在从「Apple 平台的 Objective-C 替代品」转变为真正的多范式、跨平台系统语言。所有权系统的落地是架构层面的里程碑，而 Agentic Coding + MCP 的开放则在工具链层面打开了新的可能性。_
