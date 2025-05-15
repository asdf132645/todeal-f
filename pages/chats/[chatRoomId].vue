<template>
  <v-container class="pa-4">
    <v-card elevation="2" class="rounded-lg">
      <v-card-title class="text-h6 font-weight-bold">💬 실시간 채팅</v-card-title>

      <v-divider />

      <v-card-text class="chat-window">
        <div v-if="isTyping" class="text-caption text-grey mb-2">상대방이 입력 중입니다...</div>

        <div
            v-for="(msg, idx) in messages"
            :key="msg.id || idx"
            :class="['chat-bubble', msg.senderId === userId ? 'mine' : 'theirs']"
        >
          <div class="text-caption grey--text mb-1">
            {{ msg.senderId === userId ? '나' : '상대방' }}`
          </div>

          <div>{{ msg.message }}</div>

          <div class="text-caption mt-1 text-grey-darken-1 flex justify-end" v-if="msg.senderId === userId">
            <span>{{ formatTime(msg.sentAt) }}</span>
<!--            <span class="ml-1">{{ msg.read ? '읽음' : '안 읽음' }}</span>-->
          </div>

          <div class="text-caption mt-1 text-grey-darken-1" v-else>
            {{ formatTime(msg.sentAt) }}
          </div>
        </div>

        <div ref="bottomAnchor" />
      </v-card-text>

      <v-card-actions class="pa-3">
        <v-text-field
            v-model="text"
            placeholder="메시지를 입력하세요..."
            dense
            hide-details
            outlined
            class="flex-grow-1 mr-2"
            @keyup.enter="sendMessage"
            @input="sendTypingSignal"
        />
        <v-btn color="primary" @click="sendMessage">전송</v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { ref, onMounted, nextTick, watch } from 'vue'
import { useChatSocket } from '@/composables/useChatSocket'
import { useChatMessages } from '@/composables/useChatMessages'
import { format, isToday } from 'date-fns'
import { chatApi } from '@/domains/chat/infrastructure/chatApi'
import { useAuthStore } from '@/stores/authStore'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const chatRoomId = Number(route.params.chatRoomId)
const userId = auth.user?.id

const text = ref('')
const isTyping = ref(false)
const typingTimeout = ref<NodeJS.Timeout | null>(null)
const bottomAnchor = ref<HTMLElement | null>(null)

const { messages, loadMessages, isLoading, hasMore } = useChatMessages(chatRoomId)

watch(messages, () => {
  scrollToBottom()
})

const handleMessage = async (msg: any) => {
  const data = typeof msg === 'string' ? JSON.parse(msg) : msg

  if (data.type === 'typing' && data.senderId !== userId) {
    isTyping.value = true
    if (typingTimeout.value) clearTimeout(typingTimeout.value)
    typingTimeout.value = setTimeout(() => (isTyping.value = false), 3000)
    return
  }

  messages.value.push({
    id: data.id,
    chatRoomId: data.chatRoomId,
    senderId: data.senderId,
    message: data.messageContent || data.message,
    read: data.read ?? false,
    sentAt: data.sentAt,
    receiverId: data.receiverId ?? null,
  })
  messages.value.sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime())

  await markMessagesAsRead()
  scrollToBottom()
}

const { sendMessage: send, socket } = useChatSocket(chatRoomId, userId, handleMessage)

onMounted(async () => {
  await loadMessages()
  await markMessagesAsRead()
  scrollToBottom()
})

function scrollToBottom() {
  nextTick(() => {
    if (bottomAnchor.value) {
      bottomAnchor.value.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  })
}

async function sendMessage() {
  if (text.value.trim()) {
    if (socket.value?.readyState === WebSocket.OPEN) {
      const messageText = text.value
      send(messageText)
      text.value = ''

      const latestMessages = await chatApi.getRecentMessages(chatRoomId)
      messages.value.splice(0, messages.value.length, ...latestMessages)
    } else {
      console.warn('WebSocket 연결이 아직 안 됐습니다.')
    }
  }
}

function sendTypingSignal() {
  if (socket.value?.readyState === WebSocket.OPEN) {
    socket.value.send(JSON.stringify({
      type: 'typing',
      chatRoomId,
      userId
    }))
  }
}

async function markMessagesAsRead() {
  try {
    await chatApi.markAsRead({
      chatRoomId,
      userId
    })
    messages.value.forEach(msg => {
      if (msg.senderId !== userId) msg.read = true
    })
  } catch (e) {
    console.warn('읽음 처리 실패', e)
  }
}

function formatTime(isoTime: string) {
  if (!isoTime) return ''

  const date = new Date(isoTime)
  if (isNaN(date.getTime())) return ''

  return isToday(date) ? format(date, 'a h:mm') : format(date, 'M\u6708 d\u65e5 a h:mm')
}
</script>

<style scoped>
.chat-window {
  height: 400px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.chat-bubble {
  max-width: 70%;
  padding: 8px 12px;
  margin-bottom: 8px;
  border-radius: 12px;
  word-break: break-word;
}

.chat-bubble.mine {
  background-color: #e3f2fd;
  align-self: flex-end;
  text-align: right;
}

.chat-bubble.theirs {
  background-color: #eeeeee;
  align-self: flex-start;
  text-align: left;
}
</style>
