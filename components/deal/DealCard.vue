<template>
  <v-card class="rounded-lg main" elevation="2" @click="goToDetail">
    <v-img
        :src="deal.images?.[0] || noImage"
        height="160"
        cover
    />

    <v-card-text>
      <!-- ✅ 거래 방식 뱃지 -->
      <v-chip
          small
          :color="deal.pricingType === 'FIXED' ? 'green' : 'blue'"
          text-color="white"
          class="mb-2"
      >
        {{ deal.pricingType === 'FIXED' ? '정가 방식' : '경매 방식' }}
      </v-chip>

      <div class="text-subtitle-2 font-weight-bold">{{ deal.title }}</div>
      <div class="text-body-2 grey--text">{{ deal.description }}</div>
      <div class="mt-2">
        <strong>{{ deal.currentPrice.toLocaleString() }}원</strong>
        <br />
        {{ formatTime(deal.deadline) }}
      </div>
    </v-card-text>

    <v-card-actions>
      <v-btn class="color-white" color="primary" block>
        {{ deal.pricingType === 'FIXED' ? '바로 구매하기' : '입찰하기' }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import type { Deal } from '~/domains/deal/domain/deal/dealTypes'
import { useRouter } from '#vue-router'
import noImage from '@/assets/img/noimg.jpg'

const props = defineProps<{ deal: Deal }>()
const router = useRouter()

const formatTime = (time: string) => {
  return new Date(time).toLocaleString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const goToDetail = () => {
  router.push({
    path: `/deals/detail/${props.deal.id}`,
    query: { type: props.deal.type || 'used' }
  })
}
</script>
