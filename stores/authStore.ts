// ✅ stores/authStore.ts
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

    const setUser = (userData: any) => {
        user.value = userData
    }

    const { registerFcm, unregisterFcm } = useFcm()

    const fetchMyInfo = async () => {
        try {
            const res = await apiClient.get('/api/users/me')
            // console.log(res)
            setUser(res)
            await registerFcm(res?.id)
        } catch (e) {
            console.warn('❌ 사용자 정보 로딩 실패:', e)
            logout()
        }
    }

    // ✅ 일반 로그인
    const loginBasic = async (email: string, password: string) => {
        const res = await apiClient.post<{
            accessToken: string
            refreshToken: string
            user: any
        }>('/api/users/login', { email, password })
        localStorage.setItem('userId',res.user.id);

        accessToken.value = res.accessToken
        saveAccessToken(res.accessToken)
        saveRefreshToken(res.refreshToken)
        setUser(res.user)
        registerFcm(res.user.id)
    }

    // ✅ 일반 회원가입
    const signupBasic = async (form: any) => {
        const res = await apiClient.post<{ token: string }>('/api/users/signup', form)
        accessToken.value = res.token
        saveAccessToken(res.token)
        await fetchMyInfo()
    }

    // ✅ 카카오 로그인
    const loginWithKakao = async () => {
        if (typeof window === 'undefined' || !window.Kakao?.isInitialized?.()) {
            throw new Error('Kakao SDK not available')
        }

        await window.Kakao.Auth.login()
        const kakaoAccessToken = window.Kakao.Auth.getAccessToken()
        if (!kakaoAccessToken) throw new Error('카카오 토큰 없음')

        const res = await apiClient.post<any>('/api/auth/kakao-login', {
            accessToken: kakaoAccessToken
        })

        if (res.isNewUser) {
            return { isNewUser: true, tempToken: kakaoAccessToken }
        }

        accessToken.value = res.accessToken
        saveAccessToken(res.accessToken)
        saveRefreshToken(res.refreshToken)
        setUser(res.user)
        registerFcm(res.user.id)
        return { isNewUser: false }
    }

    // ✅ 카카오 회원가입
    const signupWithKakao = async (form: any, tempToken: string) => {
        const res = await apiClient.post<{ token: string }>('/api/auth/signup', form, {
            headers: { Authorization: `Bearer ${tempToken}` }
        })
        accessToken.value = res.token
        saveAccessToken(res.token)
        await fetchMyInfo()
    }

    // ✅ 리프레시 토큰으로 accessToken 재발급 + 유저 정보 갱신
    const refreshAccessToken = async () => {
        const refreshToken = getStoredRefreshToken()
        if (!refreshToken) throw new Error('리프레시 토큰 없음')

        const res = await apiClient.post<{ accessToken: string }>('/api/auth/refresh-token', {
            refreshToken
        })
        accessToken.value = res.accessToken
        saveAccessToken(res.accessToken)

        // ✅ 유저 정보 다시 불러오기
        await fetchMyInfo()
    }

    // ✅ 로그아웃 (FCM 해제 포함)
    const logout = () => {
        unregisterFcm()
        clearStoredTokens()
        accessToken.value = null
        user.value = null
        if (typeof window !== 'undefined') {
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
