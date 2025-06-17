<template>
  <v-container fluid class="pa-4 pt-6" style="min-height: 100vh;">
    <div class="text-h6 font-weight-bold mb-3">검색 결과</div>

    <v-row v-if="results.length > 0" dense>
      <v-col cols="6" v-for="deal in results" :key="deal.id">
        <DealCard :deal="deal" />
      </v-col>
    </v-row>
    <div v-else class="text-caption text-grey text-center py-6">검색 결과가 없습니다.</div>

    <!-- ✅ 감지용 요소 -->
    <div ref="infiniteScrollTrigger" style="height: 1px;" />

    <!-- ✅ 로딩 표시 -->
    <v-progress-circular
        v-if="loadingMore"
        indeterminate
        color="primary"
        class="d-block mx-auto my-4"
    />
  </v-container>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import DealCard from '@/components/deal/DealCard.vue'
import { dealApi } from '@/domains/deal/infrastructure/dealApi'
import type { Deal } from '@/domains/deal/domain/deal/dealTypes'

const route = useRoute()

const results = ref<Deal[]>([])
const page = ref(1)
const hasNext = ref(true)
const loadingMore = ref(false)
const infiniteScrollTrigger = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

const fetchPage = async () => {
  if (!hasNext.value || loadingMore.value) return
  loadingMore.value = true
  try {
    const res = await dealApi.searchDeals({
      type: route.query.type as string,
      keyword: route.query.keyword as string,
      exclude: route.query.exclude as string,
      page: page.value,
      lat: route.query.lat ? parseFloat(route.query.lat as string) : undefined,
      lng: route.query.lng ? parseFloat(route.query.lng as string) : undefined,
      radius: route.query.radius ? parseFloat(route.query.radius as string) : 5,
      useLocation: route.query.useLocation === 'true'
    })

    if (res.length === 0) {
      hasNext.value = false
    } else {
      results.value.push(...res)
      page.value += 1
    }
  } catch (e) {
    console.error('검색 결과 불러오기 실패:', e)
  } finally {
    loadingMore.value = false
  }
}

const observeScroll = () => {
  if (observer) observer.disconnect()

  observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && !loadingMore.value) {
      fetchPage()
    }
  }, {
    rootMargin: '0px',
    threshold: 1.0
  })

  if (infiniteScrollTrigger.value) {
    observer.observe(infiniteScrollTrigger.value)
  }
}

onMounted(() => {
  observeScroll()

  watch(() => route.query, () => {
    results.value = []
    page.value = 1
    hasNext.value = true
    fetchPage()
  }, { immediate: true })
})

onUnmounted(() => {
  if (observer) observer.disconnect()
})
</script>
