// middleware/intro.global.ts
import { defineNuxtRouteMiddleware } from '#app'

export default defineNuxtRouteMiddleware((to) => {
    const lang = process.client ? localStorage.getItem('lang') : null

    if (!lang && to.path !== '/intro') {
        return navigateTo('/intro')
    }
})
