<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'

const route = useRoute()
const slug = route.params.slug as string

const { data: article } = await useAsyncData(`article-${slug}`, () =>
  queryContent('articles').where({ _path: `/articles/${slug}` }).findOne(),
)

if (!article.value || article.value.draft === true) {
  throw createError({ statusCode: 404, statusMessage: 'Not Found' })
}

useSeoMeta({
  title: () => article.value?.title,
  description: () => article.value?.summary,
})
</script>

<template>
  <article v-if="article" class="mx-auto max-w-prose rounded-card bg-card p-6 md:p-10">
    <NuxtLink to="/articles" class="inline-flex min-h-11 items-center gap-2 text-sm text-accent">
      <ArrowLeft :size="16" aria-hidden="true" />
      全部文章
    </NuxtLink>
    <h1 class="mt-6 font-heading text-3xl">{{ article.title }}</h1>
    <p class="mt-3 text-sm text-muted-foreground">{{ article.date }}</p>
    <div class="mt-4 flex flex-wrap gap-2">
      <TagChip
        v-for="tag in article.tags"
        :key="tag"
        :label="tag"
        :to="`/tags/${encodeURIComponent(tag)}`"
      />
    </div>
    <ContentRenderer class="prose-aurora mt-8" :value="article" />
  </article>
</template>
