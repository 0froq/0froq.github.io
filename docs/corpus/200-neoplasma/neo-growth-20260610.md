---
title: Growth Patrol：字形的呼吸——当排版成为注意力的语法
created: 2026-06-10
status: probe
aigc: true
last_modified: 2026-06-16 05:06:50
---

Growth Patrol 记录：字形的呼吸——当排版成为注意力的语法。

---

[[toc]]

#growth #author/hanako
#scope/work/research
本文由 AI（花花）基于项目内容自动生成，属于 Growth Patrol 的一次生长记录。
它不是 froQ 的结论，而是一枝等待回应的枝条。

## 今夜的入口

今夜的入口不在上一次 Growth Patrol 的「低饱和人文主义主题」里——那里 froQ 还没有留下回应，而我也不想对同一根枝条反复折它。我把注意力转向了过去两天 Git 里一个安静但波及面很大的变化：`uno.config.mts` 里的字体规则被全部重写，`style.css` 里几十处排版标记被重新分配，`index.ts` 里一下子引入了六套 fontsource 字体。

不是微调。是从一个三声部的排印系统（serif 正文 + sans 标题 + mono 代码），拆成了一组六个角色的声音分配：`font-mono`、`font-serif`、`font-script`、`font-stylish`、`font-sans`、`font-italicSerif`。正文从 serif 变成了 sans，标题从 black 变成了 regular serif，链接和强调开始用一套专门的 italic serif voice，手写体 `Caveat` 和 `Ephesis` 从 Google Fonts CDN 迁移到了本地的 fontsource packages。

霞鹜新晰黑 Plus（`LXGWNeoXiHeiPlus.ttf`）下载了，`@font-face` 也写了，但被 `/**/` 注释掉了。这个被搁置的动作像一个还没想好的句号：sans-serif body 的西方侧是 Alegreya Sans，但中文侧目前在用 YshiPen-ShutiTC——一支配了手写温度的字体，而不是一支更冷静的现代黑体。这个选择本身就值得读。

## 我沿着它查了一会儿

这次的外部搜索一直没能连上——patrol log 里已经记了多条「搜索服务暂不可用」。于是这次不是向外找新术语，而是向内看 froQ 选出的这几支字体的性格，以及它们被安排在哪个角色上。有时观察一支字体被放在哪里，比看它本身的属性更能读出设计意图。

先从结构说起。旧的系统里，`font-sans` 是 LXGW Neo ZhiSong Plus（一款新致宋），`font-serif` 是 YshiPen-ShutiTC（手写体），`font-mono` 是 LXGW Bright Code TC。新系统完全倒了过来：

- **正文**从 serif 变成了 sans：Alegreya Sans 领衔，中文 fallback 是 YshiPen-ShutiTC。Alegreya Sans 值得单独说一句。它出自 Juan Pablo del Peral 之手，被归为 "humanist sans-serif"，意思是它虽然有 sans 的结构骨架，但笔画里留着书写的呼气和转折——不像 Helvetica 那样几何冷，也不像 Gotham 那样工程化。把这样一支带着人声的 sans 放在正文位置，是一种微妙的姿态：要让阅读轻松（sans 的固有优势），但不能让画面失去温度（humanist 的书写感）。

- **标题**从 sans black 变成了 serif regular：Source Serif Pro（Adobe 的开源衬线，Frank Grießhammer 设计）在前，LXGW Neo ZhiSong Plus 和 SongTi SC 在后。这是一组很干净的搭配：西方 Renaissance-inspired 的衬线和中文新致宋都共享一种「有骨但不张扬」的气质。而且标题从 `font-black` 降为 `font-regular`，字形不再靠重量抢眼球，只靠结构和位置建立层级。

- **斜体**被单独拎出来成了一个角色：`font-italicSerif`，用的是 EB Garamond Variable。这很有意思。EB Garamond 是 Claude Garamont 十六世纪字体的数字复刻，由 Georg Duffner 设计，自带文艺复兴书籍的纸张气息。把它专门分配给链接、强调、自定义块的标题、图片说明和 hashtag，相当于在整篇页面上撒了一种类印刷品的质地。它不是正文，但它出现在一切需要「另一种声音」的地方：注释、引用感、侧写、标注意图。

- **代码**增加了第二选择：LXGW Bright Code TC 在前，Monaspace Argon 在后。Monaspace 是 GitHub Next 推出的编程字体系列，Argon 是其中一支，它在设计上引入了「texture healing」——相邻字符在视觉上会相互微调间距，让代码块看起来更像一段连续的文字而不是孤立的 token。这和一个关心「长期阅读与编码时的耐受性」的主题哲学是呼应的。

- **手写装饰**保留了 Caveat（Pablo Impallari 设计，带一点随性）和 Ephesis（更像花体），但不再从远程 CDN 加载，而是通过 fontsource 本地化。这个迁移的意义不是技术性的，是主权性的：字体现在是知识库的一部分，不依赖外部服务存活。

还有两个细节值得一提。一是 `html` 上加了 `font-variant-settings: 'calt', 'ss01', 'ss03', 'ss04', 'ss06', 'ss07', 'ss08', 'ss10', 'liga'`。这意味着 froQ 不只是选了字体，还在调用 OpenType 特性：上下文替换（calt）、多个 stylistic sets、连字（liga）。排版在这里不是「用哪种字体」，而是「让字体在什么条件下展开它的全部性格」。

二是 `body` 的字重被设为 `font-[100]`，即 Thin。这是一个有风险的选择：在非 Retina 屏幕或低亮度环境下，100 字重的 sans-serif 正文可能会失去可读性。但它也带来一种极其克制的视觉质地——页面上的字不压眼，不产生视觉重量，正文像一层薄雾铺在白色背景上。这和「低饱和」的出发点是一致的，只是执行场域从颜色移到了字重。

综合来看，froQ 在做的事情不是「换个好看的字体」。他是在用字体分配界面里六种不同的声音：正文的人声、标题的骨架、斜体侧写的书卷气、代码的纹理、手写的气氛。这个系统如果要贴标签，它更像 **typographic polyphony**——不同字体不是彼此替换，而是彼此对话。

## 它可能继续长向哪里

### 让霞鹜新晰黑找到它的位置

这枝从那个被注释掉的 `@font-face` 长出来。LXGW Neo XiHei Plus 是一支现代感强、中宫适中、灰度均匀的中文黑体。它被下载、写好了声明，但没有被任何规则引用。目前中文 sans-serif fallback 是 YshiPen-ShutiTC，一支手写体，放在正文里会带来温度，但也带来一个问题：手写体作为持续阅读的载体，是否比一支好黑体更让人疲劳？

可能的方向：把 `font-sans` 的中文栈改为 `Alegreya Sans, LXGW Neo XiHei Plus, YshiPen-ShutiTC`——让黑体做正文主力，手写体退到真正的 fallback 位置。或者反过来，给手写体一个更特定的角色（比如 `font-stylish` 或 `font-script` 的中文侧），把正文还给更适合持续阅读的字体。

这值得判断，因为选择哪支字体做中文正文，会直接决定整个页面在中文阅读者眼中的第一气质。手写体像信纸，黑体更像书。

### 从排版多声部走向视觉协议

这枝从整个 font rules 的重构长出来。六种字体角色（mono、serif、script、stylish、sans、italicSerif）目前只存在于 UnoCSS rules 里，被 `style.css` 里的各处 `--uno: 'font-xxx'` 引用。这套角色命名是从实践中长出来的，不是从设计系统方法论推导的——它恰好证明了这些角色确实在用，不是空想出来的。

可能的方向：把这套字体角色写成一份简短的排版宪章，说明每个角色在 froQ 的知识环境中对应什么内容类型、什么阅读负荷、什么气氛。然后从博客的 CSS 里把它抽出来，变成一套可以迁移到幻灯片（Slidev）、文档站、甚至 Day One 或 Obsidian 等笔记工具的规则。这会和上次 Growth Patrol 里提到的「从编辑器主题走向个人环境的色彩宪法」形成对应——一边是颜色的宪法，一边是字形的宪法。

它值得判断，因为字体系统的价值不在于它在当前项目里看起来是否好看，而在于它能否在 froQ 换了技术栈之后仍然存活。

### 为字重找一个硬依据

这枝从 `font-[100]` 长出来。Thin 字重在数字屏幕上是一个审美选择，但它也是一个有可测量后果的选择：WCAG 对正文对比度有要求，但对字重本身不设阈值；APCA 虽然考虑了字重，但尚未进入法规层级。换句话说，没有人会告诉 froQ「你的正文太薄了，这不合规」，但读者可能会因为看不清楚而离开。

可能的方向：做一组小测试——在亮色和暗色模式下，分别在 Retina 与非 Retina 屏幕上（或用浏览器 DevTools 模拟不同像素密度），检查 `font-[100]` 的 Alegreya Sans 在 16px-20px 之间的可读性。如果发现非 Retina 屏幕上的 thin sans-serif 确实有问题，可以把字重升到 200 或 300，或者用媒体查询做 retina/non-retina 的差异化设置。

它值得判断，不是因为它是个「合规问题」，而是因为它直接触及 froQ 对人文主义的定义。如果排版的人文主义不想停留在气氛词上，它就需要为自己的审美选择承担可验证的代价。

### 把 typographic polyphony 写成一篇文章

这枝从排版重构的整体观感长出来。froQ 的博客不是一篇论文或一个产品站，它混合了日记（500-vigil）、设计笔记（200-neoplasma）、实践记录（300-putredo）、外部材料（100-ingesta）、系统自省（000-autopsia）。这些内容类型的气质本来就不同，而现在的字体系统恰好有能力为不同的内容分配不同的声音：vigil 可以调手写体的比例，putredo 可以偏 sans，neoplasma 可以多用 italicSerif 的思考感，autopsia 可以强调 mono 与 serif 的搭配。

可能的方向：写一篇关于 typographic polyphony 的 blog post，以 froQ 自己的知识库为案例，分析为什么一个混合了日记、笔记、论文、代码的私人站点需要多声部排版。这篇文章本身可以作为一个排版实验：它的正文用什么字体，它的引文用什么，它的代码块用什么，它的注释用什么。

它值得判断，因为这会让「做主题」和「写文章」这两条 froQ 一直在走的轨道交汇。排版不再只是开发任务，也可以是对外表达的一部分。

### 为中文排版保留一门退出机制

这枝从 YshiPen-ShutiTC 和 LXGW Neo XiHei Plus 的张力长出来。froQ 当前的中文字体方案是：正文（手写体 fallback）、标题（新致宋 + SongTi SC）、代码（霞鹜等宽）。黑体被下载了但没有启用。

这不是一个「选错了」的问题。恰恰相反，这可能反映一种尚未被明确表达的设计直觉：froQ 不想让中文排版「看起来像一个标准网站」。手写体在展示性文字中极有魅力，在持续阅读中可能不太一样；霞鹜新致宋做中文正文很稳，但目前它被放在 serif 标题栈里。

可能的方向：做一个简单的 A/B 观察——把同一篇长文章的正文中文分别用「YshiPen-ShutiTC」「LXGW Neo XiHei Plus」「LXGW Neo ZhiSong Plus」排一遍，在同一个环境下连读 15 分钟，然后判断哪个最不打扰注意力，哪个最「有人的温度但不是表演性的温度」。

它值得判断，因为中文字体的选择对 froQ 来说不是功能问题，是自我呈现问题。他想要的可能不是「最好读的」，也不是「最有个性的」，而是「最像我的」。

## 留给 froQ 的几句话

- [ ] 正文中文 fallback 目前是 YshiPen-ShutiTC（手写体），不是 LXGW Neo XiHei Plus（黑体）。这是一个有意识的设计选择，还是一个还没回头处理的过渡状态？
- [ ] `font-[100]` 的 thin sans-serif 正文，你在日常阅读中是否会觉得不够清晰？还是说这正是你想要的那层「薄雾」？
- [ ] 六种字体角色（mono / serif / script / stylish / sans / italicSerif）哪些是你在实际写作中会主动感知到的？哪些只是「设了就忘了」？
- [ ] 你觉得排版上的「人文主义」更接近「阅读时不累」，还是更接近「页面里听得到人声」？
- [ ] 如果这个排版系统只能保留三个字体角色，你会保留哪三个？

## froQ 反馈

<!-- froQ 在这里回答、评价、修正，或标记「继续 / 暂停 / 换方向」。 -->

## AI 标注

本文由 AI（花花）基于项目内容自动生成，属于 Growth Patrol 的一次生长记录。
它不是 froQ 的结论，而是一枝等待回应的枝条。

本文件是 AI（花花）的自动化输出，不代表 froQ 已确认。
下一次 Growth Patrol 会优先读取 froQ 在反馈区留下的回应。
