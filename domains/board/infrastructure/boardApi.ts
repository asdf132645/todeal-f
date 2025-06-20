import { apiClient } from '@/libs/http/apiClient'

export const boardApi = {
    /** 게시글 목록 조회 (위치 기반) */
    getPosts(params?: {
        latitude?: number
        longitude?: number
        distance?: number
        category?: string
        keyword?: string
        field?: 'title' | 'content' | 'nickname'
        cursorCreatedAt?: string | null
        cursorId?: number | null
        size?: number
    }) {
        return apiClient.get('/api/board', { params })
    },


    /** 게시글 단건 조회 */
    getPost(postId: number) {
        return apiClient.get(`/api/board/${postId}`)
    },

    /** 게시글 작성 (이미지 포함) */
    createPost(payload: {
        title: string
        content: string
        category: string
        language: string
        translatedTitle?: string
        translatedContent?: string
        latitude: number
        longitude: number
        nickname: string
        region?: string
        imageUrls: string[]  //  추가됨
    }) {
        return apiClient.post('/api/board', payload)
    },

    /** 게시글 수정 */
    updatePost(postId: number, payload: any) {
        return apiClient.patch(`/api/board/${postId}`, payload)
    },

    /** 게시글 삭제 */
    deletePost(postId: number) {
        return apiClient.delete(`/api/board/${postId}`)
    },

    /** 댓글 목록 조회 */
    getComments(postId: number) {
        return apiClient.get(`/api/board/${postId}/comments`)
    },

    /** 댓글 작성 */
    createComment(payload: any) {
        return apiClient.post('/api/board/comments', payload)
    },

    /** 내가 쓴 게시글 목록 */
    getMyPosts(params: { page: number; size: number }) {
        return apiClient.get('/api/board/mine', { params })
    }

}
