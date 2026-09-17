<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'

const route = useRoute()
const slug = route.params.slug as string

const { data: project } = await useAsyncData(`project-${slug}`, () =>
  queryContent('projects').where({ _path: `/projects/${slug}` }).findOne(),
)

if (!project.value) {
  throw createError({ statusCode: 404, statusMessage: 'Not Found' })
}

useSeoMeta({
  title: () => project.value?.title,
  description: () => project.value?.summary,
})
</script>

<template>
  <article v-if="project" class="mx-auto max-w-prose rounded-card bg-card p-6 md:p-10">
    <NuxtLink to="/projects" class="inline-flex min-h-11 items-center gap-2 text-sm text-accent">
      <ArrowLeft :size="16" aria-hidden="true" />
      全部项目
    </NuxtLink>
    <div class="mt-6 flex flex-wrap items-center gap-3">
      <h1 class="font-heading text-3xl">{{ project.title }}</h1>
      <ExternalLinkButton v-if="project.repo" :href="project.repo" label="仓库" />
      <ExternalLinkButton v-if="project.demo" :href="project.demo" label="演示" />
    </div>
    <p class="mt-3 text-muted-foreground">{{ project.summary }}</p>
    <div class="mt-4 flex flex-wrap gap-2">
      <TagChip v-for="tag in project.tags" :key="tag" :label="tag" />
    </div>
    <ContentRenderer class="prose-aurora mt-8" :value="project" />
  </article>
</template>
