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

        if (socket.value && socket.value.readyState === WebSocket.OPEN) {
            // console.log('🟡 WebSocket 이미 연결됨 - connect 생략')
            return
        }

        const url = `wss://app.to-deal.com/ws/chat?chatRoomId=${chatRoomId}&userId=${userId}`
        // const url = `ws://localhost:8080/ws/chat?chatRoomId=${chatRoomId}&userId=${userId}`
        socket.value = new WebSocket(url)

        socket.value.onopen = () => {
            // console.log(' WebSocket 연결됨')

            const payload = {
                type: 'read',
                chatRoomId,
                userId
            }

            socket.value?.send(JSON.stringify(payload))
        }

        socket.value.onmessage = (event) => {
            // console.log('📩 수신 메시지', event.data)
            const type = JSON.parse(event.data).type;
            if (type === 'chatNoti'){
                return;
            }
            try {
                const msg = typeof event.data === 'string' ? JSON.parse(event.data) : event.data

                // 메시지 구조가 유효할 경우만 onReceive 콜백 실행
                if (msg && typeof msg === 'object') {
                    onReceive(msg)
                } else {
                    console.warn('⚠️ 잘못된 WebSocket 메시지 구조:', msg)
                }
            } catch (err) {
                console.error('❌ WebSocket 메시지 파싱 에러', err)
            }
        }

        socket.value.onclose = (e) => {
            console.warn('🔌 WebSocket 연결 종료됨', e)
            console.trace('🔍 연결 종료 추적')
        }

        socket.value.onerror = (e) => {
            console.error('❌ WebSocket 에러 발생', e)
        }
    }

    const disconnect = () => {
        if (socket.value && socket.value.readyState === WebSocket.OPEN) {
            // console.log('🔻 WebSocket 연결 닫는 중...')
            socket.value.close()
        }
    }

    const sendMessage = (text: string, receiverId: number) => {
        const content = text.trim()
        if (!content) return
        if (socket.value?.readyState === WebSocket.OPEN) {
            const payload = {
                type: 'text',
                chatRoomId,
                senderId: userId,
                receiverId,
                message: content,
                createdAt: new Date().toISOString()
            }

            // console.log('📤 WebSocket 메시지 전송:', payload)
            socket.value.send(JSON.stringify(payload))
        } else {
            console.warn('⚠️ WebSocket 연결되지 않음. 메시지 전송 실패')
        }
    }

    onMounted(() => {
        connect()
    })

    onBeforeUnmount(() => {
        disconnect()
    })

    return {
        sendMessage,
        socket,
        disconnect,
        connect
    }
}
