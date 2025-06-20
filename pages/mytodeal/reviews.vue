<template>
  <v-card flat class="pa-4" v-if="user">

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
            {{ typeMap[item.type] }} / {{ item.isPositive ? '👍 긍정' : '👎 부정' }} / {{ formatDate(item.createdAt) }}
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
import { ref, watch, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { storeToRefs } from 'pinia'
import { trustScoreApi } from '@/domains/trustscore/infrastructure/trustScoreApi'
import type { TrustScoreType } from '@/domains/trustscore/infrastructure/trustScoreType'
import dayjs from 'dayjs'

const { user } = storeToRefs(useAuthStore())
const reviews = ref([])
const selectedType = ref<TrustScoreType | null>(null)
const page = ref(1)
const size = 5
const totalPages = ref(1)
const userId = ref('');
const typeOptions = [
  { title: '중고', value: 'USED' },
  { title: '알바', value: 'PARTTIME' },
  { title: '알바요청', value: 'PARTTIME_REQUEST' },
  { title: '빌려드려요', value: 'BARTER' }
]

const typeMap: Record<string, string> = {
  USED: '중고',
  PARTTIME: '알바',
  PARTTIME_REQUEST: '알바요청',
  BARTER: '빌려드려요'
}

async function fetchReviews() {
  if (!userId.value) {
    console.warn('user.id 없음 → fetchReviews 스킵')
    return
  }

  try {
    const res = await trustScoreApi.getUserReviews(userId.value, {
      page: page.value - 1,
      size,
      type: selectedType.value || undefined,
    })

    // console.log('✅ 후기 응답:', res)
    reviews.value = res.content
    totalPages.value = res.totalPages
  } catch (err) {
    console.error('❌ 후기 조회 실패:', err)
  }
}


function refreshReviews() {
  page.value = 1
  fetchReviews()
}

watch(selectedType, () => {
  page.value = 1
  fetchReviews()
})
console.log('✅ [REVIEW PAGE] mounted')


onMounted(() => {
  userId.value = localStorage.getItem('userId') || ''
  fetchReviews();
  console.log('????????????')
})

const formatDate = (iso: string) => dayjs(iso).format('YYYY.MM.DD HH:mm')
</script>