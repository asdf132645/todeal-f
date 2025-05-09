<script setup lang="ts">
import { useRoute } from 'vue-router'
import { onMounted, ref, computed } from 'vue'
import { dealApi } from '~/domains/deal/infrastructure/dealApi'
import { bidApi } from '~/domains/bid/infrastructure/bidApi'

import DealDetailBase from '@/components/deal/DealDetailBase.vue'
import UsedDealSection from '@/components/deal/UsedDealSection.vue'
import ParttimeDealSection from '@/components/deal/ParttimeDealSection.vue'
import ParttimeRequestSection from '@/components/deal/ParttimeRequestSection.vue'
import BarterDealSection from '@/components/deal/BarterDealSection.vue'

const route = useRoute()
const dealId = Number(route.params.dealId)
const deal = ref<any>(null)
const bids = ref<any[]>([])

const myUserId = 1
const isOwner = computed(() => deal.value?.userId === myUserId)

const type = (route.query.type as string)?.toLowerCase() || ''
const sectionMap = {
  used: UsedDealSection,
  parttime: ParttimeDealSection,
  'parttime-request': ParttimeRequestSection,
  barter: BarterDealSection
}
const currentSection = computed(() => sectionMap[type] || UsedDealSection)

// ✅ 마감 여부: 시간 or 낙찰 확정
const isExpired = computed(() => {
  if (!deal.value) return false
  const expiredByTime = new Date(deal.value.deadline) < new Date()
  const expiredByWinner = deal.value.winnerBidId !== null && deal.value.winnerBidId !== undefined
  return expiredByTime || expiredByWinner
})

const fetchDeal = async () => {
  deal.value = await dealApi.getDealById(dealId)
}
const fetchBids = async () => {
  bids.value = await bidApi.getBidListByDealId(dealId)
}
const selectBid = async (bidId: number) => {
  if (!confirm('해당 입찰자를 낙찰자로 확정하시겠습니까?')) return
  await bidApi.selectWinnerBid(bidId)
  await fetchDeal()
  await fetchBids()
  alert('낙찰 처리 완료')
}

onMounted(async () => {
  await fetchDeal()
  await fetchBids()
})
</script>


<template>
  <v-container v-if="deal" class="py-4">
    <!-- ✅ 마감 안내 -->
    <v-alert
        v-if="isExpired"
        type="warning"
        color="grey-lighten-3"
        text
        prominent
        class="mb-4"
    >
      ⏰ 이 경매는 마감되었습니다.
    </v-alert>

    <!-- 기본 정보 -->
    <DealDetailBase :deal="deal" />

    <!-- 타입별 섹션 -->
    <component :is="currentSection" :deal="deal" :isExpired="isExpired" v-if="!isExpired" />

    <!-- 입찰자 목록 -->
    <v-card class="mt-6 pa-4" v-if="isOwner && bids.length > 0">
      <div class="text-subtitle-1 font-weight-bold mb-3">입찰자 목록</div>
      <v-list>
        <v-list-item
            v-for="bid in bids"
            :key="bid.id"
            class="d-flex justify-space-between align-center"
        >
          <div>{{ bid.nickname }} - {{ bid.amount.toLocaleString() }}원</div>

          <v-btn
              size="small"
              color="primary"
              :disabled="deal.winnerBidId !== null"
              @click="selectBid(bid.id)"
          >
            낙찰하기
          </v-btn>
        </v-list-item>
      </v-list>
    </v-card>
  </v-container>
</template>
