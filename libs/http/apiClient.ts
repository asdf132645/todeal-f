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
import { jwtDecode } from 'jwt-decode'

function handleResponse<T>(res: ApiResponse<T>): T {
    if (!res.success) {
        throw new Error(res.message || '요청 실패')
    }
    return res.data as T
}

function isTokenExpired(token: string): boolean {
    try {
        const decoded: any = jwtDecode(token)
        const now = Date.now() / 1000
        return decoded.exp < now
    } catch {
        return true // 디코딩 실패 시 만료로 간주
    }
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
        if (error.response?.status === 401) {
            const refreshToken = getStoredRefreshToken()

            if (!refreshToken || isTokenExpired(refreshToken)) {
                alert('⛔ 로그인 세션이 만료되었습니다. 다시 로그인해주세요.')
                await clearTokensAndRedirect()
                return Promise.reject(error)
            }

            try {
                const refreshRes = await $axios.post<ApiResponse<{ accessToken: string }>>(
                    '/api/auth/refresh-token',
                    { refreshToken }
                )
                const newAccessToken = refreshRes.data.data.accessToken
                saveAccessToken(newAccessToken)

                const userRes = await $axios.get<ApiResponse<any>>('/api/users/me', {
                    headers: { Authorization: `Bearer ${newAccessToken}` }
                })
                authStore.setUser(userRes.data.data)

                config.headers.Authorization = `Bearer ${newAccessToken}`
                const retryRes = await $axios.request<ApiResponse<T>>({ method, url, data, ...config })
                return handleResponse(retryRes.data)

            } catch (refreshErr) {
                alert('⛔ 세션이 만료되었습니다. 다시 로그인해주세요.')
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
