# GIS 坐标系统与空间数据基础设施 —— 从球体到像素的完整链路

> 巡检轮次：2026-06-01 16:00 · 自主学习

## 0. 为什么这一轮

前 61 轮巡检覆盖了 hiatus 方法论、博客全栈架构、工具链生态、IMRaD 写作五部曲、学术出版全流程、六个兴趣领域、系统哲学、命名、typography——但 froQ 的「GIS 面具」始终未被正面处理。

坐标系统是 GIS 的骨架。选错投影，面积计算错误，距离失真，数据对不齐——这些错误沉默、难以发现、后果严重。对 hiatus 项目而言，湖泊数据从 ERA5 的 0.25° 网格到站点尺度分析，每一步都涉及空间参考的隐式选择。

---

## 1. 基本概念三层

### 1.1 地球形状的近似链

```
真实地球 → 大地水准面 (Geoid) → 参考椭球体 (Ellipsoid) → 大地基准 (Datum)
```

- **大地水准面 (Geoid)**：重力等位面，海平面在理想状态下的延伸。不规则，无法用简单数学描述。
- **参考椭球体 (Ellipsoid)**：数学上可处理的近似。WGS84 椭球体参数：半长轴 a = 6,378,137 m，扁率 1/f = 298.257223563。
- **大地基准 (Datum)**：将椭球体锚定到地球上的具体位置。WGS84 是全球基准；各个国家和地区有自己的局部基准（如 NAD83 北美、ETRS89 欧洲、CGCS2000 中国）。

关键洞察：**同一对经纬度坐标，在不同 datum 下指向地面上不同的点**。datum 转换（Helmert 7 参数 / Molodensky / 网格校正文件 NTv2）是 GIS 中沉默的精度杀手。

### 1.2 Geographic CRS（地理坐标系）vs Projected CRS（投影坐标系）

| | Geographic CRS | Projected CRS |
|---|---|---|
| 坐标单位 | 角度（度） | 长度（米） |
| 坐标范围 | lat [-90, 90], lon [-180, 180] | 依投影而定 |
| 典型 EPSG | 4326 (WGS84) | 3857 (Web Mercator), 326xx (UTM) |
| 用途 | 存储、交换、GPS | 测距、算面积、制图显示 |
| 本质 | 球面上的位置 | 平面上的位置 |

一句口诀：**数据用 Geographic 存，分析用 Projected 算，展示按需投影**。

---

## 2. 三大日常 CRS 详解

### 2.1 WGS84 (EPSG:4326) —— 通用语

- GPS 卫星的输出格式
- GeoJSON 标准（RFC 7946 强制要求）
- 几乎所有全球数据集的分发格式（OSM、GADM、NASA、UN）
- ERA5 数据的输出坐标系统

WGS84 是全球数据交换的 lingua franca。存数据永远用 WGS84。

### 2.2 Web Mercator (EPSG:3857) —— 网页地图的既成事实

- Google Maps 2005 年引入
- 将 WGS84 椭球体当作球体（R = a = 6,378,137 m）应用 Mercator 公式
- **非保角**（对球体应用椭球坐标的 Mercator 公式，破坏了 conformality）
- 核心优势：tile 是正方形，缓存和索引极其简单
- EPSG 官方名称：WGS 84 / Pseudo-Mercator，因为官方不认可其数学正确性

**Web Mercator 的致命缺陷**：
- 面积随纬度严重失真（格陵兰 ≈ 非洲大小）
- 距离在高纬度被拉伸
- 极点附近（|lat| > 85.06°）完全不可用

**使用原则**：
- 永远不要在 Web Mercator 中计算面积或距离
- 数据显示 → Web Mercator 可以，但要知道你看到的是扭曲的
- 数据分析 → 用等面积投影或 UTM

### 2.3 UTM (Universal Transverse Mercator) —— 区域分析的标配

- 地球分 60 个经度带，每带 6° 宽
- 横轴墨卡托投影（Transverse Mercator），保角
- 坐标单位：米
- 每带内 distortion < 0.1%
- EPSG: 北半球 32601-32660，南半球 32701-32760

**UTM 选择**：
- 南京（118.8°E）→ UTM Zone 50N (EPSG:32650)
- 研究区跨多带 → 选包含数据最多的带，或用等面积投影

**UTM 的局限**：
- 跨 Zone 边界数据有 10-15% 误差
- 极地（>84°N 或 >80°S）用 UPS（Universal Polar Stereographic）替代

---

## 3. 等面积投影 —— 科学分析的基石

在面积相关的分析中（湖泊面积变化、冰盖范围、森林覆盖），必须用等面积投影。TM/UTM 是保角的，面积误差随距离中心经线增大而增大。

| 投影 | 类型 | 适用场景 | EPSG 示例 |
|---|---|---|---|
| Albers Equal-Area Conic | 圆锥等面积 | 中纬度东西延伸区域 | ESRI:102003 (USA) |
| Sinusoidal | 伪圆柱等面积 | 全球栅格数据 | MODIS 默认投影 |
| Mollweide | 伪圆柱等面积 | 全球专题图 | ESRI:54009 |
| Equal Earth | 伪圆柱等面积 | 全球专题图（2018 年改进版） | EPSG:8857 |
| Lambert Azimuthal Equal-Area | 方位等面积 | 极地、半球 | EPSG:3035 (ETRS89-LAEA Europe) |

实际案例：PMC 研究（2013）显示，1,000 ha 地块在 UTM（6° 带）中面积误差可达 6,000 m²，在 Albers 等面积投影中小于 1 m²。对于全球尺度的湖泊温度分析，面积计算不是核心，但如果要计算湖面面积、冰盖范围、或验证数据覆盖度——**必须用等面积投影**。

---

## 4. ERA5 的空间参考 —— hiatus 项目的数据起点

ERA5 的空间参考来自 ECMWF 官方文档，有几个关键点：

### 4.1 原生数据格式
- ERA5 在 ECMWF 内部以 spectral coefficients（谱系数）或 reduced Gaussian grid（N320）存储
- 下载时转为 NetCDF → **自动插值到 0.25° × 0.25° 规则经纬度网格**
- 坐标系统：Decimal Degrees, lat/lon, 基于 WGS84 datum
- 纬度范围 [-90, +90]，经度范围 [0, 360]（部分软件自动显示为 [-180, +180]）

### 4.2 网格约定 —— silent gotcha
ERA5 的 0.25° 网格有精确的像素排列约定：

```
top left 数据点：Lon = 0°, Lat = 90°
bottom right 数据点：Lon = 360° - r = 359.75°, Lat = -90°
```

这意味着**每个数据点是网格中心点（centroid），坐标就是整数 0.25° 的倍数**：
- (0.00°, 90.00°), (0.25°, 90.00°), ... (359.75°, -90.00°)
- 共 1440 × 721 = 1,038,240 个格点

当用 raster 包读取时，extent 可能显示为 `-0.125, 359.875, -90.125, 90.125`——这是网格单元角点的坐标，不是数据点坐标。理解这个约定对数据分析和可视化至关重要。

### 4.3 与湖泊数据对接
hiatus 项目中，ERA5 的 0.25° 格点需要与具体湖泊位置对接：
- ESA CCI Lakes 数据集采用 WGS84
- 湖泊多边形（shapefile/GeoJSON）→ 提取对应格点的时间序列
- **空间分辨率 0.25° ≈ 27.8 km（赤道）**→ 一个小湖可能只落在 1-2 个格点上
- 对面积 < 500 km² 的湖泊，单个 ERA5 格点的代表性需要慎重评估

---

## 5. 工具链：PROJ + GDAL

### 5.1 PROJ —— 坐标转换的底层引擎

PROJ（proj.org）是几乎所有现代 GIS 软件（QGIS、ArcGIS、PostGIS、GDAL、rasterio、geopandas）的底层坐标转换库：

- C/C++ 实现，X/MIT 许可证
- 支持 100+ 种地图投影
- **Transformation Pipeline 架构**（PROJ 6+）：将坐标转换建模为 Unix 管道式链式操作
  - 例如 Helmert 7 参数 datum 转换 → 三步骤：geodetic→cartesian → Helmert → cartesian→geodetic
- 支持时间依赖的 datum 转换（如 ITRF2000→ETRS89）
- PROJ 9.5.0（2024 年发布）为最新稳定版

**Pipeline 的核心思想**：复杂的坐标变换不是一步完成的魔法，而是一系列可组合、可替换的基本操作串联。与 Unix 管道的哲学完全同构。

### 5.2 GDAL —— 空间数据的瑞士军刀

GDAL（Geospatial Data Abstraction Library）是读写、转换、处理几乎所有地理空间格式的库：

- NetCDF → GeoTIFF 转换（gdal_translate）
- 重投影（gdalwarp）
- 矢量重投影（ogr2ogr / gdal vector reproject）
- 格式支持：NetCDF/HDF5/GeoTIFF/GeoJSON/Shapefile/GPKG/...

**hiatus 项目中的典型使用场景**：
```bash
# 从 ERA5 NetCDF 中提取子区域并重投影
gdalwarp -t_srs EPSG:32650 -te <xmin> <ymin> <xmax> <ymax> \
  NETCDF:"era5_lswt.nc":lswt output.tif
```

Python 侧用 rasterio / rioxarray 更自然，但底层调用的是同一个 PROJ/GDAL 引擎。

---

## 6. 决策框架

### 6.1 投影选择的四个核心问题

1. **分析目的是什么？**
   - 面积计算 → 等面积投影
   - 距离/方向 → 等距投影或 UTM（区域尺度）
   - 形状比较 → 保角投影（UTM、Lambert Conformal Conic）
   - 全球可视化 → 妥协投影（Equal Earth、Robinson、Winkel Tripel）

2. **研究区有多大？**
   - < 6° 经度宽 → UTM（单 Zone）
   - 中纬度东西延伸（如中国全境）→ Albers Equal-Area Conic
   - 洲际、全球 → 等面积伪圆柱投影或直接用 WGS84 + 球面几何

3. **精度要求多高？**
   - 科学出版 → 必须注明投影和 EPSG 代码
   - 数据分析 → 始终在本地 UTM 或等面积投影中计算
   - 可视化展示 → Web Mercator 可接受，但需标注

4. **与谁分享？**
   - 全球数据集用户 → WGS84
   - Web 地图团队 → Web Mercator（显示）+ WGS84（数据交换）
   - 测绘/工程 → 本地投影（如中国 CGCS2000 / GK 分带）

### 6.2 hiatus 项目的推荐投影策略

| 任务 | 推荐 CRS | EPSG |
|---|---|---|
| 数据存储与交换 | WGS84 | 4326 |
| 全球湖泊分布图（显示） | Equal Earth 或 Robinson | 8857 / ESRI:54030 |
| 区域放大图（某一大陆） | 对应 UTM Zone 或 Albers | 326xx / 自定义 |
| 面积相关分析（冰盖范围等） | 等面积投影 | Mollweide 或 Sinusoidal |
| 湖泊-格点对应（空间连接） | WGS84（避免重投影误差） | 4326 |
| 距离/相邻关系计算 | 对应 UTM Zone | 326xx |
| 论文最终地图 | 按期刊规范 | 查询期刊 author guidelines |

---

## 7. 常见陷阱清单

1. **混淆 WGS84 和 Web Mercator**——把米当度用，数据飞到太平洋
2. **在 Web Mercator 中计算面积**——格陵兰看起来和非洲一样大，但实际 1/14
3. **跨 UTM 带不重投影**——Zone 边缘数据有 10-15% 变形
4. **ERA5 的经度范围是 [0, 360] 而不是 [-180, 180]**——数据框截取时可能丢失一半格点
5. **ERA5 格点是中心点坐标，不是角点**——用 raster 包时 extent 偏移 0.125°
6. **Datum 转换被忽略**——WGS84 和 NAD83 目前只差约 1 米，但在精密应用中可导致显著误差
7. **用 EPSG:4326 直接计算距离**——shapely/geopandas 在 geographic CRS 下的距离计算以度为单位的平面近似，高纬度严重失真
8. **NetCDF 自动插值时混用双线性（温度）和最近邻（植被类型）**——ERA5 默认前者连续变量、后者离散变量，自定义提取时需注意

---

## 8. 与 froQ 世界的连接点

1. **模拟器思维与投影选择**：选投影就是选模型。每个投影保留一些属性，牺牲另一些。不存在「正确」的投影，只存在「适合当前分析目的」的投影。这与建模中「all models are wrong, some are useful」同构。

2. **ERA5 0.25° grid → 湖泊尺度的尺度鸿沟**：hiatus 项目用 27.8 km 分辨率的格点数据推断单个湖泊的行为。这是空间分析中经典的 MAUP（可修改面元问题）——聚合尺度改变结论。与 changepoint 检测中的参数敏感性平行。

3. **命名与 EPSG 代码**：EPSG:4326、EPSG:3857——数字作为命名。与 corpus 的 I/II/III/IV/V/VI 编号共享同样的设计直觉：**编号是稳定的锚点，语义随语境浮动**。

4. **PROJ Pipeline 与 Unix 哲学**：链式可组合的基本操作 → 复杂变换。与 Zellij 的管道式窗格管理、Neovim 的插件链同构。

5. **投影是「异质化命名的视觉等价物」**：Mercator 把格陵兰画成非洲大小不是错误，而是一种「异质化的空间命名」——用扭曲制造某种认知效果（对中纬度适航性的强调在航海时代是功能性的，在当代全球南方视角下是政治性的）。

---

## 参考资料

- QGIS Documentation: Coordinate Reference Systems (docs.qgis.org)
- Mapscaping: Web Mercator vs WGS84 Practical Guide
- ECMWF Confluence: ERA5 Spatial Reference
- PROJ 9.8 Documentation (proj.org)
- GDAL NetCDF Driver Documentation
- Usery & Seong (2001): All equal-area map projections are created equal, but some are more equal than others. *Cartography and Geographic Information Science*, 28(3), 183-193.
- PMC 3790990: Selecting Map Projections in Minimizing Area Distortions in GIS Applications
