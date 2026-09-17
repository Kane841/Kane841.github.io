<script setup lang="ts">
import type { NuxtError } from '#app'

defineProps<{ error: NuxtError }>()
</script>

<template>
  <NuxtLayout>
    <div class="mx-auto max-w-prose py-24 text-center">
      <h1 class="font-heading text-3xl">没有这个页面。</h1>
      <NuxtLink to="/" class="mt-6 inline-flex min-h-11 items-center text-accent">回首页</NuxtLink>
    </div>
  </NuxtLayout>
</template>
