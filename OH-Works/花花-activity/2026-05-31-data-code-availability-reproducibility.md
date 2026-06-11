# 数据与代码可用性：气候科学论文的可复现性最佳实践

**巡检轮次**：2026-05-31 12:00
**直接支撑**：board 活跃任务「补 methods/data 细节」、论文投稿准备
**前序知识**：Methods 写作 (05-31 02:00)、期刊选择策略 (05-31 09:00)、图表设计 (05-31 07:00)

---

## 1. 为什么现在关注这个

IMRaD 写作五部曲和图表设计方法论已闭合，期刊选择策略已出（推荐 ERL），论文叙事收敛在即。接下来投稿时，**Data Availability Statement + Code Availability Statement** 是几乎所有地学/气候期刊的硬性要求，不是可选项。

COPDESS（Coalition on Publishing Data in the Earth and Space Sciences）是地球与空间科学数据出版的事实标准制定者。AGU、IOP（含 ERL）、Springer Nature、Science/AAAS 等主要出版商均已签署 COPDESS Statement of Commitment。

**核心原则**：所有理解、评估、复现、扩展研究成果所需的数据和软件，必须在发表时公开可获取。Post-publication embargo 不被接受，「联系作者获取」不被接受（除非有第三方数据限制）。

---

## 2. hiatus 项目涉及的关键数据源及引用规范

### 2.1 ERA5 再分析数据

| 项目                  | 内容                                                                                                                                                                                                                        |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **许可**              | CC-BY（Copernicus 许可）                                                                                                                                                                                                    |
| **引用格式**          | Hersbach, H. et al. (2018): ERA5 hourly data on single levels from 1940 to present. Copernicus Climate Change Service (C3S) Climate Data Store (CDS), DOI: 10.24381/cds.adbb2d47                                            |
| **归因声明**          | "The results contain modified Copernicus Climate Change Service information 2020. Neither the European Commission nor ECMWF is responsible for any use that may be made of the Copernicus information or data it contains." |
| **CDS catalog entry** | 同时引用 Copernicus Climate Change Service (2023) 的 CDS catalog entry（作为数据可追溯来源）                                                                                                                                |
| **注意事项**          | 引用时需注明 Accessed on [日期]，因为 ERA5 数据持续更新。如果使用了特定参数子集（如只用了 2m temperature + lake surface temperature），应在 Methods 中说明具体变量。                                                        |

### 2.2 ESA CCI Lakes / GloboLakes LSWT 数据

| 项目                          | 内容                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **许可**                      | 通过 CEDA 档案访问，通常为开放许可                                                                                                                                                                                                                                                                                                                                                                                     |
| **最新版本引用**              | Carrea, L.; Crétaux, J.-F.; Liu, X.; Wu, Y.; Bergé-Nguyen, M.; Calmettes, B.; Duguay, C.; Jiang, D.; Merchant, C.J.; Mueller, D.; Selmes, N.; Simis, S.; Spyrakos, E.; Stelzer, K.; Warren, M.; Yesou, H.; Zhang, D. (2024): ESA Lakes Climate Change Initiative (Lakes_cci): Lake products, Version 2.1. NERC EDS Centre for Environmental Data Analysis, 04 April 2024. doi:10.5285/7fc9df8070d34cacab8092e45ef276f1 |
| **数据版本**                  | v2.1.0 是目前最新版本，包含 Lake Water Level + Extent + Water-leaving Reflectance + LSWT + Ice Cover                                                                                                                                                                                                                                                                                                                   |
| **LSWT 传感器来源**           | 重处理的 SLSTR-A 和 SLSTR-B                                                                                                                                                                                                                                                                                                                                                                                            |
| **Copernicus CDS 镜像**       | 同时存在于 Copernicus CDS: satellite-lake-water-temperature dataset，与 CEDA 版本可能版本号不同                                                                                                                                                                                                                                                                                                                        |
| **Carrea et al. (2023) 论文** | 作为湖泊 ECV 数据集的描述性论文，在 Methods 中应引用：Carrea, L. et al. (2023) "Lake surface water temperature" [in State of the Climate Report], BAMS                                                                                                                                                                                                                                                                 |

### 2.3 其他可能的数据源

如果 hiatus 项目还使用了以下数据，需逐一确认引用格式：

- **GloboLakes 原始数据集** (v4.5.x)：英国 NERC GloboLakes 项目产出，原始引用需查询 CEDA
- **HydroLAKES / LakeATLAS**：湖泊形态数据（深度、面积等），Messager et al. (2016, Nature Communications)
- **HadISST / ERSST**：如果涉及海洋 SST 对比
- **CMIP6 模式输出**：如果涉及模式验证

---

## 3. Data Availability Statement 模板

### 3.1 AGU 格式（最详尽，推荐参考）

AGU 要求 Availability Statement 放在 Open Research 部分，包含：

1. 许可/权限（如 CC-BY）
2. 访问条件（如是否需要注册）
3. 软件版本和开发平台链接（如 GitHub）
4. References 中的引用（DOI 必须引用）
5. DOI（持久标识符）或链接
6. 存储库名称
7. 数据/软件类型简述

**模板——数据**：

```
The [type of data] data used for [brief context] in this study are available
at [repository name] via [DOI/URL] with [license type]. [Citation in References].
```

**模板——软件**：

```
[Version number] of [software name] used for [brief context] is preserved at
[DOI], available via [license], and developed openly at [GitHub URL].
[Citation in References].
```

### 3.2 ERL / IOP 格式

ERL 采用 IOP 的 Data Availability Policy。要求：

- 数据可用性声明（Data Availability Statement）为必填
- 强烈推荐小文件（<10MB）以 supplementary data 形式提交
- 大文件推荐使用数据存储库
- DOI 不强制但推荐

ERL 对代码的要求：

- 如果代码是分析的核心，必须可用
- 推荐 GitHub + Zenodo 组合

### 3.3 通用最佳实践（来自 COPDESS）

1. 在论文中包含醒目的数据可用性声明
2. 数据和软件在 References 中引用（不是 acknowledgments）
3. 优选领域专用存储库，其次通用存储库（Zenodo、Dryad、Dataverse）
4. 补充材料（SI）不如专用存储库符合 FAIR 原则
5. 不要使用 Dropbox 等作者可随时修改的平台

---

## 4. 代码归档最佳实践

### 4.1 GitHub → Zenodo 标准工作流

这是目前气候科学界的标准做法，AGU 明确推荐。

**步骤**：

1. 在 Zenodo 中连接 GitHub 账号
2. 在 Zenodo 的 GitHub 页面找到目标仓库，打开开关启用集成
3. 在 GitHub 创建 Release（带版本 tag，如 v1.0.0）
4. Zenodo 自动归档该 release 的 ZIP 快照，生成 DOI
5. 每次新 release 自动生成新版本 DOI，Concept DOI 指向所有版本

**关键细节**：

- 仓库根目录放置 `CITATION.cff` 或 `.zenodo.json` 提供元数据
- `.zenodo.json` 优先级最高 > `CITATION.cff` > `LICENSE` > GitHub 自动提取
- 建议先在 Zenodo Sandbox 测试
- 正式 Zenodo 记录一旦公开无法删除
- **重要**：`CITATION.cff` 中的 version 字段应留空或设为 release tag，否则跨版本会重复

### 4.2 AGU 对代码的要求

- 代码必须在免费开放平台可用（如 GitHub）
- 代码必须在存储库中保存（如 Zenodo）
- 伪代码仅在政策/环境限制无法共享完整代码时接受
- 如果只用了几行利用论文中方程式的代码，在 Availability Statement 中声明即可

### 4.3 Science/AAAS 对代码的要求

最严格：

- 所有核心代码必须在发表前归档到永久公开存储库
- GitHub 不够（因为作者可以后续修改），必须额外归档到 Zenodo 等
- 如果代码无法共享，必须提供伪代码并在 acknowledgments 中解释原因
- 数据和代码必须在 References 中引用，使用 DataCite 格式

### 4.4 双盲审稿时的处理

如果需要双盲审稿，Zenodo 支持 anonymous review link：

- 提交时生成 provisional DOI + private reviewer URL
- 编辑和审稿人可通过 private URL 访问
- 发表时自动公开

---

## 5. 针对 hiatus 项目的具体建议

### 5.1 数据端检查清单

| # | 项目                                | 状态 | 需要做的事                                                                                                                                                                              |
| - | ----------------------------------- | ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 | ERA5 2m temperature                 | ⬜   | 确认使用的参数列表、时间范围、空间分辨率；在 Methods 中说明；在 References 中引用 Hersbach et al. (2018) + CDS catalog；Data Availability Statement 中注明 CC-BY 许可和 Copernicus 归因 |
| 2 | ESA CCI Lakes LSWT                  | ⬜   | 确认使用版本（v2.1.0? 还是 GloboLakes v4.5.x?）；在 References 中引用 Carrea et al. (2024) 数据集；注明 CEDA DOI                                                                        |
| 3 | 湖泊形态数据                        | ⬜   | 如果用了 HydroLAKES/LakeATLAS，引用 Messager et al. (2016)；如果手工整理，需上传到 Zenodo                                                                                               |
| 4 | 生成数据（STL 残差、CP 检测结果等） | ⬜   | 至少上传 figure-level data（图表底层数据为 CSV/NetCDF）；推荐 Zenodo 归档                                                                                                               |

### 5.2 代码端检查清单

| # | 项目              | 状态 | 需要做的事                                                                                    |
| - | ----------------- | ---- | --------------------------------------------------------------------------------------------- |
| 1 | GitHub 仓库整理   | ⬜   | 确保 README 包含运行说明、环境依赖（Julia 版本、包版本、Manifest.toml）；清理死代码和实验脚本 |
| 2 | CITATION.cff 创建 | ⬜   | 仓库根目录添加 CITATION.cff，包含作者、标题、版本、DOI（发布后回填）                          |
| 3 | Zenodo 归档       | ⬜   | 连接 GitHub ↔ Zenodo，创建首个 release，获取 DOI                                              |
| 4 | 论文中引用代码    | ⬜   | 在 References 中引用软件 [Software] 条目，含 DOI、版本号、开发平台链接                        |
| 5 | 许可证选择        | ⬜   | 仓库添加 LICENSE 文件（推荐 MIT 或 CC-BY-4.0）                                                |

### 5.3 草拟：Data Availability Statement

```
The ERA5 hourly reanalysis data (Hersbach et al., 2018) used in this study
were obtained from the Copernicus Climate Change Service (C3S) Climate Data
Store (CDS) at https://doi.org/10.24381/cds.adbb2d47. The results contain
modified Copernicus Climate Change Service information 2020. Lake surface
water temperature observations were obtained from the ESA Lakes Climate
Change Initiative (Lakes_cci) v2.1.0 dataset (Carrea et al., 2024),
available at https://doi.org/10.5285/7fc9df8070d34cacab8092e45ef276f1.
[如果用了 HydroLAKES: Lake morphological data were obtained from
HydroLAKES (Messager et al., 2016).]
The processed data and derived products (STL decomposition results,
changepoint detection outputs, and figure-level aggregated data) that
support the findings of this study are available at Zenodo with the
identifier https://doi.org/10.5281/zenodo.XXXXXXX [待归档后填入].
```

### 5.4 草拟：Code Availability Statement

```
The Julia code (v1.0.0) used for data processing, STL decomposition,
constrained changepoint detection, and archetype classification is
preserved at Zenodo (https://doi.org/10.5281/zenodo.YYYYYYY)
[待归档后填入], available under the MIT License, and developed openly
at https://github.com/[user]/hiatus [待确认仓库是否公开].
```

---

## 6. 关键资源速查

| 资源                   | 链接                                                                        |
| ---------------------- | --------------------------------------------------------------------------- |
| COPDESS 作者指南       | https://copdess.org/                                                        |
| COPDESS 存储库目录     | https://copdessdirectory.osf.io/                                            |
| re3data 存储库注册     | https://www.re3data.org/                                                    |
| ERA5 引用指南          | https://confluence.ecmwf.int/display/CKB/Use+Case+2                         |
| ESA CCI Lakes v2.1     | https://doi.org/10.5285/7fc9df8070d34cacab8092e45ef276f1                    |
| Zenodo-GitHub 集成文档 | https://help.zenodo.org/docs/github/                                        |
| AGU 数据与软件指南     | https://www.agu.org/publications/authors/journals/data-software-for-authors |
| FAIR 原则              | https://www.go-fair.org/fair-principles/                                    |
| DataCite 引用格式      | https://datacite.org/                                                       |

---

## 7. 与论文投稿时间线的衔接

1. **现在（写作阶段）**：确认所有数据源的准确引用格式，在 References 中预留位置，草拟 Data/Code Availability Statement
2. **投稿前**：整理 GitHub 仓库（README、CITATION.cff、LICENSE），打 release tag，触发 Zenodo 归档获取 DOI，回填到论文中
3. **审稿期间**：如果需要双盲，Zenodo 提供 private reviewer link；审稿人可能要求查看代码/数据，需提前准备
4. **接收后**：确认 Zenodo 记录公开，期刊 office 会检查 Data Availability Statement 和 DOI 有效性

---

**与前序笔记的关系**：

- Methods 写作 (05-31 02:00) 中建议的 "Code availability" 子章节 → 本笔记给出了具体模板
- 期刊选择策略 (05-31 09:00) 中 ERL 的 IOP data policy → 本笔记确认了具体要求
- 叙事收敛 (05-30 00:00) → 数据/代码可用性不影响叙事，但在投稿 checklist 上是阻塞项
