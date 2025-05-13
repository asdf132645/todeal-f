<template>
  <v-card class="rounded-lg" elevation="2" @click="goToDetail">
    <v-img
        :src="job.images?.[0] || 'https://via.placeholder.com/300x200'"
        height="160"
        cover
    />
    <v-card-text>
      <div class="text-subtitle-2 font-weight-bold">{{ job.title }}</div>
      <div class="text-body-2 grey--text">{{ job.description }}</div>
      <div class="mt-2">
        💵 시급: <strong>{{ job.currentPrice.toLocaleString() }}원</strong>
        <br />
        📍 {{ address || '위치 미지정' }}
      </div>
    </v-card-text>
    <v-card-actions>
      <v-btn color="success" block>지원하기</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

interface Job {
  id: number
  title: string
  description: string
  currentPrice: number
  latitude: number
  longitude: number
  images?: string[]
}

const props = defineProps<{ job: Job }>()

const address = ref('')
const router = useRouter()

onMounted(async () => {
  address.value = await getAddressFromCoords(props.job.latitude, props.job.longitude)
})

// 🧩 카카오 주소 변환 유틸
async function getAddressFromCoords(lat: number, lng: number): Promise<string> {
  try {
    const response = await fetch(`https://dapi.kakao.com/v2/local/geo/coord2regioncode.json?x=${lng}&y=${lat}`, {
      headers: {
        Authorization: `KakaoAK ${import.meta.env.VITE_KAKAO_REST_API_KEY}`
      }
    })

    const data = await response.json()
    return data.documents?.[0]?.address_name || '위치 미지정'
  } catch (error) {
    console.error('위치 변환 실패:', error)
    return '위치 미지정'
  }
}
const goToDetail = () => {
  router.push(`/deals/detail/${props.job.id}`)
  router.push({
    path: `/deals/detail/${props.job.id}`,
    query: { type: props.job.type }
  })
}
</script>
