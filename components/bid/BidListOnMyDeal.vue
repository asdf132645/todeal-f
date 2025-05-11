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
            <v-btn
                size="small"
                variant="tonal"
                color="grey"
                @click="deleteDeal(group.deal.id)"
            >
              거래종료
            </v-btn>
          </div>

          <v-divider class="my-2" />

          <v-list density="compact">
            <v-list-item
                v-for="bid in group.bids"
                :key="bid.id"
                class="py-3 px-4 rounded-lg mb-2"
                :class="group.deal.winnerBidId === bid.id ? 'bg-green-lighten-5' : 'bg-grey-lighten-4'"
            >
              <div class="d-flex justify-space-between align-center w-100">
                <div>
                  <div class="font-weight-bold">
                    💰 {{ bid.amount.toLocaleString() }}원 / 👤 {{ bid.nickname }}
                  </div>
                  <div v-if="group.deal.winnerBidId === bid.id" class="text-green-darken-2 text-caption mt-1">
                    ✅ 낙찰자
                  </div>
                </div>

                <div class="d-flex align-center gap-2">
                  <v-btn
                      v-if="!group.deal.winnerBidId"
                      size="small"
                      color="primary"
                      @click="selectWinner(bid.id)"
                  >
                    낙찰 확정
                  </v-btn>

                  <v-btn
                      v-if="group.deal.winnerBidId === bid.id"
                      size="small"
                      color="error"
                      @click="cancelWinner(group.deal.id)"
                  >
                    확정 취소
                  </v-btn>

                  <v-btn
                      v-if="group.deal.winnerBidId === bid.id"
                      size="small"
                      variant="tonal"
                      color="indigo"
                      @click="goToChat(group.deal.id, bid.userId)"
                  >
                    💬 채팅
                  </v-btn>


                </div>
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
import { dealApi } from '@/domains/deal/infrastructure/dealApi'

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

const cancelWinner = async (dealId: number) => {
  try {
    if (!confirm('정말 낙찰 확정을 취소하시겠습니까?')) return
    await bidApi.cancelWinnerBid(dealId)
    fetchBids()
  } catch (e) {
    console.error('낙찰 취소 실패:', e)
  }
}

const deleteDeal = async (dealId: number) => {
  try {
    if (!confirm('정말 이 공고를 거래종료 처리하시겠습니까? 관련 채팅도 모두 삭제됩니다.')) return
    await dealApi.deleteDeal(dealId)
    fetchBids()
  } catch (e) {
    console.error('거래종료 실패:', e)
  }
}

const goToChat = (dealId: number, userId: number) => {
  router.push(`/chats/${dealId}`)
}

onMounted(fetchBids)
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}
</style>