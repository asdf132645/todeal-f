<template>
  <v-container fluid class="pa-4">
    <v-row dense v-if="sortedBids.length > 0">
      <v-col cols="12" v-for="bid in sortedBids" :key="bid.id">
        <v-card class="px-4 py-3 rounded-lg" elevation="1">
          <div class="d-flex justify-space-between align-center mb-2">
            <div class="font-weight-bold">{{ bid.deal.title }}</div>
            <v-chip
                v-if="bid.deal.winnerBidId === null"
                size="small"
                color="blue-lighten-4"
                text-color="blue-darken-2"
                class="font-weight-bold"
            >
              입찰 진행중
            </v-chip>
            <v-chip
                v-else-if="bid.deal.winnerBidId === bid.id"
                size="small"
                color="green-lighten-4"
                text-color="green-darken-2"
                class="font-weight-bold"
            >
              낙찰 성공
            </v-chip>
            <v-chip
                v-else
                size="small"
                color="grey-lighten-3"
                text-color="grey-darken-1"
                class="font-weight-bold"
            >
              낙찰 실패
            </v-chip>
          </div>

          <div class="text-body-2 text-grey-darken-2 mb-1">
            💰 내 입찰가: <span class="font-weight-bold text-black">{{ bid.amount.toLocaleString() }}원</span>
          </div>
          <div class="text-body-2 text-grey-darken-2">
            ⏰ 마감일: {{ formatDate(bid.deal.deadline) }}
          </div>
        </v-card>
      </v-col>
    </v-row>

    <div v-else class="text-caption text-grey text-center py-6">
      입찰한 물건이 없습니다
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { bidApi } from '@/domains/bid/infrastructure/bidApi'

const bids = ref<any[]>([])

const sortedBids = computed(() => {
  const ongoing = bids.value.filter(bid => bid.deal.winnerBidId === null)
  const completed = bids.value.filter(bid => bid.deal.winnerBidId !== null)
  return [...ongoing, ...completed]
})

const formatDate = (iso: string) => {
  const date = new Date(iso)
  return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`
}

onMounted(async () => {
  try {
    const res = await bidApi.getMyBids()
    bids.value = res
  } catch (e) {
    console.error('내 입찰 목록 불러오기 실패:', e)
  }
})
</script>
