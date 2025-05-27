export type PricingType = 'BIDDING' | 'FIXED' // ✅ 거래 방식 enum 정의

export interface Deal {
    id: number
    title: string
    description: string
    type: 'used' | 'parttime'
    startPrice: number
    currentPrice: number
    deadline: string
    images: string[]
    latitude: number
    longitude: number
    pricingType: PricingType // ✅ 거래 방식 추가
}
