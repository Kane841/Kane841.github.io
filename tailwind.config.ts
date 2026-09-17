import type { Config } from 'tailwindcss'

export default {
  content: [
    './app.vue',
    './error.vue',
    './components/**/*.vue',
    './layouts/**/*.vue',
    './pages/**/*.vue',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0B1020',
        foreground: '#F8FAFC',
        primary: '#7C3AED',
        'on-primary': '#FFFFFF',
        accent: '#22D3EE',
        'on-accent': '#0B1020',
        card: '#12182A',
        'card-foreground': '#F8FAFC',
        muted: '#1A2238',
        'muted-foreground': '#94A3B8',
        border: 'rgba(124, 58, 237, 0.28)',
        ring: '#22D3EE',
        destructive: '#DC2626',
      },
      fontFamily: {
        heading: ['Outfit', 'Noto Sans SC', 'sans-serif'],
        sans: ['Inter', 'Noto Sans SC', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        card: '16px',
        chip: '999px',
      },
      maxWidth: {
        content: '1120px',
        prose: '720px',
      },
    },
  },
} satisfies Config
