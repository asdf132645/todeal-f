<template>
  <v-card class="rounded-lg" elevation="2" @click="goToDetail">
    <v-img
        :src="job.images?.[0] || noImage"
        height="120"
        cover
    />

    <v-card-text class="pa-2">
      <!-- ✅ 거래 방식 뱃지 -->
      <v-chip
          small
          :color="job.pricingType === 'FIXED' ? 'green' : 'blue'"
          text-color="white"
          class="mb-2"
      >
        {{ job.pricingType === 'FIXED' ? '정가 방식' : '경매 방식' }}
      </v-chip>

      <div class="text-body-2 font-weight-bold">{{ job.title }}</div>
      <div class="mt-1 text-caption">
        시급: <strong>{{ job.currentPrice.toLocaleString() }}원</strong><br />
        {{ address || '위치 미지정' }}
      </div>
    </v-card-text>

    <v-card-actions class="px-3 pb-3 main">
      <v-btn block density="compact">
        {{ job.pricingType === 'FIXED' ? '바로 지원' : '입찰하기' }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import noImage from '@/assets/img/noimg.jpg'

interface Job {
  id: number
  title: string
  description: string
  currentPrice: number
  latitude: number
  longitude: number
  type?: string
  pricingType?: string // ✅ 추가
  images?: string[]
}

const props = defineProps<{ job: Job }>()
const address = ref('')
const router = useRouter()

onMounted(async () => {
  address.value = await getAddressFromCoords(props.job.latitude, props.job.longitude)
})

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
  router.push({
    path: `/deals/detail/${props.job.id}`,
    query: { type: props.job.type || 'parttime' }
  })
}
</script>
