import { ref, onMounted, onBeforeUnmount } from 'vue'

export function useChatSocket(
    chatRoomId: number,
    userId: number,
    onReceive: (msg: any) => void
) {
    const socket = ref<WebSocket | null>(null)

    const connect = () => {
        if (!userId || !chatRoomId) {
            console.warn('❌ userId 또는 chatRoomId 없음 - WebSocket 연결 생략')
            return
        }

        // ✅ chatRoomId + userId 함께 전달
        const url = `ws://localhost:8080/ws/chat?chatRoomId=${chatRoomId}&userId=${userId}`
        socket.value = new WebSocket(url)

        socket.value.onopen = () => {
            console.log('✅ WebSocket connected')

            // 읽음 처리용 메시지 전송 (선택적)
            socket.value?.send(
                JSON.stringify({
                    type: 'read',
                    chatRoomId,
                    userId
                })
            )
        }

        socket.value.onmessage = (event) => {
            const msg = typeof event.data === 'string' ? JSON.parse(event.data) : event.data
            onReceive(msg)
        }

        socket.value.onclose = () => {
            console.warn('🔌 WebSocket closed')
        }

        socket.value.onerror = (e) => {
            console.error('❌ WebSocket error', e)
        }
    }

    const sendMessage = (text: string) => {
        if (socket.value?.readyState === WebSocket.OPEN) {
            const payload = {
                type: 'text',
                chatRoomId,
                senderId: userId,
                message: text,
                createdAt: new Date().toISOString()
            }
            socket.value.send(JSON.stringify(payload))
        } else {
            console.warn('WebSocket is not open. Message not sent.')
        }
    }

    onMounted(connect)
    onBeforeUnmount(() => socket.value?.close())

    return {
        sendMessage,
        socket
    }
}
