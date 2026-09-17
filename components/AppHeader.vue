<script setup lang="ts">
import { List, X } from 'lucide-vue-next'
import { siteConfig } from '../site.config'
import { navItems } from '../utils/nav'

const route = useRoute()
const open = ref(false)

function isCurrent(to: string): boolean {
  if (to === '/') return route.path === '/'
  return route.path === to || route.path.startsWith(`${to}/`)
}
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
    <div class="mx-auto flex max-w-content items-center justify-between gap-4 px-4 py-3 md:px-8">
      <NuxtLink to="/" class="font-heading text-lg font-semibold text-foreground">
        {{ siteConfig.name }}
      </NuxtLink>
      <nav class="hidden items-center gap-6 lg:flex" aria-label="主导航">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="relative min-h-11 px-1 py-2 text-sm text-muted-foreground hover:text-foreground"
          :aria-current="isCurrent(item.to) ? 'page' : undefined"
        >
          {{ item.label }}
          <span
            v-if="isCurrent(item.to)"
            class="absolute inset-x-0 -bottom-1 h-0.5 bg-accent"
            aria-hidden="true"
          />
        </NuxtLink>
      </nav>
      <button
        type="button"
        class="inline-flex min-h-11 min-w-11 items-center justify-center lg:hidden"
        :aria-expanded="open"
        aria-label="打开菜单"
        @click="open = !open"
      >
        <X v-if="open" :size="20" aria-hidden="true" />
        <List v-else :size="20" aria-hidden="true" />
      </button>
    </div>
    <nav v-if="open" class="flex flex-col gap-1 px-4 pb-4 lg:hidden" aria-label="移动导航">
      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="flex min-h-11 items-center text-foreground"
        @click="open = false"
      >
        {{ item.label }}
      </NuxtLink>
    </nav>
  </header>
</template>
