export interface DealItem {
    id: number
    title: string
    translatedTitle?: string
    region: string
    currentPrice: number
    createdAt: string
    images: string[]
}

export interface CursorDealResponse {
    items: DealItem[]
    nextCursorId: number | null
    hasNext: boolean
}
