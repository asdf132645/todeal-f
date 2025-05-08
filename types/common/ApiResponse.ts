// src/types/common/ApiResponse.ts
export interface ApiResponse<T> {
    success: boolean
    data: T
    message?: string
}
