<template>
  <v-card flat class="pa-4" v-if="user">
    <!-- ✅ 유저 정보 -->
    <UserTrustScore class="mt-4" />
    <v-avatar size="80" class="mb-3">
      <v-img :src="user.profileImageUrl || 'https://via.placeholder.com/80'" />
    </v-avatar>
    <div class="text-h6 font-weight-bold color-black">{{ user.nickname }}</div>
    <div class="text-body-2 color-black">{{ user.email }}</div>
    <v-divider class="my-4" />
    <div>
      <p class="color-black">등록권: {{ user.ticketCount ?? 0 }}개</p>
      <p class="color-black">초대 보상: 등록권 {{ user.inviteRewardCount ?? 0 }}개</p>
    </div>


  </v-card>
</template>

<script setup lang="ts">
import UserTrustScore from '@/components/trustscore/UserTrustScore'
import { useAuthStore } from '@/stores/authStore'
import { trustScoreApi } from '@/domains/trustscore/infrastructure/trustScoreApi'
import type { TrustScoreType } from  '@/domains/trustscore/infrastructure/trustScoreType';
import { ref, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import dayjs from 'dayjs'

// 유저 정보
const { user } = storeToRefs(useAuthStore())

// 후기 관련
const reviews = ref([])
const selectedType = ref<TrustScoreType | null>(null)
const page = ref(1)
const size = 5
const totalPages = ref(1)


function fetchReviews() {
  if (!user.value?.id) return
  trustScoreApi.getUserReviews(user.value.id, {
    page: page.value - 1,
    size,
    type: selectedType.value || undefined,
  }).then(res => {
    reviews.value = res.content
    totalPages.value = res.totalPages
  })
}


watch([selectedType], () => {
  page.value = 1
  fetchReviews()
})

onMounted(fetchReviews)


</script>
