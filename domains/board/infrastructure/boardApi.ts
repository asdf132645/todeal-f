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
    }) {
        return apiClient.get('/api/board', { params })
    },

    /** 게시글 단건 조회 */
    getPost(postId: number) {
        return apiClient.get(`/api/board/${postId}`)
    },

    /** 게시글 작성 (프론트에서 자동 번역 포함해서 보냄) */
    createPost(payload: any) {
        return apiClient.post('/api/board', payload)
    },

    /** 게시글 수정 (프론트에서 번역 포함해서 보냄) */
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

    /** 댓글 작성 (프론트에서 자동 번역 포함해서 보냄) */
    createComment(payload: any) {
        return apiClient.post('/api/board/comments', payload)
    },

    /** 내가 쓴 게시글 목록 */
    getMyPosts() {
        return apiClient.get('/api/board/mine')
    }
}
