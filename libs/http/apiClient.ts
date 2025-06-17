import type { ApiResponse } from './apiResponse'
import {
    getStoredAccessToken,
    getStoredRefreshToken,
    saveAccessToken,
    clearStoredTokens,
} from '~/composables/useToken'
import { jwtDecode } from 'jwt-decode'
import { useAuthStore } from '@/stores/authStore'

let _nuxtApp: ReturnType<typeof useNuxtApp> | null = null
let _router: ReturnType<typeof useRouter> | null = null

export function initApiClient() {
    _nuxtApp = useNuxtApp()
    _router = useRouter()
}

function handleResponse<T>(res: ApiResponse<T>): T {
    if (!res.success) {
        if (typeof res.message === 'string') {
            throw new Error(res.message)
        } else if (typeof res.message === 'object') {
            const firstError = Object.values(res.message)[0]
            throw new Error(typeof firstError === 'string' ? firstError : '요청 실패')
        }
        throw new Error('요청 실패')
    }
    return res.data as T
}


function isTokenExpired(token: string): boolean {
    try {
        const decoded: any = jwtDecode(token)
        const now = Date.now() / 1000
        return decoded.exp < now
    } catch {
        return true // malformed token도 만료로 간주
    }
}

async function reissueAccessToken(): Promise<string | null> {
    const refreshToken = getStoredRefreshToken()
    if (!refreshToken || !_nuxtApp) return null

    try {
        const res = await _nuxtApp.$axios.post('/api/auth/reissue', { refreshToken })
        const newAccessToken = res.data.data.accessToken
        saveAccessToken(newAccessToken)
        return newAccessToken
    } catch (err: any) {
        if (err.response?.status === 403) {
            const auth = useAuthStore()
            auth.logout() // 토큰 초기화 + 라우터 이동 포함
        }
        return null
    }
}

async function request<T>(
    method: 'get' | 'post' | 'put' | 'patch' | 'delete',
    url: string,
    data?: any,
    config: any = {}
): Promise<T> {
    if (!_nuxtApp || !_router) throw new Error('apiClient 사용 전 initApiClient() 먼저 호출해야 합니다.')

    let accessToken = getStoredAccessToken()

    // ✅ accessToken 만료 시 자동 재발급
    if (accessToken && isTokenExpired(accessToken)) {
        const newToken = await reissueAccessToken()
        if (!newToken) {
            clearStoredTokens()
            await _router.push('/auth/login')
            throw new Error('토큰 만료: 로그인 다시 필요')
        }
        accessToken = newToken
    }

    try {
        const userId = process.client ? localStorage.getItem('userId') : null

        const headers = {
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
            ...(userId ? { 'X-USER-ID': userId } : {}),
            ...(config.headers || {}),
        }

        const res = await _nuxtApp.$axios.request<ApiResponse<T>>({
            method,
            url,
            data,
            ...config,
            headers,
        })

        return handleResponse(res.data)
    } catch (err: any) {
        if (err.response?.status === 401) {
            const auth = useAuthStore()
            auth.logout()
        }
        throw err
    }
}

export const apiClient = {
    get: <T>(url: string, config?: any) => request<T>('get', url, undefined, config),
    post: <T>(url: string, data?: any, config?: any) => request<T>('post', url, data, config),
    put: <T>(url: string, data?: any, config?: any) => request<T>('put', url, data, config),
    patch: <T>(url: string, data?: any, config?: any) => request<T>('patch', url, data, config),
    delete: <T>(url: string, config?: any) => request<T>('delete', url, undefined, config),
}
