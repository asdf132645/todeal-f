// ✅ src/domains/deal/infrastructure/dealApi.ts
import { apiClient } from '@/libs/http/apiClient'
import type { Deal } from '@/domains/deal/domain/deal/dealTypes'
import type { DealRequest } from '@/domains/deal/domain/deal/dto/DealRequest'
import type { DealResponse } from '@/domains/deal/domain/deal/dto/DealResponse'
import { useAuthStore } from '@/stores/authStore'

export const dealApi = {
    fetchDeals(
        type: 'used' | 'parttime',
        sort: 'distance' | 'deadline' | 'latest'
    ): Promise<Deal[]> {
        return apiClient.get<Deal[]>(`/api/deals?type=${type}&sort=${sort}`)
    },

    async createDeal(payload: DealRequest): Promise<DealResponse> {
        const auth = useAuthStore() // ✅ 핀아에서 유저 정보 가져오기
        console.log(auth.user)
        return apiClient.post('/api/deals', payload, {
            headers: {
                'X-USER-ID': auth.user.id
            }
        })
    },

    checkDealRegistration: () => apiClient.get('/api/users/deal-check'),
    notifyAdComplete: () => apiClient.post('/api/users/ad-complete'),

    getDealById(id: number): Promise<DealResponse> {
        return apiClient.get<DealResponse>(`/api/deals/${id}`)
    },

    getTodayDeals(): Promise<DealResponse[]> {
        return apiClient.get<DealResponse[]>('/api/deals/today')
    },

    async fetchNearbyDeals({
                               lat,
                               lng,
                               radius,
                               type
                           }: {
        lat: number
        lng: number
        radius: number
        type: 'used' | 'parttime'
    }) {
        return apiClient.get<Deal[]>('/api/deals/nearby', {
            params: { lat, lng, radius, type }
        })
    },

    // ✅ 무한스크롤용 리스트 조회
    getList({
                type,
                size,
                cursor,
                lat,
                lng,
                radius,
            }: {
        type: 'used' | 'parttime' | 'barter'
        size: number
        cursor?: number
        lat?: number
        lng?: number
        radius?: number
    }): Promise<{ items: DealResponse[]; nextCursor: number | null }> {
        console.log(' getList 호출됨:', { type, size, cursor, lat, lng, radius })

        return apiClient.get('/api/deals', {
            params: { type, size, cursor, lat, lng, radius, useLocation: true }
        })
    },



    searchDeals(params: {
        type: string
        tags?: string[]
        minPrice?: number
        maxPrice?: number
        sort?: string
        page?: number
        radius?: number
        lat?: number
        lng?: number
    }) {
        return apiClient.get('/api/deals/search', { params })
    },

    // ✅ 거래종료 (딜 삭제) 메서드 추가
    deleteDeal(dealId: number): Promise<void> {
        return apiClient.delete(`/api/deals/${dealId}`)
    },

    // ✅ 내가 등록한 딜 목록 조회
    getMyDeals(): Promise<DealResponse[]> {
        return apiClient.get('/api/deals/mine')
    },

    // ✅ 딜 수정 요청
    updateDeal(dealId: number, payload: DealRequest): Promise<DealResponse> {
        return apiClient.put(`/api/deals/${dealId}`, payload)
    },
    getTicket(): Promise<{
        id: number
        type: string
        remaining: number
        adRequired: boolean
        updatedAt: string
    }> {
        return apiClient.get('/api/users/ticket')
    }


}
