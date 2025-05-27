import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  ssr: false,
  nitro: {
    preset: 'static'
  },
  vite: {
    build: {
      // CSS 압축 깨질 때 아래 옵션도 고려
      cssCodeSplit: true,
    },
  },
  compatibilityDate: '2025-05-18',
  devtools: { enabled: true },
  css: [
    'vuetify/styles',
    '@/assets/styles/main.scss',
    '@mdi/font/css/materialdesignicons.css',
    '@/assets/styles/light-theme.css',

  ],
  build: {
    transpile: ['vuetify'],
  },
  runtimeConfig: {
    // 클라이언트 + 서버
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8080',
      papagoClientId: process.env.NUXT_PUBLIC_PAPAGO_CLIENT_ID
    },
    // 서버 전용
    papagoClientSecret: process.env.NUXT_PRIVATE_PAPAGO_CLIENT_SECRET,

  },
  modules: [
    '@nuxt/content',
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@pinia/nuxt',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxtjs/i18n'
  ],
  i18n: {
    lazy: true,
    langDir: 'locales',
    defaultLocale: 'ko',
    strategy: 'no_prefix',
    locales: [
      { code: 'ko', file: 'ko.json', name: '한국어' },
      { code: 'en', file: 'en.json', name: 'English' },
      { code: 'ja', file: 'ja.json', name: '日本語' },
      { code: 'zh', file: 'zh.json', name: '中文' },
      { code: 'ru', file: 'ru.json', name: 'Русский' }
    ]
  },
  app: {
    baseURL: './',
    head: {
      title: 'ToDeal',
      link: [
        // 기본 favicon
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },

        // Android 아이콘
        { rel: 'icon', type: 'image/png', sizes: '36x36', href: '/android-icon-36x36.png' },
        { rel: 'icon', type: 'image/png', sizes: '48x48', href: '/android-icon-48x48.png' },
        { rel: 'icon', type: 'image/png', sizes: '72x72', href: '/android-icon-72x72.png' },
        { rel: 'icon', type: 'image/png', sizes: '96x96', href: '/android-icon-96x96.png' },
        { rel: 'icon', type: 'image/png', sizes: '144x144', href: '/android-icon-144x144.png' },
        { rel: 'icon', type: 'image/png', sizes: '192x192', href: '/android-icon-192x192.png' },

        // Apple 아이콘
        { rel: 'apple-touch-icon', sizes: '57x57', href: '/apple-icon-57x57.png' },
        { rel: 'apple-touch-icon', sizes: '60x60', href: '/apple-icon-60x60.png' },
        { rel: 'apple-touch-icon', sizes: '72x72', href: '/apple-icon-72x72.png' },
        { rel: 'apple-touch-icon', sizes: '76x76', href: '/apple-icon-76x76.png' },
        { rel: 'apple-touch-icon', sizes: '114x114', href: '/apple-icon-114x114.png' },
        { rel: 'apple-touch-icon', sizes: '120x120', href: '/apple-icon-120x120.png' },
        { rel: 'apple-touch-icon', sizes: '144x144', href: '/apple-icon-144x144.png' },
        { rel: 'apple-touch-icon', sizes: '152x152', href: '/apple-icon-152x152.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-icon-180x180.png' },

        // Manifest (PWA)
        { rel: 'manifest', href: '/manifest.webmanifest' }
      ],
      script: [
        {
          src: 'https://dapi.kakao.com/v2/maps/sdk.js?appkey=7d883e23cee17f8d46b46624f04b8cf4&autoload=false&libraries=services&v=force1',
          tagPosition: 'head',
          defer: true,
        },
        {
          src: 'https://developers.kakao.com/sdk/js/kakao.js',
          defer: true,
        },
        {
          src: 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js',
          async: true,
        },
      ],
      meta: [
        { name: 'theme-color', content: '#2A2E9D' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },

        // Microsoft 타일 (선택)
        { name: 'msapplication-TileColor', content: '#ffffff' },
        { name: 'msapplication-TileImage', content: '/android-icon-144x144.png' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'ToDeal 중고 & 알바 경매 플랫폼' }
      ]
    }
  }
})
