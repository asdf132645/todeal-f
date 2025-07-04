//  ~/composables/useChatMessages.ts
import { ref } from 'vue'
import { apiClient } from '@/libs/http/apiClient'

export function useChatMessages(chatRoomId: number) {
    const messages = ref<any[]>([])
    const pageSize = 20
    const hasMore = ref(true)
    const isLoading = ref(false)
    const lastMessageId = ref<number | null>(null)

    const loadMessages = async () => {
        if (isLoading.value || !hasMore.value) return
        isLoading.value = true

        try {
            const res = await apiClient.get<any[]>('/api/chats/messages', {
                params: {
                    chatRoomId,
                    lastMessageId: lastMessageId.value,
                    size: pageSize,
                }
            })

            const fetched = res.reverse().sort((a, b) => {
                const timeA = new Date(a.sentAt).getTime()
                const timeB = new Date(b.sentAt).getTime()
                return (isNaN(timeA) ? 0 : timeA) - (isNaN(timeB) ? 0 : timeB)
            })

            if (fetched.length < pageSize) hasMore.value = false
            if (fetched.length > 0) {
                lastMessageId.value = fetched[0].id
                messages.value.unshift(...fetched)
            }

        } catch (e) {
            console.error('💥 메시지 불러오기 실패:', e)
        }

        isLoading.value = false
    }


    return {
        messages,
        loadMessages,
        isLoading,
        hasMore
    }
}
