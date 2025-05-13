import { defineStore } from 'pinia'

export interface AlertMessage {
    chatRoomId?: number
    dealId?: number
    dealTitle: string
    isBarter?: boolean
}

export const useNotificationStore = defineStore('notification', {
    state: () => ({
        unreadMessages: [] as AlertMessage[]
    }),

    actions: {
        add(msg: AlertMessage) {
            // 중복 방지
            const exists = this.unreadMessages.some(existing =>
                (msg.chatRoomId && existing.chatRoomId === msg.chatRoomId) ||
                (msg.dealId && existing.dealId === msg.dealId && msg.isBarter)
            )
            if (!exists) {
                this.unreadMessages.push(msg)
            }
        },

        clear(msg: AlertMessage) {
            this.unreadMessages = this.unreadMessages.filter(m => m !== msg)
        },

        clearAll() {
            this.unreadMessages = []
        }
    }
})
