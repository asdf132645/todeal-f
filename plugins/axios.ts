// plugins/axios.ts
import { defineNuxtPlugin, useRuntimeConfig } from '#app'
import axios from 'axios'
import { initApiClient } from '@/libs/http/apiClient'
import { useAuthStore } from '@/stores/authStore' // 🔥 auth store import 필요

export default defineNuxtPlugin((nuxtApp) => {
    const config = useRuntimeConfig()

    const axiosInstance = axios.create({
        baseURL: config.public.apiBase,
        headers: {
            'Content-Type': 'application/json'
        }
    })

    // 인터셉터에 사용자 ID 헤더 추가
    axiosInstance.interceptors.request.use((req) => {
        const auth = useAuthStore()
        if (auth.user?.id) {
            req.headers['X-USER-ID'] = String(auth.user.id)
        }
        return req
    })

    // ✅ $axios 인스턴스를 Nuxt에 등록
    nuxtApp.provide('axios', axiosInstance)

    // ✅ apiClient 내부에서도 이 인스턴스 쓸 수 있도록 초기화
    initApiClient(axiosInstance)
})
