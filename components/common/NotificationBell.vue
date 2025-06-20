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
          <span v-if="msg.isBarter">{{ $t('auto_key_220') }}</span>
          <span v-else>{{ $t('auto_key_221') }}</span>
        </v-list-item-title>
      </v-list-item>
      <v-list-item v-if="notification.unreadMessages.length === 0">
        <v-list-item-title class="text-caption text-grey">{{ $t('auto_key_222') }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>

</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
// notification.clear(msg)
import { useRouter } from "vue-router";
import { useNotificationStore } from "@/stores/notificationStore";
const router = useRouter();
const notification = useNotificationStore();

const handleClick = (msg: any) => {
    console.log(msg);

    if (msg.chatRoomId !== undefined) {
        router.push(`/chats/${msg.chatRoomId}`);
    } else {
        router.push(`/deals/detail/${msg.dealId}`);
    }
};
</script>