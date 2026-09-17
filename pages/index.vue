<script setup lang="ts">
import { siteConfig } from '../site.config'
import type { ArticleMeta, ProjectMeta } from '../types/content'
import { latestArticles } from '../utils/articles'
import { featuredProjects } from '../utils/projects'
import { slugFromPath } from '../utils/slug'

function toArticle(doc: { _path?: string; title: string; date: string; summary: string; tags: string[]; draft?: boolean }): ArticleMeta {
  return {
    slug: slugFromPath(doc._path ?? ''),
    title: doc.title,
    date: doc.date,
    summary: doc.summary,
    tags: doc.tags,
    draft: doc.draft,
  }
}

function toProject(doc: { _path?: string; title: string; summary: string; tags: string[]; featured?: boolean; date?: string }): ProjectMeta {
  return {
    slug: slugFromPath(doc._path ?? ''),
    title: doc.title,
    summary: doc.summary,
    tags: doc.tags,
    featured: doc.featured,
    date: doc.date,
  }
}

const { data } = await useAsyncData('home', async () => {
  const [articleDocs, projectDocs] = await Promise.all([
    queryContent('articles').find(),
    queryContent('projects').find(),
  ])
  const articles = latestArticles(articleDocs.map(toArticle))
  const projects = featuredProjects(projectDocs.map(toProject))
  return { articles, projects }
})

useSeoMeta({
  title: () => siteConfig.name,
  description: () => siteConfig.description,
})
</script>

<template>
  <div class="space-y-12">
    <section>
      <h1 class="font-heading text-4xl font-semibold">{{ siteConfig.name }}</h1>
      <p class="mt-3 max-w-prose text-muted-foreground">{{ siteConfig.description }}</p>
    </section>
    <div class="grid gap-12 md:grid-cols-2">
      <section>
        <h2 class="font-heading text-2xl">最新文章</h2>
        <EmptyState v-if="!data?.articles.length" message="还没有文章。" />
        <div v-else class="mt-6 space-y-4">
          <ArticleCard v-for="article in data.articles" :key="article.slug" :article="article" />
          <NuxtLink to="/articles" class="inline-flex min-h-11 items-center text-accent">查看全部文章</NuxtLink>
        </div>
      </section>
      <section>
        <h2 class="font-heading text-2xl">精选项目</h2>
        <EmptyState v-if="!data?.projects.length" message="还没有精选项目。" />
        <div v-else class="mt-6 space-y-4">
          <ProjectCard v-for="project in data.projects" :key="project.slug" :project="project" />
          <NuxtLink to="/projects" class="inline-flex min-h-11 items-center text-accent">查看全部项目</NuxtLink>
        </div>
      </section>
    </div>
  </div>
</template>
