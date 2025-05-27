import { defineNuxtPlugin } from '#app'

// plugins/i18n.client.ts
export default defineNuxtPlugin(async (nuxtApp) => {
    const lang = localStorage.getItem('lang') || 'ko'
    const i18n = nuxtApp.$i18n

    if (i18n?.locale.value !== lang) {
        await i18n?.setLocale(lang)
    }
})
