<script setup lang="ts">
import { siteConfig } from '../site.config'

const { data: about } = await useAsyncData('footer-socials', () =>
  queryContent('/about').only(['socials']).findOne(),
)
</script>

<template>
  <footer class="border-t border-border">
    <div class="mx-auto flex max-w-content flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm text-muted-foreground md:px-8">
      <div class="flex flex-wrap items-center gap-4">
        <NuxtLink to="/rss.xml" class="hover:text-foreground">RSS</NuxtLink>
        <a
          v-for="social in about?.socials ?? []"
          :key="social.url"
          :href="social.url"
          class="hover:text-foreground"
        >{{ social.name }}</a>
      </div>
      <p>© {{ siteConfig.name }}</p>
    </div>
  </footer>
</template>
