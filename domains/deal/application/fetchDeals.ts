// src/domains/deal/application/fetchDeals.ts
import { dealApi } from '../infrastructure/dealApi'
import type { Deal } from '~/domains/deal/domain/deal/dealTypes'

export const fetchDeals = async (
    type: 'used' | 'parttime',
    sort: 'distance' | 'deadline' | 'latest'
): Promise<Deal[]> => {
    return await dealApi.fetchDeals(type, sort)
}
