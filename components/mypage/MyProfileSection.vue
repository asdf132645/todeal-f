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

    <v-divider class="my-6" />

    <!-- ✅ 후기 필터 -->
    <div class="mb-3 d-flex align-center justify-space-between">
      <v-select
          v-model="selectedType"
          :items="typeOptions"
          label="후기 유형"
          class="mr-2"
          style="max-width: 200px"
          clearable
      />
      <v-btn icon @click="refreshReviews">
        <v-icon>mdi-refresh</v-icon>
      </v-btn>
    </div>

    <!-- ✅ 후기 리스트 -->
    <v-list v-if="reviews.length > 0">
      <v-list-item
          v-for="(item, idx) in reviews"
          :key="idx"
          class="px-0"
      >
        <v-list-item-content>
          <v-list-item-title class="text-body-1 font-weight-medium color-black">
            {{ item.comment || '코멘트 없음' }}
          </v-list-item-title>
          <v-list-item-subtitle class="text-caption text-grey-darken-1">
            {{ item.type }} / {{ item.isPositive ? '👍 긍정' : '👎 부정' }} / {{ formatDate(item.createdAt) }}
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-list>

    <div v-else class="text-caption text-grey mt-4">후기가 없습니다.</div>

    <!-- ✅ 페이지네이션 -->
    <div class="d-flex justify-center mt-4" v-if="totalPages > 1">
      <v-pagination
          v-model="page"
          :length="totalPages"
          @input="fetchReviews"
      />
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

const typeOptions = [
  { title: '중고', value: 'USED' },
  { title: '알바', value: 'PARTTIME' },
  { title: '알바요청', value: 'PARTTIME_REQUEST' },
  { title: '빌려드려요', value: 'BARTER' }
]

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

function refreshReviews() {
  page.value = 1
  fetchReviews()
}

watch([selectedType], () => {
  page.value = 1
  fetchReviews()
})

onMounted(fetchReviews)

const formatDate = (iso: string) => {
  return dayjs(iso).format('YYYY.MM.DD HH:mm')
}
</script>
