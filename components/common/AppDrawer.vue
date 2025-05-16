<template>
  <v-navigation-drawer
      :model-value="modelValue"
      @update:model-value="emit('update:modelValue', $event)"
      temporary
      location="right"
  >
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
import { useAuthStore } from '@/stores/authStore'

const auth = useAuthStore()

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()
</script>
