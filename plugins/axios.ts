// plugins/axios.ts
import { defineNuxtPlugin, useRuntimeConfig } from '#app'
import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'

export default defineNuxtPlugin((nuxtApp) => {
    const config = useRuntimeConfig()

    const axiosInstance = axios.create({
        baseURL: config.public.apiBase,
        headers: {
            'Content-Type': 'application/json'
        }
    })

    // ✅ 로그인된 유저 ID를 동적으로 헤더에 넣음
    axiosInstance.interceptors.request.use((req) => {
        const auth = useAuthStore()
        if (auth.user?.id) {
            req.headers['X-USER-ID'] = String(auth.user.id)
        }
        return req
    })

    // 전역 주입
    nuxtApp.provide('axios', axiosInstance)
})
