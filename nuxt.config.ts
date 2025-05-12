
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  css: [
    'vuetify/styles',
    '@/assets/styles/main.scss',
    '@mdi/font/css/materialdesignicons.css',
  ],
  build: {
    transpile: ['vuetify'],
  },
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8080',
    },
  },
  modules: [
    '@nuxt/content',
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@pinia/nuxt',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/scripts'
  ],
  app: {
    head: {
      link: [
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+KR&display=swap',
        },
      ],
      script: [
        {
          src: 'https://dapi.kakao.com/v2/maps/sdk.js?appkey=7d883e23cee17f8d46b46624f04b8cf4&autoload=false&libraries=services&v=force1',
          tagPosition: 'head',
          // Nuxt 3 인식용
          defer: true, // 또는 async: true
        },
        {
          src: 'https://developers.kakao.com/sdk/js/kakao.js',
          defer: true,
        },
      ]
    },
  },
})
