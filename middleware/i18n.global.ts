// middleware/i18n.global.ts
import { defineNuxtRouteMiddleware } from '#app'

export default defineNuxtRouteMiddleware(() => {
    if (process.client) {
        const lang = localStorage.getItem('lang') || 'ko'
        const i18n = useNuxtApp().$i18n
        if (i18n.locale.value !== lang) {
            i18n.locale.value = lang
        }
    }
})
