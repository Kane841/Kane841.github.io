<script setup lang="ts">
defineProps<{
  article: {
    slug: string
    title: string
    date: string
    summary: string
    tags: string[]
  }
}>()
</script>

<template>
  <article class="rounded-card border border-border bg-card p-5 text-card-foreground">
    <h2 class="font-heading text-xl">
      <NuxtLink :to="`/articles/${article.slug}`" class="hover:text-accent">
        {{ article.title }}
      </NuxtLink>
    </h2>
    <p class="mt-2 text-sm text-muted-foreground">{{ article.date }}</p>
    <p class="mt-3">{{ article.summary }}</p>
    <div class="mt-4 flex flex-wrap gap-2">
      <TagChip
        v-for="tag in article.tags"
        :key="tag"
        :label="tag"
        :to="`/tags/${encodeURIComponent(tag)}`"
      />
    </div>
  </article>
</template>
