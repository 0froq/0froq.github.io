---
title: 把 carve 从 aut 移出
created: 2026-06-16
status: form
last_modified: 2026-06-18 03:27:38
---

重新评判 carve 的地位。

---

[[toc]]

#scope/meta/corpus

## Observation

Carve 在 aut 里格格不入。
Aut 理应是对元认知的剖析，而 carve 几乎所有内容都不是关于元认知的，
如主题设计、字体选择。

## Dissection

Carve 的生成机制就是在库内找值得「生长」的点来进一步发散，
所以其实算是 neo 而非 aut，origin 是 corpus。
或者说，应该根据生长的源来判断，因为它确实有可能是 aut。

当然这里另一个问题是，
[corpus 算 inner 还是 outer](./aut-source-and-origin-202606162349.md#争议)。
我们姑且用这里提到的 aut 中的方法，单开一个二级，三级为 Corpus 中各层。

## Decision / Mutation

如上，carve 将在创建时具体判断其应该归属的层级，带有一个 `#origin/corpus/<layer>` 的 hashtag。
