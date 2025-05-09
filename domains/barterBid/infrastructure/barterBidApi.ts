// ✅ @/domains/barterBid/infrastructure/barterBidApi.ts
import { apiClient } from '~/libs/http/apiClient'

export const barterBidApi = {
    /** 교환 제안 등록 */
    propose(payload: {
        dealId: number
        proposedItem: string
        description: string
        images: string[]
    }) {
        return apiClient.post('/api/barter-bids', payload)
    },

    /** 해당 거래의 제안 목록 조회 */
    getListByDealId(dealId: number) {
        return apiClient.get(`/api/barter-bids`, {
            params: { dealId }
        })
    },

    /** 제안 수락 */
    accept(bidId: number) {
        return apiClient.post(`/api/barter-bids/${bidId}/accept`)
    },

    /** 제안 거절 */
    reject(bidId: number) {
        return apiClient.post(`/api/barter-bids/${bidId}/reject`)
    }
}