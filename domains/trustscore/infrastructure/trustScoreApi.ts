// ✅ ~/domains/trustscore/infrastructure/trustScoreApi.ts
import { apiClient } from '@/libs/http/apiClient'

export const trustScoreApi = {
    submitScore(toUserId: number, dealId: number, isPositive: boolean): Promise<void> {
        return apiClient.post('/api/trust-scores/submit', {
            toUserId,
            dealId,
            isPositive
        })
    },

    // ✅ 다중 사용자 투딜지수 조회
    getUserScores(userIds: number[]): Promise<Record<number, number>> {
        const params = new URLSearchParams()
        userIds.forEach(id => params.append('userIds', id.toString()))

        return apiClient.get(`/api/trust-scores?${params.toString()}`)
            .then(res => res.data)
    }


}
