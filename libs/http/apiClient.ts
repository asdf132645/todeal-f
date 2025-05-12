// ✅ libs/http/apiClient.ts
import type { ApiResponse } from './apiResponse'
import { useNuxtApp, useRouter } from '#app'
import {
    getStoredRefreshToken,
    getStoredAccessToken,
    saveAccessToken,
    clearStoredTokens
} from '~/composables/useToken'
import { useAuthStore } from '@/stores/authStore'

function handleResponse<T>(res: ApiResponse<T>): T {
    if (!res.success) {
        throw new Error(res.message || '요청 실패')
    }
    return res.data as T
}

async function clearTokensAndRedirect() {
    clearStoredTokens()
    const router = useRouter()
    await router.push('/auth/login')
}

async function request<T>(
    method: 'get' | 'post' | 'put' | 'patch' | 'delete',
    url: string,
    data?: any,
    config: any = {}
): Promise<T> {
    const { $axios } = useNuxtApp()
    const authStore = useAuthStore()

    try {
        const token = getStoredAccessToken()
        if (!config.headers) config.headers = {}

        if (token && token.split('.').length === 3) {
            config.headers.Authorization = `Bearer ${token}`
        }

        const res = await $axios.request<ApiResponse<T>>({ method, url, data, ...config })
        return handleResponse(res.data)

    } catch (error: any) {
        // ✅ accessToken 만료 시
        if (error.response?.status === 401) {
            const refreshToken = getStoredRefreshToken()

            // ⛔ refreshToken 조차 없음 → 즉시 로그아웃
            if (!refreshToken) {
                alert('⛔ 세션이 만료되었습니다. 다시 로그인해주세요.')
                await clearTokensAndRedirect()
                return Promise.reject(error)
            }

            try {
                // 🔄 refreshToken으로 accessToken 재발급
                const refreshRes = await $axios.post<ApiResponse<{ accessToken: string }>>(
                    '/api/auth/refresh-token',
                    { refreshToken }
                )
                const newAccessToken = refreshRes.data.data.accessToken
                saveAccessToken(newAccessToken)

                // ✅ 유저 정보도 다시 세팅 (선택)
                const userRes = await $axios.get<ApiResponse<any>>('/api/users/me', {
                    headers: { Authorization: `Bearer ${newAccessToken}` }
                })
                authStore.setUser(userRes.data.data)

                // 🔁 원래 요청 재시도
                config.headers.Authorization = `Bearer ${newAccessToken}`
                const retryRes = await $axios.request<ApiResponse<T>>({ method, url, data, ...config })
                return handleResponse(retryRes.data)

            } catch (refreshErr) {
                // ⛔ refreshToken도 만료됨
                alert('⛔ 로그인 세션이 만료되었습니다. 다시 로그인해주세요.')
                await clearTokensAndRedirect()
                return Promise.reject(refreshErr)
            }
        }

        throw error
    }
}

export const apiClient = {
    get: <T>(url: string, config?: any) => request<T>('get', url, undefined, config),
    post: <T>(url: string, data?: any, config?: any) => request<T>('post', url, data, config),
    put: <T>(url: string, data?: any, config?: any) => request<T>('put', url, data, config),
    patch: <T>(url: string, data?: any, config?: any) => request<T>('patch', url, data, config),
    delete: <T>(url: string, config?: any) => request<T>('delete', url, undefined, config),
}
