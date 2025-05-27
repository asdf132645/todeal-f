export type PricingType = 'BIDDING' | 'FIXED'

export interface DealRequest {
    title: string
    description: string
    type: 'used' | 'parttime' | 'barter' | 'parttime-request'
    startPrice: number
    deadline: string // ISO 8601
    region: string
    regionDepth1: string
    pricingType: PricingType // ✅ 추가
    regionDepth2: string
    regionDepth3: string
    latitude: number
    longitude: number
    images: string[] // S3 업로드 완료된 URL
    hashtags: string[]
}
