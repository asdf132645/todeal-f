<template>
  <v-container class="py-2 px-2">
    <!-- 🔘 지역/전체 전환 버튼 -->
    <div class="d-flex justify-end mb-3">
      <button class="btn-custom" @click="toggleUseLocation">
        {{ useLocation ? '전체 보기' : '내 지역만 보기' }}
      </button>
    </div>

    <!-- 🗂 리스트 -->
    <v-row v-if="items.length > 0" dense>
      <v-col cols="12" v-for="item in items" :key="item.id" class="pt-0 pb-0">
        <v-sheet
            class="d-flex align-start pa-2"
            style="border-bottom: 1px solid #353131; cursor: pointer"
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
              {{ item.translatedTitle || item.title }}
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

    <!-- ❌ 항목 없음 -->
    <div v-else class="text-caption text-grey text-center py-10">
      등록된 항목이 없습니다.
    </div>

    <!-- 🔁 무한스크롤 감지용 타겟 -->
    <div ref="infiniteScrollTarget" class="text-center py-2">
      <v-progress-circular indeterminate v-if="loading" />
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { dealApi } from '~/domains/deal/infrastructure/dealApi'

const route = useRoute()
const router = useRouter()

const type = (route.params.type as string) || 'used'
const items = ref<any[]>([])
const cursorId = ref<number | null>(null)
const pageSize = 10
const loading = ref(false)
const hasMore = ref(true)
const useLocation = ref(true)
const infiniteScrollTarget = ref<HTMLElement | null>(null)

let observer: IntersectionObserver | null = null

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

const goDetail = (id: number) => {
  // 👉 기존에 저장된 값과 비교
  const prevCache = sessionStorage.getItem('dealItemsCache')
  const prevCursor = sessionStorage.getItem('dealCursorId')

  const currentItems = JSON.stringify(items.value)
  const currentCursor = String(cursorId.value || '')

  if (prevCache !== currentItems || prevCursor !== currentCursor) {
    sessionStorage.setItem('scrollYDealDetail', String(window.scrollY))
    sessionStorage.setItem('dealItemsCache', currentItems)
    sessionStorage.setItem('dealCursorId', currentCursor)
  }

  router.push({ path: `/deals/detail/${id}`, query: { type } })
}


const toggleUseLocation = () => {
  useLocation.value = !useLocation.value
  refreshDeals()
}

const refreshDeals = async () => {
  items.value = []
  cursorId.value = null
  hasMore.value = true
  await loadDeals()
}

const loadDeals = async () => {
  if (loading.value || !hasMore.value) return
  loading.value = true

  const userRadius = process.client ? localStorage.getItem('userRadius') : null
  const lat = Number(localStorage.getItem('userLat'))
  const lng = Number(localStorage.getItem('userLng'))

  try {
    const res = await dealApi.searchDealsByCursor({
      type,
      cursorId: cursorId.value,
      pageSize,
      lat: useLocation.value ? lat : undefined,
      lng: useLocation.value ? lng : undefined,
      radius: useLocation.value ? Number(userRadius || 5) : undefined,
      useLocation: useLocation.value
    })

    items.value.push(...res.items)
    cursorId.value = res.nextCursorId
    hasMore.value = res.hasNext
  } catch (e) {
    console.error('❌ 딜 불러오기 실패:', e)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await nextTick()

  const cachedItems = sessionStorage.getItem('dealItemsCache')
  const cachedCursor = sessionStorage.getItem('dealCursorId')
  let restored = false

  if (cachedItems) {
    items.value = JSON.parse(cachedItems)
    cursorId.value = cachedCursor ? Number(cachedCursor) : null
    sessionStorage.removeItem('dealItemsCache')
    sessionStorage.removeItem('dealCursorId')
    restored = true
  }

  const savedY = sessionStorage.getItem('scrollYDealDetail')
  if (savedY) {
    window.scrollTo({ top: parseInt(savedY), behavior: 'auto' })
    sessionStorage.removeItem('scrollYDealDetail')
  }

  if (!restored) {
    await refreshDeals()

    //  observer는 딱 한 번만 등록
    if (observer) observer.disconnect()
    observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore.value) {
        loadDeals()
      }
    }, { threshold: 1 })

    if (infiniteScrollTarget.value) {
      observer.observe(infiniteScrollTarget.value)
    }
  }
})
</script>
