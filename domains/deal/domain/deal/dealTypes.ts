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
}
