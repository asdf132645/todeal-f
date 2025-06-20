<template>
  <v-container class="pa-4">
    <v-card elevation="2" class="rounded-lg">
      <v-card-title class="text-h6 font-weight-bold">💬 실시간 채팅</v-card-title>
      <v-divider />

      <v-card-text class="chat-window">
        <div
            v-for="(msg, idx) in messages"
            :key="msg.id || idx"
            :class="['chat-bubble', msg.senderId === userId ? 'mine' : 'theirs']"
        >
          <div class="text-caption grey--text mb-1">
            {{ msg.senderId === userId ? '나' : '상대방' }}
          </div>
          <div>{{ msg.message }}</div>
          <div
              class="text-caption mt-1 text-grey-darken-1"
              :class="msg.senderId === userId ? 'flex justify-end' : ''"
          >
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
import { useRoute } from 'vue-router'
import { ref, onMounted, nextTick, watch } from 'vue'
import { useChatMessages } from '@/composables/useChatMessages'
import { chatApi } from '@/domains/chat/infrastructure/chatApi'
import { format, isToday } from 'date-fns'
import { useChatSocketStore } from '@/stores/chatSocketStore'

const route = useRoute()
const chatRoomId = Number(route.params.chatRoomId)
const receiverId = Number(route.query.receiverId || 0)
const userId = process.client ? Number(localStorage.getItem('userId') || 0) : 0

const text = ref('')
const bottomAnchor = ref<HTMLElement | null>(null)
const isTyping = ref(false)
const typingTimeout = ref<NodeJS.Timeout | null>(null)

const { messages, loadMessages } = useChatMessages(chatRoomId)
const chatSocketStore = useChatSocketStore()

watch(messages, () => scrollToBottom())

function handleMessage(msg: any) {
  if (msg?.source === 'notify') return

  const data = typeof msg === 'string' ? JSON.parse(msg) : msg

  if (data.type === 'typing' && data.senderId !== userId) {
    isTyping.value = true
    if (typingTimeout.value) clearTimeout(typingTimeout.value)
    typingTimeout.value = setTimeout(() => (isTyping.value = false), 3000)
    return
  }

  if (data.senderId === userId && data.type === 'text') return

  messages.value.push({
    id: data.id ?? Date.now(),
    chatRoomId: data.chatRoomId ?? chatRoomId,
    senderId: data.senderId,
    message: data.message || data.messageContent || '[메시지 없음]',
    read: data.read ?? false,
    sentAt: data.sentAt || new Date().toISOString(),
    receiverId: data.receiverId ?? receiverId
  })

  messages.value.sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime())
  markMessagesAsRead()
  scrollToBottom()
}

onMounted(async () => {
  await loadMessages()
  await markMessagesAsRead()

  //  이미 연결된 경우 connectOnce는 생략, BUT enterRoom은 꼭 호출해야 함
  const isConnected =
      chatSocketStore.socket?.readyState === WebSocket.OPEN &&
      chatSocketStore.currentRoomId === chatRoomId &&
      chatSocketStore.userId === userId

  if (!isConnected) {
    chatSocketStore.connectOnce(userId, chatRoomId)
  }

  chatSocketStore.enterRoom(chatRoomId, handleMessage)
  scrollToBottom()
})


function scrollToBottom() {
  nextTick(() => {
    bottomAnchor.value?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  })
}

function sendMessage() {
  if (!text.value.trim()) return

  chatSocketStore.sendMessage({
    chatRoomId,
    senderId: userId,
    receiverId,
    message: text.value.trim()
  })

  text.value = ''
}

function sendTypingSignal() {
  if (chatSocketStore.socket?.readyState === WebSocket.OPEN) {
    chatSocketStore.socket.send(
        JSON.stringify({
          type: 'typing',
          chatRoomId,
          userId
        })
    )
  }
}

async function markMessagesAsRead() {
  try {
    await chatApi.markAsRead({ chatRoomId, userId })
    messages.value.forEach((msg) => {
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
  return isToday(date) ? format(date, 'a h:mm') : format(date, 'M월 d일 a h:mm')
}
</script>

<style>
.chat-window {
  height: 65vh;
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
  background-color: #3b3b3b;
  align-self: flex-end;
  text-align: right;
}

.chat-bubble.theirs {
  background-color: #4d4d4d;
  align-self: flex-start;
  text-align: left;
}
</style>