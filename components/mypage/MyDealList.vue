<template>
  <v-card flat class="pa-4" :style="{ backgroundColor: '#1A1B1D', color: '#F2F3F4' }">
    <div class="text-h6 font-weight-bold mb-4 color-black">내 등록글</div>

    <v-list lines="two" density="comfortable">
      <v-list-item
          v-for="deal in myDeals"
          :key="deal.id"
          class="mb-3 rounded-lg"
          @click="goToDetail(deal.id)"
          style="cursor: pointer; background-color: #2A2C30"
      >
        <template #prepend>
          <v-img
              :src="deal.images?.[0] || noImage"
              width="100"
              height="100"
              cover
              class="mr-4"
              style="border-radius: 8px; overflow: hidden"
          />


        </template>

        <v-list-item-title class="font-weight-bold text-body-1 color-black" style="color: #F2F3F4">
          {{ deal.title }}
        </v-list-item-title>

        <v-list-item-subtitle class="text-caption mt-1" style="color: #A6A9AD">
          입찰 {{ deal.bidCount }}건 ・ 💰 {{ deal.currentPrice.toLocaleString() }}원<br />
          마감일: {{ formatDate(deal.deadline) }}
        </v-list-item-subtitle>

        <template #append>
          <v-btn
              icon
              size="small"
              variant="text"
              color="#9EBEFF"
              @click.stop="goToEdit(deal.id)"
          >
            <v-icon size="18">mdi-pencil-outline</v-icon>
          </v-btn>
          <v-btn
              icon
              size="small"
              variant="text"
              color="red"
              @click.stop="deleteDeal(deal.id)"
          >
            <v-icon size="18">mdi-delete-outline</v-icon>
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
import noImage from '@/assets/img/noimg.jpg'  // ✅ 노이미지 경로 import

const myDeals = ref([])
const router = useRouter()

const goToDetail = (id: number) => {
  router.push(`/deals/detail/${id}`)
}

const goToEdit = (id: number) => {
  router.push(`/deals/${id}/edit`)
}
const deleteDeal = async (id: number) => {
  if (!confirm('정말 삭제하시겠습니까? 삭제 시 복구되지 않습니다.')) return
  try {
    await dealApi.deleteDeal(id)
    myDeals.value = myDeals.value.filter(deal => deal.id !== id)
  } catch (e) {
    alert('삭제에 실패했습니다.')
    console.error(e)
  }
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
