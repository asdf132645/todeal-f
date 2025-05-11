// libs/http/apiClient.ts
import type { ApiResponse } from './apiResponse'
import { useNuxtApp } from '#app'

function handleResponse<T>(res: ApiResponse<T>): T {
    if (!res.success) {
        throw new Error(res.message || '요청 실패')
    }
    return res.data as T
}

export const apiClient = {
    get: async <T>(url: string, config = {}): Promise<T> => {
        const axios = useNuxtApp().$axios
        const res = await axios.get<ApiResponse<T>>(url, config)
        return handleResponse(res.data)
    },

    post: async <T>(url: string, data?: object): Promise<T> => {
        const axios = useNuxtApp().$axios
        const res = await axios.post<ApiResponse<T>>(url, data)
        return handleResponse(res.data)
    },

    patch: async <T>(url: string, data?: object): Promise<T> => {
        const axios = useNuxtApp().$axios
        const res = await axios.patch<ApiResponse<T>>(url, data)
        return handleResponse(res.data)
    },


    put: async <T>(url: string, data?: object): Promise<T> => {
        const axios = useNuxtApp().$axios
        const res = await axios.put<ApiResponse<T>>(url, data)
        return handleResponse(res.data)
    },

    delete: async <T>(url: string): Promise<T> => {
        const axios = useNuxtApp().$axios
        const res = await axios.delete<ApiResponse<T>>(url)
        return handleResponse(res.data)
    },
}
