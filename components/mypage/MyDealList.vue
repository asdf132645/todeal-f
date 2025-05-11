<template>
  <v-card flat class="pa-4">
    <div class="text-subtitle-1 font-weight-bold mb-2">내 등록글</div>
    <v-row dense>
      <v-col
          v-for="deal in myDeals"
          :key="deal.id"
          cols="12"
          md="6"
      >
        <v-card class="mb-3 hoverable" @click="goToDetail(deal.id)" style="cursor: pointer">
          <v-img :src="deal.images?.[0] || 'https://via.placeholder.com/300x200'" height="150" cover />
          <v-card-text>
            <div class="text-subtitle-2 font-weight-bold">{{ deal.title }}</div>
            <div class="text-caption grey--text">입찰 {{ deal.bidCount }}건</div>
            <div class="text-caption mt-1">💰 {{ deal.currentPrice.toLocaleString() }}원</div>
            <div class="text-caption mt-1">마감: {{ formatDate(deal.deadline) }}</div>
            <v-btn
                small
                color="primary"
                class="mt-2"
                @click.stop="goToEdit(deal.id)"
            >Edit</v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { dealApi } from '~/domains/deal/infrastructure/dealApi'

const myDeals = ref([])
const router = useRouter()

const goToDetail = (id: number) => {
  router.push(`deals/detail/${id}`)
}

const goToEdit = (id: number) => {
  router.push(`/deals/${id}/edit`)
}

const formatDate = (iso: string) => {
  const d = new Date(iso)
  return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`
}

onMounted(async () => {
  const res = await dealApi.getMyDeals()
  myDeals.value = res
})
</script>
