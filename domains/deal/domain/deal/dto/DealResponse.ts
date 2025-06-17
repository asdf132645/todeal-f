export interface DealResponse {
    id: number
    title: string                 // 원문 제목
    description: string           // 원문 설명
    currentPrice: number
    deadline: string
    images: string[]
    createdAt: string
    hashtags: string[]

    translatedTitle: string | null    // 번역된 제목 (nullable)
    translatedContent: string | null  // 번역된 설명 (nullable)
    language: string | null           // 번역 언어 (예: "en")
}
