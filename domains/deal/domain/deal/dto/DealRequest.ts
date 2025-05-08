export interface DealRequest {
    title: string
    description: string
    startPrice: number
    deadline: string // ISO string
    hashtags: string[]
    images: string[] // S3 URL 배열
}
