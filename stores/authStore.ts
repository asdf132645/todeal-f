import { defineStore } from 'pinia'
import { apiClient } from '@/libs/http/apiClient'
import {
    getStoredAccessToken,
    getStoredRefreshToken,
    saveAccessToken,
    saveRefreshToken,
    clearStoredTokens
} from '~/composables/useToken'
import { useFcm } from '~/composables/useFcm'

export const useAuthStore = defineStore('auth', () => {
    const user = ref<any>(null)
    const accessToken = ref<string | null>(getStoredAccessToken())

    // 🔁 새로고침 시 로컬스토리지에 저장된 유저 정보 복원
    if (typeof window !== 'undefined') {
        const savedUser = localStorage.getItem('user')
        if (savedUser) {
            user.value = JSON.parse(savedUser)
        }
    }

    const setUser = (userData: any) => {
        user.value = userData
        if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(userData))
            localStorage.setItem('userId', userData.id)
            localStorage.setItem('nickname', userData.nickname)
            localStorage.setItem('isPremium', userData.isPremium)
        }
    }

    const { registerFcm, unregisterFcm } = useFcm()

    const fetchMyInfo = async () => {
        try {
            const res = await apiClient.get('/api/users/me')
            setUser(res)
            await registerFcm(res?.id)
        } catch (e) {
            console.warn('❌ 사용자 정보 로딩 실패:', e)
            logout()
        }
    }

    const loginBasic = async (email: string, password: string) => {
        const res = await apiClient.post<{
            accessToken: string
            refreshToken: string
            user: any
        }>('/api/users/login', { email, password })

        accessToken.value = res.accessToken
        saveAccessToken(res.accessToken)
        saveRefreshToken(res.refreshToken)
        setUser(res.user)
        await registerFcm(res.user.id)
    }

    const signupBasic = async (form: any) => {
        const res = await apiClient.post<{
            accessToken: string
            refreshToken: string
            user: any
        }>('/api/users/signup', form)

        accessToken.value = res.accessToken
        saveAccessToken(res.accessToken)
        saveRefreshToken(res.refreshToken)
        setUser(res.user)
        await registerFcm(res.user.id)
    }

     const loginWithKakao = async () => {
        const { $kakaoReady } = useNuxtApp()
        await $kakaoReady

        return new Promise(async (resolve, reject) => {
            try {
                await new Promise<void>((res, rej) => {
                    window.Kakao.Auth.login({
                        success: () => res(),
                        fail: (err: any) => rej(new Error(`카카오 로그인 실패: ${JSON.stringify(err)}`))
                    })
                })

                const kakaoAccessToken = window.Kakao.Auth.getAccessToken()
                if (!kakaoAccessToken) {
                    throw new Error('카카오 액세스 토큰이 비어 있습니다.')
                }

                const res = await apiClient.post<{
                    accessToken: string
                    refreshToken: string
                    user: any
                    isNewUser?: boolean
                }>('/api/auth/kakao-login', {
                    accessToken: kakaoAccessToken
                })

                if (res.isNewUser) {
                    return resolve({ isNewUser: true, tempToken: kakaoAccessToken })
                }

                accessToken.value = res.accessToken
                saveAccessToken(res.accessToken)
                saveRefreshToken(res.refreshToken)
                setUser(res.user)
                await registerFcm(res.user.id)

                return resolve({ isNewUser: false })
            } catch (err) {
                console.error('[❌] loginWithKakao error:', err)
                return reject(err)
            }
        })
    }

    const signupWithKakao = async (form: any, tempToken: string) => {
        const res = await apiClient.post<{
            accessToken: string
            refreshToken: string
            user: any
        }>('/api/auth/signup', form, {
            headers: { Authorization: `Bearer ${tempToken}` }
        })

        accessToken.value = res.accessToken
        saveAccessToken(res.accessToken)
        saveRefreshToken(res.refreshToken)
        setUser(res.user)
        await registerFcm(res.user.id)
    }

    const refreshAccessToken = async () => {
        const refreshToken = getStoredRefreshToken()
        if (!refreshToken) throw new Error('리프레시 토큰 없음')

        const res = await apiClient.post<{
            accessToken: string
            refreshToken: string
        }>('/api/auth/refresh-token', {
            refreshToken
        })

        accessToken.value = res.accessToken
        saveAccessToken(res.accessToken)
        saveRefreshToken(res.refreshToken)
        await fetchMyInfo()
    }

    const logout = () => {
        unregisterFcm()
        clearStoredTokens()
        accessToken.value = null
        user.value = null
        if (typeof window !== 'undefined') {
            localStorage.removeItem('user')
            localStorage.removeItem('userId')
            localStorage.removeItem('nickname')
            localStorage.removeItem('isPremium')
            window.location.href = '/auth/login'
        }
    }

    return {
        user,
        accessToken,
        setUser,
        fetchMyInfo,
        loginBasic,
        signupBasic,
        loginWithKakao,
        signupWithKakao,
        refreshAccessToken,
        logout
    }
})
