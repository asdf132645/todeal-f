<template>
  <v-card class="rounded-lg" elevation="2" @click="goToDetail">
    <v-img
        :src="deal.images?.[0] || 'https://via.placeholder.com/300x200'"
        height="160"
        cover
    />
    <v-card-text>
      <div class="text-subtitle-2 font-weight-bold">{{ deal.title }}</div>
      <div class="text-body-2 grey--text">{{ deal.description }}</div>
      <div class="mt-2">
        <strong>{{ deal.currentPrice.toLocaleString() }}원</strong>
        <br />
        {{ formatTime(deal.deadline) }}
      </div>
    </v-card-text>
    <v-card-actions>
      <v-btn color="primary" block>입찰하기</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import type { Deal } from '~/domains/deal/domain/deal/dealTypes'
import {useRouter} from "#vue-router";

const props = defineProps<{ deal: Deal }>()
const router = useRouter()

const formatTime = (time: string) => {
  return new Date(time).toLocaleString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const goToDetail = () => {
  router.push(`/deals/detail/${props.deal.id}`)
  router.push({
    path: `/deals/detail/${props.deal.id}`,
    query: { type: props.deal.type }
  })
}
</script>
