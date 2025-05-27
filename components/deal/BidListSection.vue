<template>
  <v-card class="mt-6 pa-4">
    <div class="text-subtitle-1 font-weight-bold mb-3 color-black">입찰자 목록</div>
    <v-list>
      <v-list-item
          v-for="bid in bids"
          :key="bid.id"
          class="d-flex justify-space-between align-center"
      >
        <div class="color-black">
          {{ bid.nickname }} - {{ bid.amount.toLocaleString() }}원
          <span
              v-if="bid.id === winnerBidId"
              class="text-primary font-weight-bold ml-2"
          >
            (낙찰자)
          </span>
        </div>

        <v-btn
            v-if="!winnerBidId"
            color="primary"
            size="small"
            class="color-black"
            @click="selectBid(bid.id)"
        >
          낙찰하기
        </v-btn>
      </v-list-item>
    </v-list>
  </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { bidApi } from '~/domains/bid/infrastructure/bidApi'

const props = defineProps<{
  dealId: number
  winnerBidId?: number | null
}>()

const bids = ref<any[]>([])

const fetchBids = async () => {
  const res = await bidApi.getBidListByDealId(props.dealId)
  bids.value = res
}

const selectBid = async (bidId: number) => {
  if (!confirm('해당 입찰자를 낙찰자로 확정하시겠습니까?')) return

  await bidApi.selectWinnerBid(bidId)
  alert('낙찰 처리 완료')
  await fetchBids()
  // 🚨 낙찰 이후 부모에서 winnerBidId 갱신 필요
}

onMounted(fetchBids)
</script>
