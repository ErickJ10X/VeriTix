import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/test-utils',
    '@nuxt/ui',
  ],
  css: ['./app/assets/css/main.css'],

  vite: {
    plugins: [
      // @ts-expect-error - Type incompatibility between Vite 7 and @tailwindcss/vite plugin types
      tailwindcss(),
    ],
  },

  eslint: {
    config: {
      standalone: false,
    },
  },

})
