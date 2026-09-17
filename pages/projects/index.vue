<script setup lang="ts">
import { sortByDateDesc } from '../../utils/projects'
import { slugFromPath } from '../../utils/slug'

const { data } = await useAsyncData('projects', async () => {
  const docs = await queryContent('projects').find()
  return sortByDateDesc(docs.map(doc => ({
    slug: slugFromPath(doc._path ?? ''),
    title: doc.title as string,
    summary: doc.summary as string,
    tags: doc.tags as string[],
    date: doc.date as string | undefined,
  })))
})

useSeoMeta({ title: '项目' })
</script>

<template>
  <div>
    <h1 class="font-heading text-3xl">项目</h1>
    <EmptyState v-if="!data?.length" class="mt-6" message="还没有内容。" />
    <div v-else class="mt-8 grid gap-4 md:grid-cols-2">
      <ProjectCard v-for="project in data" :key="project.slug" :project="project" />
    </div>
  </div>
</template>
