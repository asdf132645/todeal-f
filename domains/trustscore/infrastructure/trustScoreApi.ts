// ✅ ~/domains/trustscore/infrastructure/trustScoreApi.ts
import { apiClient } from '@/libs/http/apiClient'
import type { TrustScoreType } from './trustScoreType'
import qs from 'qs'


export const trustScoreApi = {
    async createReview(payload: {
        toUserId: number
        dealId: number
        isPositive: boolean
        comment: string
    }) {
        const userId = Number(localStorage.getItem('userId'))
        const response = await apiClient.post('/api/trust-scores/submit', payload, {
            headers: {
                'X-USER-ID': userId
            }
        })
        return response?.data
    },


    // 후기 리스트 조회 (페이징 + 타입 필터링)
    async getUserReviews(userId: number, params?: {
        page?: number
        size?: number
        type?: TrustScoreType
    }) {
        const response = await apiClient.get(`/api/trust-scores/user/${userId}/reviews`, { params })
        return response
    },

    // 기존 평점 조회도 유지
    async getUserScores(userIds: number[]) {
        const response = await apiClient.get('/api/trust-scores', {
            params: {
                userIds: userIds.join(',')  // ✅ '1,2,3' 형태로 보냄
            }
        })
        console.log(response)
        return response
    },
}

