<script setup lang="ts">
import { articlesWithTag } from '../../utils/articles'
import { sortByDateDesc } from '../../utils/projects'
import { slugFromPath } from '../../utils/slug'

const route = useRoute()
const tag = decodeURIComponent(route.params.tag as string)

const { data } = await useAsyncData(`tag-${tag}`, async () => {
  const docs = await queryContent('articles').find()
  const articles = articlesWithTag(docs.map(doc => ({
    slug: slugFromPath(doc._path ?? ''),
    title: doc.title as string,
    date: doc.date as string,
    summary: doc.summary as string,
    tags: doc.tags as string[],
    draft: doc.draft as boolean | undefined,
  })), tag)
  return sortByDateDesc(articles)
})

useSeoMeta({ title: () => `标签：${tag}` })
</script>

<template>
  <div>
    <h1 class="font-heading text-3xl">标签：{{ tag }}</h1>
    <EmptyState
      v-if="!data?.length"
      class="mt-6"
      message="没有带这个标签的文章。"
      to="/articles"
      link-label="全部文章"
    />
    <div v-else class="mt-8 space-y-4">
      <ArticleCard v-for="article in data" :key="article.slug" :article="article" />
    </div>
  </div>
</template>
