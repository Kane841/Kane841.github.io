<script setup lang="ts">
defineProps<{
  href: string
  label: string
}>()
</script>

<template>
  <a
    :href="href"
    target="_blank"
    rel="noopener noreferrer"
    class="inline-flex min-h-11 items-center rounded-lg border border-border px-4 text-sm text-accent"
  >
    {{ label }}
  </a>
</template>
