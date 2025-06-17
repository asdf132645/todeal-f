import { defineStore } from 'pinia'

export interface AlertMessage {
    chatRoomId?: number
    dealId?: number
    dealTitle: string
    isBarter?: boolean
    createdAt?: number  // 타임스탬프 추가 (optional이지만 내부에서 필수로 사용할 예정)
}

export const useNotificationStore = defineStore('notification', {
    state: () => ({
        unreadMessages: [] as AlertMessage[]
    }),

    actions: {
        add(msg: AlertMessage) {
            const exists = this.unreadMessages.some(existing =>
                (msg.chatRoomId && existing.chatRoomId === msg.chatRoomId) ||
                (msg.dealId && existing.dealId === msg.dealId && msg.isBarter === existing.isBarter)
            )

            if (!exists) {
                const msgWithTimestamp: AlertMessage = {
                    ...msg,
                    createdAt: Date.now()
                }

                // 최신 알림 추가
                this.unreadMessages.push(msgWithTimestamp)

                // 30개 초과 시 오래된 알림 제거
                if (this.unreadMessages.length > 30) {
                    // createdAt 기준으로 정렬 후 가장 오래된 1개 제거
                    this.unreadMessages.sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0))
                    this.unreadMessages = this.unreadMessages.slice(-30)
                }
            }
        },

        // 선택 삭제 (사용은 안 하겠지만 유지)
        clear(msg: AlertMessage) {
            this.unreadMessages = this.unreadMessages.filter(m =>
                !(
                    (msg.chatRoomId && m.chatRoomId === msg.chatRoomId) ||
                    (msg.dealId && m.dealId === msg.dealId && msg.isBarter === m.isBarter)
                )
            )
        },

        // 전체 삭제
        clearAll() {
            this.unreadMessages = []
        }
    },

    persist: true
})
