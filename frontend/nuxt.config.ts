import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  runtimeConfig: {
    backendApiBase: 'http://localhost:3001/api/v1',
    public: {
      apiBase: '/api',
    },
  },

  modules: ['@nuxt/eslint', '@nuxt/image', '@nuxt/ui', '@nuxt/fonts'],

  ui: {
    colorMode: false,
  },

  components: [
    {
      path: '~/components',
      pathPrefix: true,
    },
  ],

  alias: {
    '@': fileURLToPath(new URL('./app', import.meta.url)),
  },

  css: ['./app/assets/css/main.css'],

  vite: {
    plugins: [
      tailwindcss(),
    ],
    optimizeDeps: {
      include: [
        '@vue/devtools-core',
        '@vue/devtools-kit',
        'zod',
      ],
    },
  },

  eslint: {
    config: {
      standalone: false,
    },
  },

})
