<template>
  <v-app-bar flat color="white">
    <v-btn icon @click="router.back()">
      <v-icon>mdi-arrow-left</v-icon>
    </v-btn>

    <v-toolbar-title class="ml-2 text-subtitle-1 font-weight-medium">
      {{ title }}
    </v-toolbar-title>

    <v-spacer />

    <!-- 🔔 알림 공통 컴포넌트 -->
    <NotificationBell />

    <!-- ☰ 햄버거 메뉴 -->
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import NotificationBell from '@/components/common/NotificationBell.vue'

// Props
defineProps<{ title: string }>()

const router = useRouter()
const auth = useAuthStore()
const drawer = ref(false)
</script>

<style scoped>
.v-toolbar-title {
  cursor: default;
}
</style>
