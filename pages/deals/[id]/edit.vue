<template>
  <v-container class="py-6">
    <v-card class="pa-5 rounded-lg" elevation="2">
      <div class="text-h6 font-weight-bold mb-4">게시글 수정</div>

      <v-text-field v-model="form.title" label="제목" outlined dense />
      <v-textarea v-model="form.description" label="설명" rows="4" outlined dense />
      <v-text-field v-model.number="form.startPrice" label="시작가" type="number" outlined dense />
      <v-text-field v-model.number="form.currentPrice" label="현재가" type="number" outlined dense />
      <v-text-field v-model="form.deadline" label="마감일 (ISO)" type="datetime-local" outlined dense />


      <v-btn color="primary" class="mt-4" @click="updateDeal" :loading="loading">수정 완료</v-btn>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { dealApi } from '~/domains/deal/infrastructure/dealApi'
import { useSnackbarStore } from '@/stores/snackbarStore'

const route = useRoute()
const router = useRouter()
const snackbar = useSnackbarStore()
const loading = ref(false)
const dealId = Number(route.params.id)

const form = ref({
  title: '',
  description: '',
  type: '',
  startPrice: 0,
  currentPrice: 0,
  deadline: '',
})

const region = ref({
  full: '',
  depth1: '',
  depth2: '',
  depth3: '',
  x: null,
  y: null
})

onMounted(async () => {
  const res = await dealApi.getDealById(dealId)
  const data = res
  console.log(data)
  form.value = {
    title: data.title,
    description: data.description,
    type: data.type,
    startPrice: data.startPrice,
    currentPrice: data.currentPrice,
    deadline: data.deadline,
  }

  region.value = {
    full: data.region || `${data.regionDepth1} ${data.regionDepth2} ${data.regionDepth3}`,
    depth1: data.regionDepth1,
    depth2: data.regionDepth2,
    depth3: data.regionDepth3,
    x: data.longitude,
    y: data.latitude
  }
})

const updateDeal = async () => {

  loading.value = true
  try {
    const payload = {
      ...form.value,
      region: region.value.full,
      regionDepth1: region.value.depth1,
      regionDepth2: region.value.depth2,
      regionDepth3: region.value.depth3,
      latitude: parseFloat(region.value.y),
      longitude: parseFloat(region.value.x),
      images: [] // 이미지 수정 없으면 비워둠
    }

    await dealApi.updateDeal(dealId, payload)
    snackbar.show('수정 성공', 'success')
    router.push(`/deals/${dealId}`)
  } catch (e) {
    snackbar.show('수정 실패', 'error')
    console.error(e)
  } finally {
    loading.value = false
  }
}
</script>
