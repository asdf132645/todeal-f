// ✅ ~/domains/trustscore/infrastructure/trustScoreApi.ts
import { apiClient } from '@/libs/http/apiClient'
import type { TrustScoreType } from './trustScoreType'

export const trustScoreApi = {
    // ✅ 후기 리스트 조회 (페이징 + 타입 필터링)
    async getUserReviews(userId: number, params?: {
        page?: number
        size?: number
        type?: TrustScoreType
    }) {
        const response = await apiClient.get(`/trust-scores/user/${userId}/reviews`, { params })
        return response?.data
    },

    // 기존 평점 조회도 유지
    async getUserScores(userIds: number[]) {
        const response = await apiClient.get('/trust-scores', { params: { userIds } })
        return response?.data
    },
}

