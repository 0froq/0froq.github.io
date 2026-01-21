---
title: "从零开始搭建博客网站（五）"
category: 共讀
series: blog_site
head:
  - - meta
    - name: description
      content: 从零开始搭建博客网站（五）：文章列表。
  - - meta
    - name: keywords
      content: 博客网站 个人网站 博客 vitepress vue vite unocss github_pages typescript
created: 2025-02-06 22:18
last_modified: 2025-02-07 02:04
---

从零开始搭建博客网站（五）：文章列表。

---

[[toc]]

#log/dev #roadmap/blog_site

## 文章列表

### 现状

在 `PageContentHome.vue` 中可以看到，
当前的文章列表是通过手写 DOM 添加的，
这种重复性的工作显然是不应该存在的。

```vue {26-32}
<script setup lang="ts">
import { useData } from 'vitepress'

const { site } = useData()
</script>

<template>
  <div
    v-if="frontmatter.home"
    un-mx-auto
    un-max-w="[700px]"
  >
    <h1
      un-text="center 4xl"
      un-m-4
    >
      {{ site.title }}
    </h1>
    <div
      un-m-4
      un-min-h="[200px]"
      un-text-center
    >
      <p>{{ site.description }}</p>
    </div>
    <ul
      un-flex="~ col"
      un-space-y-2
    >
      <li un-text-blue-500>
        <a href="/markdown-examples.html">Markdown Examples</a>
      </li>
      <li un-text-blue-500>
        <a href="/api-examples.html">API Examples</a>
      </li>
    </ul>
  </div>
</template>
```

### 构建时数据加载｜Build-Time Data Loading

如果您的创造性足够强，
也可以直接去
看 [VitePress 官方文档](https://vitepress.dev/guide/data-loading#createcontentloader)。
这里我会用我自己的方式来操作。

简要来说，
对于目前的需求，
我们需要提取所有文章的一些元数据，
比如标题、
发布时间、
地址等，
并渲染一个文章列表作目录使用。

所有的构建时数据加载都需要在 `*.data.ts` 文件中完成。
我们在 `theme/` 文件下新建 `src/` 文件夹，
并新建一个 `posts.data.ts` 文件：

```ts twoslash
import { createContentLoader } from 'vitepress'

export default createContentLoader('posts/*.md', {
  transform(raw) {
    return raw.map(({ url, frontmatter }) => ({
      url,
      frontmatter,
    }))
  },
})
```

这里我们使用 VitePress 提供的 `createContentLoader()`
辅助函数来创建一个内容加载器。
它的第一个参数是一个 glob 模式，
用于匹配需要加载的文件。
第二个参数是一个选项对象，
用于配置加载器的行为。
更细节的内容可以参考 [官方文档](https://vitepress.dev/zh/guide/data-loading#createcontentloader)。

在这里，
我们匹配了 `posts/` 目录下的所有 `.md` 文件，
并提取其 `url` 和 `frontmatter` 属性。
在 `transform()` 成员中可以对数据进行操作，
这里先不进行任何处理。

当然，
我们需要把除了 `index.md` 外的所有的 MD 文件都放在 `./docs/posts/` 目录下。

或者如果您自己有管理文档和路由的思路，请自由发挥。

现在我们可以在 `PageContentHome.vue` 中使用导出的数据：

```vue twoslash
<!-- 这两行红的没用，只是用来正确显示下面的 error，如果要复制粘贴，记得删掉。 -->
<!-- [!code --] -->
<script lang="ts">
// ---cut-start---
// @filename: ../src/posts.data.ts
/* eslint-disable import/first */
import { createContentLoader } from 'vitepress'

export default createContentLoader('posts/*.md', {
  transform(raw) {
    return raw.map(({ url, frontmatter }) => ({
      frontmatter,
      url,
    }))
  },
})

// ---cut-end---
// [!code --]
</script>

<script setup lang="ts">
// @errors: 2614
// ...
import { data as posts } from '../src/posts.data'

// ...
/* eslint-enable import/first */
</script>

<!-- ... -->
```

### 一些类型问题

不出意外的话，TS 用户又要出意外了。
根据 [VitePress 文档](<https://vitepress.dev/zh/guide/data-loading#:~:text=%E4%BD%A0%E4%BC%9A%E6%B3%A8%E6%84%8F%E5%88%B0%20data%20loader%20%E6%9C%AC%E8%BA%AB%E5%B9%B6%E6%B2%A1%E6%9C%89%E5%AF%BC%E5%87%BA%20data%E3%80%82%E8%BF%99%E6%98%AF%E5%9B%A0%E4%B8%BA%20VitePress%20%E5%9C%A8%E5%90%8E%E5%8F%B0%E8%B0%83%E7%94%A8%E4%BA%86%20load()%20%E6%96%B9%E6%B3%95%EF%BC%8C%E5%B9%B6%E9%80%9A%E8%BF%87%E5%90%8D%E4%B8%BA%20data%20%E7%9A%84%E5%85%B7%E5%90%8D%E5%AF%BC%E5%87%BA%E9%9A%90%E5%BC%8F%E5%9C%B0%E6%9A%B4%E9%9C%B2%E4%BA%86%E7%BB%93%E6%9E%9C%E3%80%82>) 所述，
VitePress 在后台调用了 `load()` 方法，
将 `*.data.ts` 的默认导出用 `data` 具名导出来隐式暴露。
所以在使用具名导入的时候，
编译器会认为这个模块没有名为 `data` 的具名导出。

解决方法也很简单，
在 `posts.data.ts` 中导出相应类型即可：

```ts twoslash {3-5,7,8}
import { createContentLoader } from 'vitepress'

export interface Data {
  // ...
}

declare const data: Data[]
export { data }

// ...
```

### 生成文章列表

在 `Data` 接口中，
需要定义经过 `transform()` 后的属性。
要做一个最基本的文章列表，
我们需要每篇文章的链接和标题，
其中标题可以在文章的 frontmatter 中定义，
从而通过上面的 `frontmatter` 访问：

::: code-group

```ts [posts.data.ts] twoslash {3-4}
// ...
export interface Data {
  url: string
  frontmatter: Record<string, any>
}
// ...
```

```vue [PageContentHome.vue] {11-23}
<script setup lang="ts">
// ...
</script>

<template>
  <div
    v-if="frontmatter.home"
    un-mx-auto
    un-max-w="[700px]"
    un-min-h="[calc(100vh-100px)]"
    un-block
  >
    <h1
      un-text="center 4xl"
      un-m-4
    >
      {{ site.title }}
    </h1>
    <div
      un-m-4
      un-min-h="[200px]"
      un-text-center
    >
      <p>{{ site.description }}</p>
    </div>
    <div>
      <div
        v-for="post in posts"
        :key="post.url"
        un-py-2
        un-text="neutral-600 hover:neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
        un-transition-colors
        un-duration-200
      >
        <a
          un-text-2xl
          :href="post.url"
        >{{ post.frontmatter.title }}</a>
      </div>
    </div>
  </div>
</template>
```

:::

当然，
一定要确保每个 MD 文件都有 `title` 这个 frontmatter：

```markdown
---
title: "Example Title"
---
```

效果如下图所示：

![老是在改改改的主页](build_a_blog_site_5_assets/ATTCH_20250207020355829.png)

最后，
注意到我们应该会经常使用 `mx-auto max-w="[700px]"` 这个类名，
它实现了居中和可读性较高的宽度。
可以再加上 `min-h="[calc(100vh-100px)] block"` 来确保高度不会太小。
我们可以把这个玩意提出来写成 UnoCSS 的 `shortcuts`：

::: code-group

```ts [uno.config.mts] {7}
import {
// ...
} from 'unocss'

export default defineConfig({
  shortcuts: {
    'page-content': 'mx-auto max-w-[700px] min-h-[calc(100vh-100px)] block',
  },
  // ...
})
```

```vue [pageContentHome.vue] {2,4}
<template>
  <un-page-content>
    <!-- ... -->
  </un-page-content>
</template>
```

:::

除此之外，为了不让 Vue 的编译器报错，我们还需要在 `config.mts` 中设置一下 `compilerOptions`：

```ts {13-19}
import unocss from 'unocss/vite'
import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Example Site',
  description: 'A VitePress Site.',
  vite: {
    plugins: [
      unocss(),
    ],
  },
  vue: {
    template: {
      compilerOptions: {
        isCustomElement: tag => tag.startsWith('un-'), // [!code focus]
      },
    },
  },
})
```
