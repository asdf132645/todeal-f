<template>
  <v-card flat class="pa-4" v-if="user">
    <v-avatar size="80" class="mb-3">
      <v-img :src="user.profileImageUrl || 'https://via.placeholder.com/80'" />
    </v-avatar>
    <div class="text-h6 font-weight-bold">{{ user.nickname }}</div>
    <div class="text-body-2">{{ user.email }}</div>
    <v-divider class="my-4" />
    <div>
      <p>🪪 플랜: <strong>{{ user.isPremium ? '프리미엄' : '무료 사용자' }}</strong></p>
      <p v-if="user.isPremium">⏳ 만료일: {{ formatDate(user.planExpireAt) }}</p>
      <p>🎟 등록권: {{ user.ticketCount ?? 0 }}개</p>
      <p>🎁 초대 보상: 등록권 {{ user.inviteRewardCount ?? 0 }}개</p>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore'
import { storeToRefs } from 'pinia'

const { user } = storeToRefs(useAuthStore())

const formatDate = (iso: string) => {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('ko-KR')
}
</script>
