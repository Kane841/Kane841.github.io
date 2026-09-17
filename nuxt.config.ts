import { resumeExists } from './utils/resume'
import { assertValidContent } from './utils/validate-content'

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  ssr: true,
  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/google-fonts', '@nuxt/content'],
  googleFonts: {
    display: 'swap',
    families: {
      Outfit: [400, 500, 600, 700],
      Inter: [400, 500, 600, 700],
      'Noto Sans SC': [400, 500, 700],
      'JetBrains Mono': [400, 500],
    },
  },
  css: ['~/assets/css/main.css'],
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
