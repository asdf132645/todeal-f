<script setup lang="ts">
import { useRoute } from 'vue-router'
import { onMounted, ref, computed } from 'vue'
import { dealApi } from '~/domains/deal/infrastructure/dealApi'
import { bidApi } from '~/domains/bid/infrastructure/bidApi'
import { barterBidApi } from '~/domains/barterBid/infrastructure/barterBidApi'
import { trustScoreApi } from '@/domains/trustscore/infrastructure/trustScoreApi'

import DealDetailBase from '@/components/deal/DealDetailBase.vue'
import UsedDealSection from '@/components/deal/UsedDealSection.vue'
import ParttimeDealSection from '@/components/deal/ParttimeDealSection.vue'
import ParttimeRequestSection from '@/components/deal/ParttimeRequestSection.vue'
import BarterDealSection from '@/components/deal/BarterDealSection.vue'

const route = useRoute()
const dealId = Number(route.params.dealId)
const deal = ref<any>(null)
const bids = ref<any[]>([])
const userId = ref('')
const trustScores = ref<Record<number, number>>({})

const type = (route.query.type as string)?.toLowerCase() || ''
const sectionMap = {
  used: UsedDealSection,
  parttime: ParttimeDealSection,
  'parttime-request': ParttimeRequestSection,
  barter: BarterDealSection
}
const currentSection = computed(() => sectionMap[type] || UsedDealSection)

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
  if (type === 'barter') {
    bids.value = await barterBidApi.getListByDealId(dealId)
  } else {
    bids.value = await bidApi.getBidListByDealId(dealId)
  }
  await fetchTrustScores()
}

const fetchTrustScores = async () => {
  const userIds = new Set<number>()

  if (typeof deal.value?.userId === 'number') {
    userIds.add(deal.value.userId)
  }

  bids.value.forEach((b: any) => {
    if (typeof b.userId === 'number') {
      userIds.add(b.userId)
    }
  })

  const winnerBid = bids.value.find(b => b.id === deal.value?.winnerBidId)
  if (winnerBid?.userId && typeof winnerBid.userId === 'number') {
    userIds.add(winnerBid.userId)
  }

  const uniqueUserIds = Array.from(userIds)

  try {
    const result = await trustScoreApi.getUserScores(uniqueUserIds)
    trustScores.value = result
  } catch (e) {
    console.warn('❌ 투딜지수 불러오기 실패', e)
  }
}

const trustScoreWriter = computed(() => {
  if (!deal.value) return null
  const score = trustScores.value[deal.value.userId]
  return typeof score === 'number' ? score.toFixed(1) + '점' : '-'
})

const getBidderScore = (userId: number) => {
  const score = trustScores.value[userId]
  return typeof score === 'number' ? score.toFixed(1) + '점' : '-'
}

const selectBid = async (bidId: number) => {
  if (!confirm('해당 입찰자를 낙찰자로 확정하시겠습니까?')) return
  if (type === 'barter') {
    await barterBidApi.accept(bidId)
  } else {
    await bidApi.selectWinnerBid(bidId)
  }
  await fetchDeal()
  await fetchBids()
  alert('낙찰 처리 완료')
}

const handleBidComplete = async () => {
  await fetchDeal()
  await fetchBids()
}

onMounted(async () => {
  userId.value = localStorage.getItem('userId') || ''
  await fetchDeal()
  await fetchBids()
})
</script>

<template>
  <v-container v-if="deal" class="py-4">
    <v-alert
        v-if="isExpired"
        type="warning"
        color="grey-lighten-3"
        text
        prominent
        class="mb-4"
    >
      이 경매는 마감되었습니다.
    </v-alert>

    <v-card class="mb-4 pa-3" elevation="1">
      <div class="text-subtitle-2 font-weight-medium mb-1">📍 거래 지역</div>
      <div class="text-body-2 mb-1">
        {{ deal.regionDepth1 }} {{ deal.regionDepth2 }} {{ deal.regionDepth3 }}
      </div>
      <div class="text-caption text-grey">
        작성자 투딜지수: {{ trustScoreWriter }}
      </div>
    </v-card>

    <DealDetailBase :deal="deal" />
    <component
        :is="currentSection"
        :deal="deal"
        :isExpired="isExpired"
        @bid-complete="handleBidComplete"
        v-if="!isExpired"
    />

    <v-card class="mt-6 pa-4" v-if="bids.length > 0">
      <div class="text-subtitle-1 font-weight-bold mb-3">입찰자 목록</div>
      <v-list>
        <v-list-item
            v-for="bid in bids"
            :key="bid.id"
            class="d-flex justify-space-between align-center"
        >
          <div v-if="type === 'barter'">
            제안 물품 <strong>{{ bid.proposedItem }}</strong><br />
            설명 {{ bid.description }}<br />
            사용자 ID: {{ bid.userId }}<br />
            <span class="text-caption text-grey">
              입찰자 투딜지수: {{ getBidderScore(bid.userId) }}
            </span>
          </div>
          <div v-else>
            {{ bid.amount.toLocaleString() }}원 / [닉네임 : {{ bid.nickname }}]<br />
            <span class="text-caption text-grey">
              입찰자 투딜지수: {{ getBidderScore(bid.userId) }}
            </span>
          </div>
        </v-list-item>
      </v-list>
    </v-card>
  </v-container>
</template>
