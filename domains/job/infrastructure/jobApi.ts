import { apiClient } from '@/libs/http/apiClient'

export interface Job {
    id: number
    title: string
    description: string
    currentPrice: number
    location?: string
    images?: string[]
}

export const jobApi = {
    fetchTodayJobs: (): Promise<Job[]> => {
        return apiClient.get<Job[]>('/deals?type=parttime&sort=latest')
    }
}
