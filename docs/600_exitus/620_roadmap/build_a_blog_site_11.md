---
title: "从零开始搭建博客网站（十一）"
category: 共讀
series: blog_site
head:
  - - meta
    - name: description
      content: 从零开始搭建博客网站（十一）：部署！
  - - meta
    - name: keywords
      content: 博客网站 个人网站 博客 vitepress vue vite unocss github_pages typescript
created: 2025-08-25 14:37
last_modified: 2025-08-25 14:37
---

从零开始搭建博客网站（十一）：部署！

---

[[toc]]

#log/dev #roadmap/blog_site

## 部署

其实之前也可以部署。

### GitHub Pages

首先，你当然需要把所有代码推送到 GitHub 仓库中。
一个约定俗称的仓库名是 `username.github.io`，
但是其实无所谓，现在我就用这个 `typescript_example_site` 来演示。

进入仓库，在上面选择 Settings，
然后你应该可以在左边看到 Pages 这个选项。
点进去，在 Build and deployment 下的 Source 选择 GitHub Actions，
然后 "create your own"。

### GitHub Actions

VitePress 已经提供了一个 [GitHub Actions 工作流](https://vitepress.dev/guide/deploy#github-pages)，
可以直接部署到 GitHub Pages。
根据上面链接中的指引，把相应的内容直接复制到刚刚打开的 GitHub Actions 编辑器中：

```yml:line-numbers
# Sample workflow for building and deploying a VitePress site to GitHub Pages
#
name: Deploy VitePress site to Pages

on:
  # Runs on pushes targeting the `main` branch. Change this to `master` if you're
  # using the `master` branch as the default branch.
  push:
    branches: [main]

  # Allows you to run this workflow manually from the Actions tab
  workflow_dispatch:

# Sets permissions of the GITHUB_TOKEN to allow deployment to GitHub Pages
permissions:
  contents: read
  pages: write
  id-token: write

# Allow only one concurrent deployment, skipping runs queued between the run in-progress and latest queued.
# However, do NOT cancel in-progress runs as we want to allow these production deployments to complete.
concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  # Build job
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0 # Not needed if lastUpdated is not enabled
      - uses: pnpm/action-setup@v3 # Uncomment this block if you're using pnpm  [!code highlight:3]
        with:
          version: 9 # Not needed if you've set "packageManager" in package.json
      # - uses: oven-sh/setup-bun@v1 # Uncomment this if you're using Bun
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm # or npm / yarn  [!code highlight]
      - name: Setup Pages
        uses: actions/configure-pages@v4
      - name: Install dependencies
        run: pnpm install # or npm cli / yarn install / bun install  [!code highlight]
      - name: Build with VitePress
        run: pnpm docs:build # or npm run docs:build / yarn docs:build / bun run docs:build  [!code highlight]
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: docs/.vitepress/dist

  # Deployment job
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    needs: build
    runs-on: ubuntu-latest
    name: Deploy
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

注意上面高亮的地方，由于我使用 `pnpm`，
所以我按照注释中的指导改了一些部分。

保存，然后 GitHub 就会自动构建和部署了。

后续每次向仓库推送代码，GitHub Actions 会自动部署到 GitHub Pages。
