---
title: '从零开始搭建博客网站（三）'
category: 共讀
series: blog_site
head:
  - - meta
    - name: description
      content: 从零开始搭建博客网站（三）：像样的页面与文件结构优化。
  - - meta
    - name: keywords
      content: 博客网站 个人网站 博客 vitepress vue vite unocss github_pages typescript
created: 2025-01-20 01:03
last_modified: 2025-01-22 05:22
---

从零开始搭建博客网站（三）：像样的页面与文件结构优化。

---

[[toc]]

#log/dev #roadmap/blog_site

## 像样的页面

### 现状

是的，现在的页面可读性几乎为零。这篇文章的目标是在样式和结构上进行设计。

### VitePress 的页面结构

首先，对 Vue 有过了解的读者可能会比较清楚，
整个页面——或者说是整个应用——挂载在 `#app` 这个 DOM 元素上。
在 `index.ts` 中交代了一些信息：

```ts
import type { Theme } from 'vitepress'
// @noErrors
// https://vitepress.dev/guide/custom-theme
import Layout from './Layout.vue' // [!code focus]
import './style.css'

export default {
  Layout, // [!code focus]
  enhanceApp({ app, router, siteData }) {
    // ...
  },
} satisfies Theme
```

这告诉我们，`Layout.vue` 是整个页面的总体布局，
且根据 `Theme` 类型的定义，
`Layout` 实质上是 `Theme` 唯一一个必要的属性。
[文档](https://vitepress.dev/guide/custom-theme#theme-interface) 称
「_So technically, a VitePress theme
can be as simple as a single Vue component_」，
也就是说，所有的结构都可以仅在 `Layout.vue` 中定义。
但是为了更好地组织代码，
我们也可以在 `Layout.vue` 中引入其他组件，
像一个真正的 Vue 应用一样。

再次看看 `Layout.vue` 的代码：

```vue
<script setup lang="ts">
import { useData } from 'vitepress'

// https://vitepress.dev/reference/runtime-api#usedata
const { site, frontmatter } = useData()

function switchDarkMode(): void {
  const htmlEl: HTMLElement | null = document.querySelector('html')
  htmlEl?.classList.toggle('dark')
}
</script>

<template>
  <div
    un-min-h-100vh
    un-bg="neutral-50 dark:neutral-950"
    un-text="neutral-700 dark:neutral-300"
  >
    <div v-if="frontmatter.home">
      <h1>{{ site.title }}</h1>
      <p>{{ site.description }}</p>
      <ul>
        <li><a href="/markdown-examples.html">Markdown Examples</a></li>
        <li><a href="/api-examples.html">API Examples</a></li>
      </ul>
    </div>
    <div v-else>
      <a href="/">Home</a>
      <Content />
    </div>
    <div
      un-bg="neutral-300 dark:neutral-700"
      un-text="neutral-700 dark:neutral-300"
      class="dark-mode-switcher"
      @click="switchDarkMode"
    >
      Switch
    </div>
  </div>
</template>
```

在 `<template>` 中，
我们可以看到基于 `frontmatter.home` 的条件渲染。
`frontmatter` 是 MD 文件的元数据，
这意味着如果当前页面对应的 MD 文件的 YAML 头
（或者 [JSON 头](https://vitepress.dev/guide/frontmatter#alternative-frontmatter-formats)）
中有 `home: true`，
则会渲染 `site.title`、`site.description` 等首页内容。
否则，会渲染一个返回首页的链接和 `<Content />` 组件。
`<Content />` 组件是 VitePress 的内置组件，
用于将当前页面对应的 MD 文件渲染为 HTML。

### 初步设计

为了便于区分，我们先微调一下 `Layout.vue` 的结构，并加上一些样式：

```vue {9,11,16,21,23,26,27,30-32,37}
<!-- ... -->

<template>
  <div
    un-min-h-100vh
    un-bg="neutral-50 dark:neutral-950"
    un-text="neutral-700 dark:neutral-300"
  >
    <nav
      un-flex="~ row"

      un-p-4
      un-justify-between
    >
      <a
        un-text-blue-500
        un-hover="underline"
        href="/"
      >Home</a>
      <div
        un-bg="neutral-300 dark:neutral-700"
        un-text="neutral-700 dark:neutral-300"
        class="dark-mode-switcher"
        @click="switchDarkMode"
      >
        Switch
      </div>
    </nav>
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
    <div
      v-else
      un-mx-auto
      un-max-w="[700px]"
    >
      <Content />
    </div>
  </div>
</template>
```

这样，我们就有了一个简单的导航栏和一个居中的内容区域，
如下图所示：

![简单的博客首页](build_a_blog_site_3_assets/ATTCH_20250120024928705.png)

![简陋的博客内容页](build_a_blog_site_3_assets/ATTCH_20250120025334993.png)

### 主页的特殊处理

注意到 `./docs/` 目录下存在一个 `index.md` 文件，
这就是主页的 MD 文件，
同样通过 `<Content />` 组件渲染。
注意到在 `Layout.vue` 中，
`<Content />` 组件的渲染是在 `v-else` 分支中，
这意味着当 `frontmatter.home` 为 `true` 时，
`<Content />` 组件不会被渲染。
我们可以试着把 `<Content />` 组件放在分支外，
并向 `index.md` 文件中添加一些内容：

::: code-group

```vue [./docs/.vitepress/theme/Layout.vue] {15-18}
<!-- ... -->

<template>
  <div
    un-min-h-100vh
    un-bg="neutral-50 dark:neutral-950"
    un-text="neutral-700 dark:neutral-300"
  >
    <div
      v-if="frontmatter.home"
      un-mx-auto
      un-max-w="[700px]"
    >
      <!-- ... -->
    </div>
    <div
      v-else
      un-mx-auto
      un-max-w="[700px]"
    />
    <Content
      un-mx-auto
      un-max-w="[700px]"
    />
  </div>
</template>
```

```markdown [./docs/index.md] {5}
---
home: true
---

This is definitely the home page.
```

:::

现在可以看到，主页的内容用一样的方式渲染了出来：

![有点内容在身上的的博客首页](build_a_blog_site_3_assets/ATTCH_20250120031157084.png)

不过我想说，主页是一个特殊的页面，
主页内容的样式应该与其他页面有所区别，
谁支持谁反对？
有很多种思路可以实现主页的特殊处理。

#### 保留 `index.md` 内容，通过 `frontmatter` 区分

根据前面的讨论，
其中一种方案是：
我们可以通过在 `index.md` 的 frontmatter 中
添加一些独特的元数据来区分主页和普通页面，
如默认的 `home: true`。
在这个基础上，
我们可以在 `Layout.vue` 中
根据 `frontmatter` 的值来为主页 `<Content />`
（或其相对于普通页面特有的祖先元素）添加类名，
以便在 `style.css` 中进行样式设计：

::: code-group

```vue [./docs/.vitepress/theme/Layout.vue]
<!-- ... -->

<template>
  <div
    un-min-h-100vh
    un-bg="neutral-50 dark:neutral-950"
    un-text="neutral-700 dark:neutral-300"
  >
    <!-- ... -->
    <Content
      id="content"
      un-max-auto
      un-max-w="[700px]"
      :class="frontmatter.home ? 'home-page' : ''"
    />
  </div>
</template>
```

```css [./docs/.vitepress/theme/style.css]
/* ... */

#content {
  /* [!code ++:7] */
  &.home-page {
    p {
      @apply border border-red-500 text-3xl;
    }
  }
}
```

:::

这样一来，
加载在主页上的 `<Content />` 组件的内容就会被添加上 `home-page` 类名，
从而可以在 `style.css` 中对其进行样式设计。
这里我们简单地添加了一个红色的边框和大字体样式。

![有特殊内容在身上的博客主页](build_a_blog_site_3_assets/ATTCH_20250120033925777.png)

除了通过 `frontmatter`，
还可以通过其他方式区分主页和普通页面，
比如通过文件名、文件路径等。
这里只是提供了一种思路。

#### `index.md` 空空如也

另一种思路是，
反正 `index.md` 的内容是被渲染为 HTML 的，
为何不直接在 `Layout.vue` 中写入主页的内容呢？
事实上这正是初始化时的默认行为，
`site.title`、`site.description`
以及紧跟的文章列表（两个也是列表）都直接写在 `<template>` 中。
这样做的最大优势是更加灵活，
因为我们实际上是在写 Vue 组件，
可以随心所欲地添加任何内容，
而不用受到 MD 文件结构的限制。

#### （算是？）某种奇技淫巧：在 MD 文件中使用 Vue

事实上，由于每个 MD 文件都将被编译为 HTML，
然后作为 [Vue SFC](https://vuejs.org/guide/scaling-up/sfc.html) 来处理。
这意味着我们可以在 MD 文件中使用任何 Vue 功能。
在这个例子中，
我们可以直接将 `index.md` 中的内容写为 Vue 模板，
从而实现更加灵活的内容设计，
并且使用 UnoCSS 的类名为其添加样式：

```md {5,6,8,9,11-30}
---
home: true
---

<script setup lang="ts">
import { useData } from 'vitepress'

const { site } = useData()
</script>

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
  <li un-text-blue-500><a href="/markdown-examples.html">Markdown Examples</a></li>
  <li un-text-blue-500><a href="/api-examples.html">API Examples</a></li>
</ul>

This is definitely the home page.
```

看看效果：

![魔改的博客主页](build_a_blog_site_3_assets/ATTCH_20250120044924234.png)

注意到两点：
首先，
`<p>` 标签的样式同样应用了 `style.css` 中的红色边框和大字体样式，
懂了吗？懂了过了。
其次，
由于 `<Content />` 组件的均在 `Layout.vue` 中渲染，
所以 UnoCSS 也可以直接在 MD 文件中使用。

好了，
把刚刚魔改的部分删除，
把 `index.md` 的添加的那行文字也删掉，
样式表也删掉，
我们直接在 `Layout.vue` 中进行主页设计。

## 文件结构优化

我们当然可以在 `Layout.vue` 中实现所有的页面设计，
但是我们当然不可以在 `Layout.vue` 中实现所有的页面设计（ :sweat_drops: ）。
现在，
让我们将 `Layout.vue` 中的内容拆分开来。
这里我的拆分思路是：
将顶部导航栏和底部可能存在的页脚拆分为 PageNav 和 PageFooter，
主要内容区域放在 PageContent 中，
再具体区分 PageContentHome 和 PageContentPost。
这样，
我们就可以在 `Layout.vue` 中引入这些组件，
而不用在 `Layout.vue` 中写一堆。

在 `./docs/.vitepress/theme` 目录下新建 `components/` 目录，
然后新建文件写东西：

::: danger
这里仅仅是把上一篇文章最末的代码分离到多个文件中，
如果您使用的是 JS，
请不要==唐==到直接把下面这段 TS 复制粘贴了。
如有冒犯，请被冒犯。

这里可以看出一些提倡，
即<u>不要看都不看一眼就复制粘贴</u>，
这种行为导致的问题我也**不会**进行解答，
请自行解决。

如果您确实是初学者，
在一些确实没有给出具体 JS 实现的部分遇到了困难，
请先**自行探索思考**。
如果在**经过尝试后**实在无法解决，
可以跟我交流。

后续的文章中不再赘述此类问题。
:::

::: code-group

```vue [./docs/.vitepress/theme/components/PageNav.vue]
<script setup lang="ts">
function switchDarkMode(): void {
  const htmlEl: HTMLElement | null = document.querySelector('html')
  htmlEl?.classList.toggle('dark')
}
</script>

<template>
  <nav
    un-flex="~ row"
    un-justify-between
    un-p-4
  >
    <a
      un-text-blue-500
      un-hover="underline"
      href="/"
    >Home</a>
    <div
      un-bg="neutral-300 dark:neutral-700"
      un-text="neutral-700 dark:neutral-300"
      class="dark-mode-switcher"
      @click="switchDarkMode"
    >
      Switch
    </div>
  </nav>
</template>
```

```vue [./docs/.vitepress/theme/components/PageFooter.vue]
<script setup lang="ts"></script>

<template>
  <div />
</template>
```

```vue [./docs/.vitepress/theme/components/PageContent.vue]
<script setup lang="ts">
import { useData } from 'vitepress'
import PageContentHome from './PageContentHome.vue'
import PageContentPost from './PageContentPost.vue'

const { frontmatter } = useData()
</script>

<template>
  <PageContentHome v-if="frontmatter.home" />
  <PageContentPost v-else />
</template>
```

```vue [./docs/.vitepress/theme/components/PageContentHome.vue]
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

```vue [./docs/.vitepress/theme/components/PageContentPost.vue]
<script setup lang="ts"></script>

<template>
  <Content
    id="content"
    un-max-auto
    un-max-w="[700px]"
  />
</template>
```

:::

然后在 `Layout.vue` 中引入这些组件：

::: code-group

```vue [./docs/.vitepress/theme/Layout.vue] {2-4,8-10}
<script setup lang="ts">
import PageContent from './components/PageContent.vue'
import PageFooter from './components/PageFooter.vue'
import PageNav from './components/PageNav.vue'
</script>

<template>
  <PageNav />
  <PageContent />
  <PageFooter />
</template>
```
