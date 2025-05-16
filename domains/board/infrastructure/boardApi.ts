import { apiClient } from '@/libs/http/apiClient'

export const boardApi = {
    /** 게시글 목록 조회 (위치 기반) */
    getPosts(params?: {
        latitude?: number
        longitude?: number
        distance?: number
    }) {
        return apiClient.get('/api/board', { params })
    },

    /** 게시글 단건 조회 */
    getPost(postId: number) {
        return apiClient.get(`/api/board/${postId}`)
    },

    /** 게시글 작성 */
    createPost(payload: {
        title: string
        content: string
        latitude: number
        longitude: number
    }) {
        return apiClient.post('/api/board', payload)
    },

    /** 게시글 수정 */
    updatePost(postId: number, payload: {
        title: string
        content: string
    }) {
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
    createComment(payload: {
        postId: number
        content: string
        nickname: string
    }) {
        return apiClient.post('/api/board/comments', payload)
    },


    /** 내가 쓴 게시글 목록 */
    getMyPosts() {
        return apiClient.get('/api/board/mine')
    }
}
