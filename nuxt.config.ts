import { resumeExists } from './utils/resume'
import { assertValidContent } from './utils/validate-content'

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  ssr: true,
  modules: ['@nuxt/content'],
  app: {
    baseURL: process.env.NUXT_APP_BASE_URL || '/',
  },
  runtimeConfig: {
    public: {
      hasResume: resumeExists(process.cwd()),
    },
  },
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/rss.xml'],
    },
  },
  hooks: {
    'build:before'() {
      assertValidContent(process.cwd())
    },
  },
})
