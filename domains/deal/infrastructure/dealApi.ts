// ✅ src/domains/deal/infrastructure/dealApi.ts
import { apiClient } from '@/libs/http/apiClient'
import type { Deal } from '@/domains/deal/domain/deal/dealTypes'
import type { DealRequest } from '@/domains/deal/domain/deal/dto/DealRequest'
import type { DealResponse } from '@/domains/deal/domain/deal/dto/DealResponse'

export const dealApi = {
    fetchDeals(
        type: 'used' | 'parttime',
        sort: 'distance' | 'deadline' | 'latest'
    ): Promise<Deal[]> {
        return apiClient.get<Deal[]>(`/deals?type=${type}&sort=${sort}`)
    },

    createDeal(payload: DealRequest): Promise<DealResponse> {
        return apiClient.post<DealResponse>('/api/deals', payload)
    },

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
        return apiClient.get<Deal[]>('/deals/nearby', {
            params: { lat, lng, radius, type }
        })
    },

    // ✅ 무한스크롤용 리스트 조회
    getList({
                type,
                page,
                pageSize
            }: {
        type: 'used' | 'parttime' | 'barter'
        page: number
        pageSize: number
    }): Promise<DealResponse[]> {
        return apiClient.get<DealResponse[]>('/api/deals', {
            params: { type, page, pageSize }
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
    }
}
