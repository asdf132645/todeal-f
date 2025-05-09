// ✅ ~/domains/bid/infrastructure/bidApi.ts
import { apiClient } from '@/libs/http/apiClient'

export const bidApi = {
    /** 입찰 등록 */
    placeBid(payload: {
        dealId: number,
        amount: number,
        nickname: string,
    }) {
        return apiClient.post('/api/bids', payload)
    },

    /** 낙찰자 정보 조회 */
    getWinnerByDealId(dealId: number) {
        return apiClient.get(`/api/bids/winner`, {
            params: { dealId }
        })
    },

    /** 특정 딜의 입찰 내역 */
    getBidListByDealId(dealId: number) {
        return apiClient.get(`/api/bids?dealId=${dealId}`)
    },

    /** 낙찰 확정 */
    selectWinnerBid(bidId: number) {
        return apiClient.post(`/api/bids/${bidId}/select-winner`)
    },

    /** 내가 입찰한 물건들 */
    getMyBids() {
        return apiClient.get('/api/bids/mine')
    },

    /** 내 물건에 입찰된 목록 */
    getBidsOnMyDeals() {
        return apiClient.get('/api/bids/on-my-deals')
    }
}