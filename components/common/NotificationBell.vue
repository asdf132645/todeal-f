<template>
  <v-menu offset-y>
    <template #activator="{ props }">
      <v-badge
          v-if="notification.unreadMessages.length > 0"
          color="red"
          :content="notification.unreadMessages.length"
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
          v-for="msg in notification.unreadMessages"
          :key="msg.chatRoomId || msg.dealId"
          @click="handleClick(msg)"
      >
        <v-list-item-title class="text-body-2">
          <span v-if="msg.isBarter">🔁</span>
          <span v-else>💬</span>
          <strong>{{ msg.dealTitle }}</strong>
          <span v-if="msg.isBarter">에 교환 제안 도착!</span>
          <span v-else>에 새 메시지!</span>
        </v-list-item-title>
      </v-list-item>
      <v-list-item v-if="notification.unreadMessages.length === 0">
        <v-list-item-title class="text-caption text-grey">알림 없음</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/stores/notificationStore'

const router = useRouter()
const notification = useNotificationStore()

const handleClick = (msg: any) => {
  console.log(msg)
  if (msg.chatRoomId !== undefined) {
    router.push(`/chats/${msg.chatRoomId}`)
  } else {
    router.push(`/deals/detail/${msg.dealId}`)
  }
  notification.clear(msg)
}
</script>
