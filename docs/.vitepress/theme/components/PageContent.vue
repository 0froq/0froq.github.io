<script setup lang="ts">
import type { ResolvedAnnotation } from '~/types/annotation'
import { useData, useRoute } from 'vitepress'
import AnnotationRail from '~/components/annotation/AnnotationRail.vue'
import { scrollToAnnotation } from '~/composables/useAnnotationHighlight'
import AnnotationList from './annotation/AnnotationList.vue'
import AnnotationReplyFloat from './annotation/AnnotationReplyFloat.vue'
import ContentArticle from './ContentArticle.vue'
import ContentIndexGlobal from './ContentIndexGlobal.vue'
import ContentNotFound from './ContentNotFound.vue'
import Corpus from './corpus/Layout.vue'
import Dashboard from './dashboard/Layout.vue'
import Posts from './posts/Layout.vue'
import Tags from './tags/Layout.vue'

const { page } = useData()
const route = useRoute()

function handleAnnotationSelect(ann: ResolvedAnnotation) {
  if (ann.domRange)
    scrollToAnnotation(ann.commentId)
}
</script>

<template>
  <un-page-content
    id="ghost-pointer-root"
    un-min-h="[calc(100vh-15rem)]"
  >
    <ContentNotFound v-if="page.isNotFound" />
    <ContentIndexGlobal v-else-if="['/', '/en/'].includes(route.path)" />

    <Corpus
      v-else-if="route.path.startsWith('/corpus/')"
    />

    <Posts
      v-else-if="route.path.startsWith('/posts/')"
    />

    <Dashboard
      v-else-if="route.path.startsWith('/dashboard/')"
    />

    <Tags
      v-else-if="route.path.startsWith('/tags/')"
    />

    <ContentArticle
      v-else-if="!page.isNotFound"
    />

    <!-- Site-wide annotation list + reply float (articles keep rail only) -->
    <ClientOnly>
      <AnnotationList
        @select="handleAnnotationSelect"
      />
      <AnnotationReplyFloat />
    </ClientOnly>
  </un-page-content>
</template>
