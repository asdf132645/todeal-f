<template>
  <v-app-bar flat color="white">
    <!-- 🔙 뒤로가기 -->
    <v-btn icon @click="router.back()">
      <v-icon>mdi-arrow-left</v-icon>
    </v-btn>

    <!-- 타이틀 -->
    <v-toolbar-title class="ml-2 text-subtitle-1 font-weight-medium">
      {{ title }}
    </v-toolbar-title>

    <v-spacer />

    <!-- 🔔 알림 -->
    <v-menu offset-y>
      <template #activator="{ props }">
        <v-badge
            v-if="unreadCount > 0"
            color="red"
            :content="unreadCount"
            overlap
            class="mr-2"
        >
          <v-btn icon v-bind="props">
            <v-icon>mdi-bell-outline</v-icon>
          </v-btn>
        </v-badge>
        <v-btn v-else icon v-bind="props">
          <v-icon>mdi-bell-outline</v-icon>
        </v-btn>
      </template>

      <v-list density="compact" class="py-1" style="min-width: 280px;">
        <v-list-item
            v-for="msg in unreadMessages"
            :key="msg.chatRoomId"
            @click="goToChat(msg.chatRoomId)"
        >
          <v-list-item-title class="text-body-2">
            💬 <strong>{{ msg.dealTitle }}</strong>에 새 메시지!
          </v-list-item-title>
        </v-list-item>
        <v-list-item v-if="unreadMessages.length === 0">
          <v-list-item-title class="text-caption text-grey">알림 없음</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>

    <!-- ☰ 햄버거 -->
    <v-btn icon @click="drawer = !drawer">
      <v-icon>mdi-menu</v-icon>
    </v-btn>
  </v-app-bar>

  <!-- 드로어 -->
  <v-navigation-drawer v-model="drawer" temporary location="right">
    <v-list nav dense>
      <template v-if="auth.user">
        <v-list-item to="/mypage" title="마이페이지" prepend-icon="mdi-account" />
        <v-list-item to="/bids/history" title="입찰내역" prepend-icon="mdi-gavel" />
        <v-list-item to="/post" title="글 등록" prepend-icon="mdi-plus-box" />
        <v-list-item to="/plan" title="유료 플랜" prepend-icon="mdi-currency-krw" />
        <v-list-item @click="auth.logout" title="로그아웃" prepend-icon="mdi-logout" />
      </template>
      <template v-else>
        <v-list-item to="/auth/login" title="로그인" prepend-icon="mdi-login" />
      </template>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

defineProps<{ title: string }>()

const router = useRouter()
const auth = useAuthStore()
const drawer = ref(false)

// 🔔 알림
const unreadMessages = ref<{ chatRoomId: number; dealTitle: string }[]>([])
const unreadCount = computed(() => unreadMessages.value.length)

const goToChat = (chatRoomId: number) => {
  unreadMessages.value = unreadMessages.value.filter(m => m.chatRoomId !== chatRoomId)
  router.push(`/chat/${chatRoomId}`)
}

let socket: WebSocket | null = null

const connectSocket = () => {
  const userId = auth.user?.id
  if (!userId) return

  socket = new WebSocket(`wss://your-server.com/ws/chat-notify?userId=${userId}`)

  socket.onopen = () => {
    console.log('✅ 알림 소켓 연결됨')
  }

  socket.onmessage = (event) => {
    const msg = JSON.parse(event.data)

    if (msg.senderId === userId) return

    unreadMessages.value.push({
      chatRoomId: msg.chatRoomId,
      dealTitle: msg.dealTitle
    })
  }

  socket.onclose = () => {
    console.warn('🔌 알림 소켓 종료됨')
    socket = null
  }
}

onMounted(() => {
  connectSocket()
})
onBeforeUnmount(() => {
  socket?.close()
})
</script>
