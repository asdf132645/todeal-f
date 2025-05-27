import { defineStore } from 'pinia'
import { ref } from 'vue'

interface ChatMessagePayload {
    type: string
    chatRoomId: number
    senderId: number
    receiverId?: number
    message?: string
    createdAt?: string
}

export const useChatSocketStore = defineStore('chatSocket', () => {
    const socket = ref<WebSocket | null>(null)
    const userId = ref<number | null>(null)
    const currentRoomId = ref<number | null>(null)
    const messageHandler = ref<(msg: any) => void>()

    /**
     * WebSocket 연결 (userId + chatRoomId 기반 중복 방지)
     */
    function connectOnce(_userId: number, chatRoomId: number) {
        // ✅ 동일한 userId + chatRoomId 조합이면 연결 생략
        if (
            socket.value &&
            socket.value.readyState === WebSocket.OPEN &&
            userId.value === _userId &&
            currentRoomId.value === chatRoomId
        ) {
            console.log('🟡 이미 연결된 WebSocket - connect 생략')
            return
        }

        userId.value = _userId
        currentRoomId.value = chatRoomId

        const url = `wss://app.to-deal.com/ws/chat?chatRoomId=${chatRoomId}&userId=${_userId}`
        socket.value = new WebSocket(url)

        socket.value.onopen = () => {
            console.log('✅ WebSocket 연결됨')
        }

        socket.value.onmessage = (event) => {
            try {
                const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data

                if (data?.type === 'chatNoti') return // 💬 알림 메시지는 무시

                messageHandler.value?.(data)
            } catch (e) {
                console.error('❌ WebSocket 메시지 파싱 실패', e)
            }
        }

        socket.value.onclose = (e) => {
            console.warn('🔌 WebSocket 종료됨', e)
        }

        socket.value.onerror = (e) => {
            console.error('❌ WebSocket 에러', e)
        }
    }

    /**
     * 채팅방 진입 시 메시지 수신 핸들러 등록 + read 요청
     */
    function enterRoom(chatRoomId: number, onReceive: (msg: any) => void) {
        currentRoomId.value = chatRoomId
        messageHandler.value = onReceive

        if (socket.value?.readyState === WebSocket.OPEN) {
            socket.value.send(
                JSON.stringify({
                    type: 'read',
                    chatRoomId,
                    userId: userId.value,
                })
            )

            // ✅ handler 갱신되었을 수 있으므로 리스너도 덮어씀
            socket.value.onmessage = (event) => {
                try {
                    const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data

                    if (data?.type === 'chatNoti') return // 알림 무시
                    messageHandler.value?.(data)
                } catch (e) {
                    console.error('❌ WebSocket 메시지 파싱 실패', e)
                }
            }
        }
    }


    /**
     * 채팅 메시지 전송
     */
    function sendMessage(payload: {
        chatRoomId: number
        senderId: number
        receiverId: number
        message: string
    }) {
        if (socket.value?.readyState === WebSocket.OPEN) {
            socket.value.send(
                JSON.stringify({
                    ...payload,
                    type: 'text',
                    createdAt: new Date().toISOString(),
                } as ChatMessagePayload)
            )
        } else {
            console.warn('⚠️ WebSocket 연결 안됨')
        }
    }

    /**
     * 수동 종료
     */
    function disconnect() {
        socket.value?.close()
        socket.value = null
        currentRoomId.value = null
    }

    return {
        socket,
        userId,
        currentRoomId,
        connectOnce,
        enterRoom,
        sendMessage,
        disconnect,
    }
})
