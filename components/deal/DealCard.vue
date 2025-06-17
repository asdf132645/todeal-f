<template>
  <v-card
      class="mx-2 rounded-lg main"
      elevation="2"
      width="200"
      @click="goToDetail"
  >
    <v-img :src="deal.images?.[0] || noImage" height="160" cover />
    <v-card-text>
      <div class="mb-2 chip-custom">
        {{ deal.pricingType === 'FIXED' ? '정가 방식' : '경매 방식' }}
      </div>
      <div class="text-subtitle-2 font-weight-bold">
        {{ deal.translatedTitle || deal.title }}
      </div>
      <div class="text-body-2 grey--text">
        {{ deal.description }}
      </div>
      <div class="mt-2">
        <strong>{{ deal.currentPrice.toLocaleString() }}원</strong><br />
        {{ formatTime(deal.deadline) }}
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { useRouter } from '#vue-router'
import type { Deal } from '@/domains/deal/domain/deal/dealTypes'
import noImage from '@/assets/img/noimg.jpg'

const props = defineProps<{ deal: Deal }>()
const router = useRouter()

const goToDetail = () => {
  router.push({
    path: `/deals/detail/${props.deal.id}`,
    query: { type: props.deal.type || 'used' }
  })
}

const formatTime = (time: string) =>
    new Date(time).toLocaleString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit'
    })
</script>
