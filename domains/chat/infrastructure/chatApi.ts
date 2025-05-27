import { apiClient } from '@/libs/http/apiClient'

export const chatApi = {
    /** 특정 채팅방의 최신 메시지 목록 (최대 limit개) */
    getRecentMessages(chatRoomId: number, limit: number = 1500, lastMessageId?: number) {
        return apiClient.get('/api/chats/messages', {
            params: {
                chatRoomId,
                limit,
                ...(lastMessageId ? { lastMessageId } : {})
            }
        })
    },

    /** 채팅방 목록 조회 */
    getChatRooms() {
        return apiClient.get('/api/chats/room')
    },

    /** 채팅방 생성 */
    createChatRoom(payload: {
        dealId: number
        sellerId: number
        buyerId: number
    }) {
        return apiClient.post('/api/chats/room', payload)
    },

    /** ✅ 채팅방 존재 여부 확인 (추가됨) */
    checkChatRoomExist(payload: {
        dealId: number
        userId1: number
        userId2: number
    }) {
        return apiClient.get('/api/chats/room/exist', {
            params: payload
        })
    },

    /** 메시지 전송 (REST API 방식, WebSocket fallback용) */
    sendMessage(payload: {
        chatRoomId: number
        senderId: number
        message: string
    }) {
        return apiClient.post('/api/chats/message', payload)
    },

    /** 읽음 처리 */
    markAsRead(payload: {
        chatRoomId: number
        userId: number
    }) {
        return apiClient.post('/api/chats/read-receipt', payload)
    }
}
