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
        return true
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
        const token = process.client ? getStoredAccessToken() : ''
        if (!config.headers) config.headers = {}

        // ✅ accessToken 적용
        if (token && token.split('.').length === 3) {
            config.headers.Authorization = `Bearer ${token}`
        }

        // ✅ X-USER-ID 설정
        const userId = authStore.user?.id ?? (process.client ? localStorage.getItem('userId') : null)
        if (userId) {
            config.headers['X-USER-ID'] = userId.toString()
        }

        const res = await $axios.request<ApiResponse<T>>({ method, url, data, ...config })
        return handleResponse(res.data)

    } catch (error: any) {
        // ✅ accessToken 만료 대응
        if (error.response?.status === 401) {
            const refreshToken = process.client ? getStoredRefreshToken() : ''

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

                // ✅ 사용자 정보 재조회 후 저장
                const userRes = await $axios.get<ApiResponse<any>>('/api/users/me', {
                    headers: { Authorization: `Bearer ${newAccessToken}` }
                })
                const user = userRes.data.data
                authStore.setUser(user)
                if (process.client) {
                    localStorage.setItem('userId', user.id)
                }

                // ✅ 재시도 요청
                config.headers.Authorization = `Bearer ${newAccessToken}`
                config.headers['X-USER-ID'] = user.id.toString()

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