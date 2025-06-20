// ~/domains/support/infrastructure/supportApi.ts

import {apiClient} from "~/libs/http/apiClient";

export const supportApi = {
    async fetchAll() {
        const res = await apiClient.get('/api/support/admin');
        return res
    },
    async submitReply(id: number, reply: string) {
        const res = await apiClient.patch(`/api/support/${id}/reply`, null, {
            params: { reply }
        })
        return res.data
    },

    submitInquiry: (payload: {
        type: string
        title: string
        email: string
        content: string //  이름 통일
    }) => apiClient.post('/api/support', payload),


}
