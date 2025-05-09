<template>
  <v-container class="py-2 px-2">
    <v-row dense>
      <v-col cols="12" v-for="item in items" :key="item.id" class="pb-1">
        <v-sheet
            class="d-flex align-start pa-2"
            style="border-bottom: 1px solid #eee; cursor: pointer"
            @click.stop="goDetail(item.id)"
        >
          <v-img
              :src="item.images?.[0] || 'https://via.placeholder.com/80'"
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
              {{ formatLocationInfo() }} · {{ formatTimeAgo(item.createdAt) }}
            </div>
            <div class="text-body-2 font-weight-bold">
              {{ item.currentPrice.toLocaleString() }}원
            </div>
          </div>
        </v-sheet>
      </v-col>
    </v-row>

    <div ref="infiniteScrollTarget" class="text-center py-2">
      <v-progress-circular indeterminate v-if="loading" />
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { dealApi } from '~/domains/deal/infrastructure/dealApi'
import { useGeoStore } from '@/stores/geoStore'

const route = useRoute()
const router = useRouter()
const geo = useGeoStore()

const type = route.params.type as string
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

const formatLocationInfo = () => {
  return geo.regionName || '내 위치'
}

const goDetail = (id: number) => {
  router.push({
    path: `/deals/detail/${id}`,
    query: { type } // ← type을 쿼리로 넘김
  })
}


const loadDeals = async () => {
  if (loading.value || !hasMore.value) return
  loading.value = true
  try {
    const res = await dealApi.getList({
      type,
      page: page.value,
      pageSize
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
  await geo.initLocationOnce()

  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && hasMore.value) {
      loadDeals()
    }
  }, { threshold: 1 })

  if (infiniteScrollTarget.value) observer.observe(infiniteScrollTarget.value)

  await loadDeals()
})
</script>
