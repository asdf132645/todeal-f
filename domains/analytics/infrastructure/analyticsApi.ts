import { apiClient } from '~/libs/http/apiClient'

export const analyticsApi = {
    logVisitor: (path: string, userAgent: string) => {
        return apiClient.post('/api/analytics/visit', {
            path,
            userAgent
        })
    },
    logSearch: (keyword: string) => {
        return apiClient.post('/api/analytics/search', { keyword })
    },

    getTopSearches: () => {
        return apiClient.get<{ keyword: string; count: number }[]>('/api/analytics/top-searches')
    }
}
