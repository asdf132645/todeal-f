// src/domains/hashtag/infrastructure/hashtagApi.ts
import { apiClient } from '@/libs/http/apiClient'

let popularCache: { data: string[], expires: number } | null = null
let weeklyCache: { data: string[], expires: number } | null = null

const TTL_MS = 5 * 60 * 1000 // 5분

export const hashtagApi = {
    async fetchPopularHashtags(limit = 10): Promise<string[]> {
        const now = Date.now()

        if (popularCache && now < popularCache.expires) {
            return popularCache.data
        }

        const result = await apiClient.get<string[]>('/api/hashtags/popular', {
            params: { limit }
        })
        popularCache = { data: result, expires: now + TTL_MS }
        return result
    },

    async fetchWeeklyPopularHashtags(limit = 10): Promise<string[]> {
        const now = Date.now()

        if (weeklyCache && now < weeklyCache.expires) {
            return weeklyCache.data
        }

        const result = await apiClient.get<string[]>('/api/hashtags/popular/week', {
            params: { limit }
        })
        weeklyCache = { data: result, expires: now + TTL_MS }
        return result
    }
}
