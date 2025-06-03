<template>
  <v-container class="py-2 px-2">
    <v-row v-if="items.length > 0" dense>
      <v-col cols="12" v-for="item in items" :key="item.id" class="pb-1">
        <v-sheet
            class="d-flex align-start pa-2"
            style="border-bottom: 1px solid #eee; cursor: pointer"
            @click.stop="goDetail(item.id)"
        >
          <v-img
              :src="item.images?.[0] || 'https://via.placeholder.com/80?text=No+Image'"
              width="80"
              height="80"
              class="rounded-lg"
              cover
          />
          <div class="ml-3 flex-grow-1">
            <div class="text-body-2 font-weight-bold mb-1">
              {{ item.title }}
            </div>
            <div class="text-caption text-grey-darken-1 mb-1">
              {{ item.region }} · {{ formatTimeAgo(item.createdAt) }}
            </div>
            <div class="text-body-2 font-weight-bold">
              {{ item.currentPrice.toLocaleString() }}원
            </div>
          </div>
        </v-sheet>
      </v-col>
    </v-row>
    <div v-else class="text-caption text-grey text-center py-10">
      등록된 항목이 없습니다.
    </div>
    <div ref="infiniteScrollTarget" class="text-center py-2">
      <v-progress-circular indeterminate v-if="loading" />
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick  } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { dealApi } from '~/domains/deal/infrastructure/dealApi'
import { useGeoStore } from '@/stores/geoStore'

const route = useRoute()
const router = useRouter()
const geo = useGeoStore()

const type = (route.params.type as string) || 'used'
const items = ref<any[]>([])
const page = ref(0)
const pageSize = 10
const hasMore = ref(true)
const loading = ref(false)
const infiniteScrollTarget = ref<HTMLElement | null>(null)

const formatTimeAgo = (iso: string) => {
  const d = new Date(iso)
  const now = new Date()
  const diff = Math.floor((now.getTime() - d.getTime()) / 60000)
  if (diff < 1) return '방금 전'
  if (diff < 60) return `${diff}분 전`
  const hours = Math.floor(diff / 60)
  if (hours < 24) return `${hours}시간 전`
  const days = Math.floor(hours / 24)
  return `${days}일 전`
}
const refreshDeals = async () => {
  page.value = 0
  hasMore.value = true
  items.value = []
  await loadDeals()
}

const goDetail = (id: number) => {
  router.push({
    path: `/deals/detail/${id}`,
    query: { type }
  })
}

const loadDeals = async () => {
  loading.value = true;
  const userRadius = process.client ? localStorage.getItem('userRadius') : null
  const lat = Number(localStorage.getItem('userLat'))
  const lng = Number(localStorage.getItem('userLng'))
  try {
    const res = await dealApi.getList({
      type,
      page: page.value,
      pageSize,
      lat: lat,
      lng: lng,
      radius : Number(userRadius)
    })

    if (res.length < pageSize) hasMore.value = false
    items.value.push(...res)
    page.value++
  } catch (e) {
    console.error('딜 불러오기 실패:', e)
  } finally {
    loading.value = false
  }
}



onMounted(async () => {
  await nextTick() // DOM 렌더링 이후 보장
  await refreshDeals() // ✅ 초기 로딩

  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && hasMore.value) {
      console.log('🔁 스크롤 감지됨 → loadDeals 실행')
      loadDeals()
    }
  }, { threshold: 1 })

  if (infiniteScrollTarget.value) {
    observer.observe(infiniteScrollTarget.value)
    console.log('✅ observer 연결됨')
  } else {
    console.log('❌ infiniteScrollTarget 렌더 안 됨')
  }

})



</script>
