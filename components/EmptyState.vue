<script setup lang="ts">
defineProps<{
  message: string
  to?: string
  linkLabel?: string
}>()
</script>

<template>
  <p class="text-muted-foreground">
    {{ message }}
    <NuxtLink v-if="to && linkLabel" :to="to" class="ml-2 text-accent">{{ linkLabel }}</NuxtLink>
  </p>
</template>
