export type PricingType = 'BIDDING' | 'FIXED'

export interface DealRequest {
    title: string
    description: string
    type: 'used' | 'parttime' | 'barter' | 'parttime-request'
    startPrice: number
    deadline: string // ISO 8601
    region: string
    regionDepth1: string
    regionDepth2: string
    regionDepth3: string
    latitude: number
    longitude: number
    pricingType: PricingType
    images: string[] // S3 업로드 완료된 URL
    hashtags: string[]

    translatedTitle: string | null     // ✅ 번역된 제목
    translatedContent: string | null   // ✅ 번역된 설명
    language: string | null            // ✅ 번역된 언어 (예: 'en')
}
