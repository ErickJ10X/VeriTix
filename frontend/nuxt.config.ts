import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  app: {
    baseURL: '/verifront/',
  },

  runtimeConfig: {
    backendApiBase: 'https://cwtg.xyz/veriback/api/v1',
    public: {
      apiBase: '/veriback/api/v1',
    },
  },

  modules: ['@nuxt/eslint', '@nuxt/image', '@nuxt/ui', '@nuxt/fonts', '@nuxt/test-utils/module'],

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
    server: {
      allowedHosts: ['cwtg.xyz', 'localhost'],
    }
  },

  eslint: {
    config: {
      standalone: false,
    },
  },

})
