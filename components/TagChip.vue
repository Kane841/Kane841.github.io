<script setup lang="ts">
defineProps<{
  label: string
  to?: string
}>()
</script>

<template>
  <NuxtLink
    v-if="to"
    :to="to"
    class="inline-flex min-h-11 items-center rounded-chip border border-border px-3 text-sm text-accent"
  >
    {{ label }}
  </NuxtLink>
  <span
    v-else
    class="inline-flex min-h-11 items-center rounded-chip border border-border px-3 text-sm text-muted-foreground"
  >
    {{ label }}
  </span>
</template>
