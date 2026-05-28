---
title: LSWT 增温停滞（hiatus）探索
created: 2026-03-26
status: probe
last_modified: 2026-05-27 17:44:42
---

About the exploration of LSWT hiatus.

---

[[toc]]

#scope/work/research/warmingHiatus #log/project

<script setup lang="ts">
import { data as corpus } from '~/src/corpus.data'
import { useData } from 'vitepress'

const { page } = useData()

const thisCorpus = corpus.filter(
  (c) => {
    return c.tags.includes('scope/work/research/warmingHiatus') 
      && c.url + '.md' !== '/' + page.value.filePath
      && c.frontmatter.status !== 'void'
  }
).sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())

const thisPuts = thisCorpus.filter((c) => {
  console.log(c.url)
  return c.url.startsWith('/corpus/300-')
})

</script>

## Logs

<ul
  key="thisPuts.length"
>
  <li v-for="c in thisPuts" :key="c.path">
    <a :href="c.url" :text="c.title" />
  </li>
</ul>


