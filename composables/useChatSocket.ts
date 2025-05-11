import { ref, onMounted, onBeforeUnmount } from 'vue'

export function useChatSocket(chatRoomId: number, userId: number, onReceive: (msg: any) => void) {
    const socket = ref<WebSocket | null>(null)

    const connect = () => {
        const url = `ws://localhost:8080/ws/chat?chatRoomId=${chatRoomId}`
        socket.value = new WebSocket(url)

        socket.value.onopen = () => {
            console.log('✅ WebSocket connected')
            socket.value?.send(JSON.stringify({
                type: 'read',
                chatRoomId,
                userId
            }))
        }

        socket.value.onmessage = (event) => {
            const msg = JSON.parse(event.data)
            onReceive(msg)
        }

        socket.value.onclose = () => {
            console.log('🔌 WebSocket closed')
        }

        socket.value.onerror = (e) => {
            console.error('❌ WebSocket error', e)
        }
    }

    const sendMessage = (text: string) => {
        if (socket.value?.readyState === WebSocket.OPEN) {
            const payload = {
                chatRoomId,
                senderId: userId,
                message: text,
                sentAt: new Date().toISOString()
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
