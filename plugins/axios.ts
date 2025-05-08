// plugins/axios.ts
import { defineNuxtPlugin, useRuntimeConfig } from '#app'
import axios from 'axios'

export default defineNuxtPlugin((nuxtApp) => {
    const config = useRuntimeConfig()

    const axiosInstance = axios.create({
        baseURL: config.public.apiBase,
        headers: {
            'Content-Type': 'application/json'
        }
    })

    // ✅ 목업 유저 ID 추가
    axiosInstance.interceptors.request.use((req) => {
        req.headers['X-USER-ID'] = '1' // ← 여기에 원하는 목업 userId 임시데이터
        return req
    })

    // 전역 주입
    nuxtApp.provide('axios', axiosInstance)
})
