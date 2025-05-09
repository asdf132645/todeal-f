<template>
  <v-sheet rounded class="pa-2" color="white">
    <v-row dense v-if="groupedBids.length > 0">
      <v-col cols="12" v-for="group in groupedBids" :key="group.deal.id">
        <v-card class="pa-4 mb-3 rounded-lg elevation-1">
          <div class="d-flex justify-space-between align-center mb-2">
            <div class="font-weight-bold">
              {{ group.deal.title }}
              <span class="text-grey text-caption ml-2">({{ group.bids.length }}명 입찰)</span>
            </div>
            <v-chip
                v-if="group.deal.winnerBidId"
                color="green-lighten-4"
                text-color="green-darken-3"
                size="small"
                class="font-weight-bold"
            >
              낙찰 확정됨
            </v-chip>
            <v-chip
                v-else
                color="blue-lighten-4"
                text-color="blue-darken-3"
                size="small"
                class="font-weight-bold"
            >
              입찰 진행중
            </v-chip>
          </div>

          <v-divider class="my-2" />

          <v-list density="compact">
            <v-list-item
                v-for="bid in group.bids"
                :key="bid.id"
                class="d-flex align-center justify-space-between"
            >
              <div>
                💰 {{ bid.amount.toLocaleString() }}원 /
                👤 {{ bid.nickname }}
              </div>

              <div class="d-flex gap-2">
                <v-btn
                    v-if="group.deal.winnerBidId === bid.id"
                    size="small"
                    color="grey"
                    disabled
                >
                  낙찰자
                </v-btn>

                <v-btn
                    v-else-if="!group.deal.winnerBidId"
                    size="small"
                    color="primary"
                    @click="selectWinner(bid.id)"
                >
                  낙찰 확정
                </v-btn>

                <v-btn
                    size="small"
                    variant="outlined"
                    color="blue"
                    @click="goToChat(group.deal.id, bid.userId)"
                >
                  채팅
                </v-btn>
              </div>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>

    <div v-else class="text-caption text-grey text-center py-6">
      내 물건에 입찰된 내용이 없습니다
    </div>
  </v-sheet>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { bidApi } from '@/domains/bid/infrastructure/bidApi'

const groupedBids = ref<any[]>([])
const router = useRouter()

const fetchBids = async () => {
  try {
    const res = await bidApi.getBidsOnMyDeals()
    groupedBids.value = res
  } catch (e) {
    console.error('내 딜 입찰 목록 실패:', e)
  }
}

const selectWinner = async (bidId: number) => {
  try {
    if (!confirm('이 입찰자를 낙찰자로 확정하시겠습니까?')) return
    await bidApi.selectWinnerBid(bidId)
    fetchBids()
  } catch (e) {
    console.error('낙찰 실패', e)
  }
}

const goToChat = (dealId: number, userId: number) => {
  router.push(`/chat/${dealId}/${userId}`)
}

onMounted(fetchBids)
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}
</style>
