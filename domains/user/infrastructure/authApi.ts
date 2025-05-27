// ✅ domains/auth/infrastructure/authApi.ts
import { apiClient } from '@/libs/http/apiClient'

export const authApi = {
    // ✅ 일반 로그인
    loginBasic: async (email: string, password: string) => {
        return await apiClient.post<{
            accessToken: string
            refreshToken: string
            user: any
        }>('/api/users/login', { email, password })
    },

    // ✅ 일반 회원가입
    signupBasic: async (form: any) => {
        return await apiClient.post<{ token: string }>('/api/users/signup', form)
    },

    // ✅ 카카오 로그인
    loginWithKakao: async (kakaoAccessToken: string) => {
        return await apiClient.post<any>('/api/auth/kakao-login', {
            accessToken: kakaoAccessToken
        })
    },

    // ✅ 카카오 회원가입
    signupWithKakao: async (form: any, tempToken: string) => {
        return await apiClient.post<{ token: string }>('/api/auth/signup', form, {
            headers: { Authorization: `Bearer ${tempToken}` }
        })
    },

    // ✅ 내 정보 조회
    fetchMyInfo: async () => {
        return await apiClient.get('/api/users/me')
    },

    // ✅ 액세스 토큰 재발급
    refreshAccessToken: async (refreshToken: string) => {
        return await apiClient.post<{ accessToken: string; refreshToken: string }>(
            '/api/auth/refresh-token',
            { refreshToken }
        )
    }

}