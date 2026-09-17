<script setup lang="ts">
const config = useRuntimeConfig()
const { data: about } = await useAsyncData('about', () => queryContent('/about').findOne())

useSeoMeta({ title: '关于我' })

const resumeHref = computed(() => {
  const base = config.app.baseURL.endsWith('/') ? config.app.baseURL : `${config.app.baseURL}/`
  return `${base}resume.pdf`
})
</script>

<template>
  <div v-if="about" class="mx-auto max-w-prose space-y-10">
    <section>
      <h1 class="font-heading text-3xl">关于我</h1>
      <ContentRenderer class="prose-aurora mt-6" :value="about" />
    </section>
    <section>
      <h2 class="font-heading text-2xl">技能栈</h2>
      <div class="mt-4 flex flex-wrap gap-2">
        <TagChip v-for="skill in about.skills" :key="skill" :label="skill" />
      </div>
    </section>
    <section>
      <h2 class="font-heading text-2xl">链接</h2>
      <ul class="mt-4 space-y-2">
        <li v-for="social in about.socials" :key="social.url">
          <a :href="social.url" class="text-accent">{{ social.name }}</a>
        </li>
      </ul>
    </section>
    <section v-if="config.public.hasResume">
      <a :href="resumeHref" class="inline-flex min-h-11 items-center rounded-lg bg-accent px-4 text-on-accent">
        下载简历
      </a>
    </section>
  </div>
</template>
