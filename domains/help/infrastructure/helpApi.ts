import { apiClient } from '@/libs/http/apiClient'

export const helpApi = {
    getMyInquiries: async () => {
        const res = await apiClient.get('/api/support/me')
        return res
    }
}
