<script setup lang="ts">
defineProps<{
  project: {
    slug: string
    title: string
    summary: string
    tags: string[]
  }
}>()
</script>

<template>
  <article class="rounded-card border border-border bg-card p-5 text-card-foreground">
    <h2 class="font-heading text-xl">
      <NuxtLink :to="`/projects/${project.slug}`" class="hover:text-accent">
        {{ project.title }}
      </NuxtLink>
    </h2>
    <p class="mt-3">{{ project.summary }}</p>
    <div class="mt-4 flex flex-wrap gap-2">
      <TagChip v-for="tag in project.tags" :key="tag" :label="tag" />
    </div>
  </article>
</template>
