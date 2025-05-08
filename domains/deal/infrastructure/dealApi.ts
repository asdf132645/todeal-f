// src/domains/deal/infrastructure/dealApi.ts
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
                               type
                           }: {
        lat: number
        lng: number
        type: 'used' | 'parttime'
    }) {
        return apiClient.get<Deal[]>('/deals/nearby', {
            params: { lat, lng, type }
        })
    }

}

