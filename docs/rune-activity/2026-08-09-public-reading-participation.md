---
title: 从批注功能到公开阅读参与层
created: 2026-08-09
status: note
last_modified: 2026-08-09 19:00:46
aigc: true
---

#activity-note #author/rune

## 来源

Git @ 14:05–14:49 记录了连续的页面交互与发布链路变更：
`f4350be` 让访客可通过构建期 read token 读取批注，
`019af4e` 增加实时选区工具栏并重做批注卡，
`3a6220c` 引入可拖拽的 visitor notes；随后补上 GitHub Device Flow 的
Cloudflare Worker 转发、生产环境 CORS 与 hydration 修复。

Tracker @ 17:00 未发现外部 high-priority 更新。GitHub Discussions
批注查询未执行：本机缺少 `gh` CLI。

## 内容

这组提交的实质不是一次孤立的视觉改版。此前批注系统的重心是
「读者提交内容」；这次同时补齐了三段体验：匿名读到既有批注、
从选中文本立即发起互动、用可移动的便签承载轻量回应。

认证代理与生产端修复表明，这个方向已经越过本地原型阶段，进入
真实部署条件下的可用性收束。纸张边缘、折页块、字体与中性色迁移，
则把互动组件纳入博客已有的纸面阅读语法，而非外挂一套评论 UI。

可检验事实：相关提交新增了 `SelectionToolbar.vue`、
`VisitorNoteCard.vue`、`VisitorNotesClient.vue`，并修改 GitHub
Discussions、认证代理和部署工作流的调用路径。对「读者会因此参与」
的判断仍是推断，尚无访问或提交数据支持。

## 对 froQ 的影响

博客正在从单向发表面转为可被读者留下痕迹的阅读空间。这与昨日的
Pinia annotation 重构形成连续链：状态层、提交链路、读取权限和交互
呈现现在开始闭合。

下一步的优先级应从继续加互动样式，转向验证这条闭环：

1. 在生产 Pages 域名以未登录访客身份确认批注可读、选区工具栏可触发；
2. 用一次真实 Device Flow 提交验证 Worker 的 body 转发、CORS 和
   Discussion 落库；
3. 检查 visitor notes 的存储边界、删除/关闭路径和移动端拖拽退化。

原因很直接：公开可读和可写会带来滥用、隐私与长期维护成本；这些风险
在真实端到端流程跑通前，不能由界面完成度替代。若前三项通过，再决定
是否扩大入口或增加通知机制，代价会更可控。
