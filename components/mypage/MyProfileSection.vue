<!--// ✅ components/mypage/MyProfileSection.vue-->
<template>
  <v-card flat class="pa-4">
    <v-avatar size="80" class="mb-3">
      <v-img :src="user.profileImageUrl || 'https://via.placeholder.com/80'" />
    </v-avatar>
    <div class="text-h6 font-weight-bold">{{ user.nickname }}</div>
    <div class="text-body-2">{{ user.email }}</div>
    <v-divider class="my-4" />
    <div>
      <p>🪪 플랜: <strong>{{ user.isPremium ? '프리미엄' : '무료 사용자' }}</strong></p>
      <p v-if="user.isPremium">⏳ 만료일: {{ user.planExpireAt }}</p>
      <p>🎟 등록권: {{ user.ticketCount }}개</p>
      <p>🎁 초대 보상: 등록권 {{ user.inviteRewardCount }}개</p>
    </div>
  </v-card>
</template>

<script setup lang="ts">
const user = {
  nickname: '홍길동',
  email: 'hong@deal.com',
  profileImageUrl: '',
  isPremium: true,
  planExpireAt: '2025-07-01',
  ticketCount: 4,
  inviteRewardCount: 5,
}
</script>