# Typst 生态概览与 Julia 集成

_整理于 2026-05-28 19:00 巡检_

---

## 版本时间线

| 版本   | 日期       | 关键特性                                                                                                                      |
| ------ | ---------- | ----------------------------------------------------------------------------------------------------------------------------- |
| 0.13.0 | 2025-02-19 | proper paragraph 概念、outline 改进、曲线函数、raw bytes 传文件、HTML 导出预览                                                |
| 0.14.0 | 2025-10-24 | 可访问性 PDF（默认）、PDF/UA-1 合规、PDF 作为图片、字符级对齐、多 PDF 版本支持（1.4~2.0）、全部 PDF/A 标准、HTML 导出大幅改进 |
| 0.14.2 | 2025-12-12 | WebAssembly 运行时安全修复（最新稳定版）                                                                                      |
| 0.15   | 预计 2026  | 移除 deprecated API，可能有 math precedence 修改、custom elements                                                             |

最新稳定版：**0.14.2**（2025-12-12）。0.15 尚未发布，但 deprecation 清理 PR 已在 2025-07 合并，Laurenz 在 2026-01 的博客中讨论了 0.14→0.15 的升级路径。

---

## 0.14 关键能力（与学术论文相关）

### 可访问性与标准合规

- **PDF/UA-1**：生成符合国际无障碍标准的 PDF，自动检查缺少的标题、错误的 heading 层级、缺失的 alt 描述
- **PDF/A 全系列**：-1b, -1a, -2b, -2u, -2a, -3b, -3u, -3a, -4, -4f, -4e
- **多 PDF 版本**：1.4, 1.5, 1.6, 1.7, 2.0

这对学术出版很重要——很多期刊和机构库要求 PDF/A 格式归档。

### HTML 导出

- HTML 导出仍在活跃开发中，0.14 已覆盖 Model 类别全部元素
- 提供类型化的 HTML API（`html.div` 等）
- 未来可能用于博客/网页展示论文内容

### 排版质量

- 字符级对齐（character-level justification）：显著改善两端对齐文本的外观
- 表格支持多个 header/subheader

---

## Julia ↔ Typst 集成生态

hiatus 项目的分析管线是 Julia，论文用 Typst。以下是两者桥接的工具链：

### Typstry.jl

- JuliaCon 2025 演讲项目
- 「Julia to Typst Interface」：在 Julia 中生成 Typst 代码/文档
- 演讲者：Jakob Krell

### Typst.jl

- Julia 包，调用 Typst 编译器
- 「very fast to compile」是其核心卖点

### jlyfish（Typst Universe 包）

- 反向集成：在 Typst 文档中嵌入 Julia 计算结果
- 理念类似于 knitr（R Markdown）或 Quarto，但针对 Typst

### Makie.jl + MakieTex.jl

- Makie 是 Julia 的主力绘图库
- MakieTex.jl 可以输出 Typst（或 LaTeX）渲染的数学公式和矩阵到图表中
- 工作流：Julia 生成数据 → Makie 绑图 → MakieTex 嵌入 Typst 公式 → 导出

### TypstDocs.jl RFC

- 社区提案（2025-12），用 Typst 替代 Documenter.jl 的 LaTeX 后端
- Julia 社区的 Typst 热情很高

### 实践路径建议

对 hiatus 项目可能的集成方式：

1. **图表管线**：Julia（数据处理 + Makie 绑图）→ 导出 PDF/SVG → Typst `image()` 嵌入
2. **内联计算**：jlyfish 在 Typst 中直接执行 Julia 代码块，输出数值/表格
3. **公式一致性**：MakieTex.jl 确保图表中的数学符号与论文正文 Typst 渲染一致

---

## 学术出版进展

- **IJIMAI 期刊**：已正式接受 Typst 格式投稿，并提供官方 Typst 模板（2026-02）
- **NeurIPS 2026**：已有社区维护的 Typst 模板，支持 anonymous/camera-ready/preprint 三种模式
- **其他模板**：IEEE、ACM、arXiv 等模板在 Typst Universe 和第三方仓库中可用

---

## 1.0 路线图：Edition 机制

Laurenz（Typst 作者）在 2026-01-05 博客《Evolving Typst》中讨论了关键设计：

### 核心矛盾

- Typst 已生产可用，但「远未完成」
- 每次 breaking change 对 Typst Universe 生态有涟漪效应
- 维护者越来越不敢做 breaking change → 拖慢项目演进

### 解决方案：`target` 版本（类似 Rust Edition）

```toml
[package]
compiler = { min = "0.15", target = "0.17" }
```

- `min`：包的最低编译器版本
- `target`：包期望的行为版本。编译器对旧 target 的包保持兼容行为
- 兼容行为不会永久保留（避免编译器代码膨胀），只保留一两个版本作为迁移缓冲
- Laurenz 称之为「deprecation warning on steroids」

### 仍未完成的重大特性

- **Custom elements**：自开源发布以来社区最期待的特性
- **Math precedence 修正**：可能需要自动化迁移工具

---

## 与 hiatus 论文的潜在关联

1. **版本升级**：确认当前使用的 Typst 版本。如果是 <0.14.2，建议升级以获取安全修复
2. **PDF/A 合规**：如果目标期刊要求 PDF/A 归档，0.14 的原生支持可以减少后处理
3. **图表工作流**：Julia Makie → PDF → Typst 嵌入，避免格式转换损失
4. **可访问性**：PDF/UA-1 自动检查可能发现文档结构问题（heading 层级等）
5. **HTML 导出**：未来可用于博客展示论文内容（与 VitePress 博客集成）

---

## 参考来源

- [Typst 0.13 Release Notes](https://github.com/typst/typst/releases/tag/v0.13.0)
- [Typst 0.14 Release Notes](https://github.com/typst/typst/releases/tag/v0.14.0)
- [Evolving Typst (Laurenz, 2026-01-05)](https://laurmaedje.github.io/posts/evolving-typst/)
- [Typstry.jl - JuliaCon 2025](https://www.youtube.com/watch?v=3Ocgztq05lo)
- [TypstDocs.jl RFC](https://discourse.julialang.org/t/rfc-typstdocs-jl-julia-package-documentation-in-typst/134422)
- [Plot Matrices, Formulas in Julia with Typst](https://benediktehinger.de/blog/science/plot-matrices-formulas-in-julia-with-typst-or-latex/)
- [jlyfish - Typst Universe](https://typst.app/universe/package/jlyfish/)
