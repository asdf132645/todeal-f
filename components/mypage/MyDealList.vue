<template>
  <v-card flat class="pa-4">
    <div class="text-h6 font-weight-bold mb-4">내 등록글</div>

    <v-list lines="two" density="comfortable">
      <v-list-item
          v-for="deal in myDeals"
          :key="deal.id"
          class="mb-2"
          @click="goToDetail(deal.id)"
          style="cursor: pointer;"
      >
        <template #prepend>
          <v-img
              :src="deal.images?.[0] || 'https://via.placeholder.com/100x100/cccccc/888888?text=No+Image'"
              width="100"
              height="100"
              cover
              class="rounded"
          />
        </template>

        <v-list-item-title class="font-weight-bold text--primary">
          {{ deal.title }}
        </v-list-item-title>

        <v-list-item-subtitle class="text-caption text--secondary mt-1">
          입찰 {{ deal.bidCount }}건 ・ 💰 {{ deal.currentPrice.toLocaleString() }}원<br />
          마감일: {{ formatDate(deal.deadline) }}
        </v-list-item-subtitle>

        <template #append>
          <v-btn
              small
              variant="text"
              color="primary"
              @click.stop="goToEdit(deal.id)"
          >
            수정
          </v-btn>
        </template>
      </v-list-item>
    </v-list>
  </v-card>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { dealApi } from '~/domains/deal/infrastructure/dealApi'

const myDeals = ref([])
const router = useRouter()

const goToDetail = (id: number) => {
  router.push(`/deals/detail/${id}`)
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
