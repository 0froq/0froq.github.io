# 六大层级模板文件说明

根据你的重构方案，现在需要创建以下六个主模板文件：

## 模板文件清单

### 1. tp_aut.md (Autopsia - 元认知解剖)
```markdown
---
created: {{date}}
layer: autopsia
status: {{status}}
tags: []
last_modified: {{date}}
---

## 元认知解剖：{{title}}

### 当前状态诊断
*何处需要切开？何种病理需要识别？*

### 解剖过程
*刀刃如何转向内部？*

### 病理发现
*发现了什么腐败、断裂或异常？*

### 缝合与学习
*如何与这些疤痕共存？*

---
```

### 2. tp_ing.md (Ingesta - 信息摄取)
```markdown
---
created: {{date}}
layer: ingesta
status: {{status}}
tags: []
last_modified: {{date}}
---

## 摄入记录：{{title}}

### 内容来源
*这个碎片来自何处？*

### 摄入过程
*如何进入 Corpus？是否造成了撕裂？*

### 消化状态
*是否已同化？还是仍在发酵腐败？*

### 标签分类
*使用标签进行精细分类：*
- `#fragmenta` - 奇异反直觉的碎片
- `#reliquia` - 历史遗物和引用
- `#impressio` - 深刻印象
- `#organon` - 工具和方法
- `#toxicon` - 有毒思想

---
```

### 3. tp_neo.md (Neoplasma - 内化思考)
```markdown
---
created: {{date}}
layer: neoplasma
status: {{status}}
tags: []
last_modified: {{date}}
---

## 思维增殖：{{title}}

### 核心脉搏 (Cor)
*这个想法的本体论核心是什么？*

### 血管网络 (Vascula)
*它如何与其他概念连接？*

### 混沌区域 (Oblivium)
*在理解的边缘，有什么混乱和幻象？*

### 爆发点 (Eruptio)
*何时可能产生突破性洞察？*

### 标签分类
- `#cor` - 核心存在论思考
- `#vascula` - 概念连接
- `#abyssus` - 深渊恐惧
- `#nodus` - 复杂纠结
- `#hallucina` - 幻象投射
- `#fluxus` - 情感流变
- `#fractura` - 断裂测量
- `#chimera` - 混合构造

---
```

### 4. tp_put.md (Putredo - 腐败复盘)
```markdown
---
created: {{date}}
layer: putredo
status: {{status}}
tags: []
last_modified: {{date}}
---

## 腐败记录：{{title}}

### 今日瘴气 (Miasma)
*今天产生了什么疲倦、绝望或有毒的vapor？*

### 项目溃疡 (Ulcus)
*哪些工作在腐烂？哪些需要截肢？*

### 挖掘过往 (Exhumatio)
*从历史中挖出了什么？是启示还是腐蚀？*

### 时间的教训
*腐败中学到了什么？*

### 标签分类
- `#miasma` - 日常毒素
- `#ulcus` - 项目问题
- `#exhumatio` - 过往挖掘
- `#temporal` - 时间性反思

---
```

### 5. tp_del.md (Delirium - 审美材料)
```markdown
---
created: {{date}}
layer: delirium
status: {{status}}
tags: []
last_modified: {{date}}
---

## 谵妄神殿：{{title}}

### 奇迹收藏
*这个审美对象有何令人震颤的特质？*

### 理性的破碎
*它如何击碎了常规的认知框架？*

### 美的暴力
*带来了怎样的美学冲击？*

### 谵妄的智慧
*在疯狂中隐藏着什么真理？*

### 标签分类
- `#aesthetic` - 美学材料
- `#sublime` - 崇高体验
- `#uncanny` - 诡异感受
- `#transcendent` - 超越性

---
```

### 6. tp_vig.md (Vigil - 守夜创作)
```markdown
---
created: {{date}}
layer: vigil
status: {{status}}
tags: []
last_modified: {{date}}
---

## 守夜记录：{{title}}

### 夜间见证
*在死者中保持清醒，见证了什么？*

### 非理性创作
*理性失效时，什么在涌现？*

### 持续的脉搏
*是什么让意识在疲惫中坚持？*

### 守夜的证词
*这个循环的见证者记录了什么？*

### 标签分类
- `#nocturnal` - 夜间思考
- `#creative` - 创造性涌现
- `#endurance` - 坚持见证
- `#liminal` - 边界状态

---
```

## 论文模板 (保持不变)
tp_rel_paper.md 保持现有结构，用于学术引用的特殊处理。

## 使用说明

1. **简化命令**：现在只需要 `corpus create aut` 或直接 `corpus aut`
2. **标签系统**：在每个模板中手动添加标签，实现渐进式分类
3. **闪念笔记**：使用 `corpus aut --insta` 或 `corpus aut -i` 进入即时记录模式
4. **论文处理**：使用 `corpus ing paper @citation` 保持特殊处理

这个重构完全符合你的六大层级架构，消除了过度分化的问题，同时通过标签系统保持了细分的可能性。