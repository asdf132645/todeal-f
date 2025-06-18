<template>
  <div
      style="min-height: 100vh; background-color: #0E0F10; color: #F2F3F4"
  >
    <!-- 헤더에서 자연스럽게 이어지는 부분 -->
    <SearchForm @search="resetAndSearch" />
    <RecentSearch @select="resetAndSearch" />

<!--    <div class="mt-4">-->
<!--      <v-row v-if="results.length > 0" dense>-->
<!--        <v-col cols="6" v-for="deal in results" :key="deal.id">-->
<!--          <DealCard :deal="deal" />-->
<!--        </v-col>-->
<!--      </v-row>-->
<!--      <div v-else class="text-caption text-center py-6" style="color: #888">-->
<!--        검색 결과가 없습니다.-->
<!--      </div>-->
<!--    </div>-->

    <!-- sentinel 감지용 div -->
    <div ref="sentinel" style="height: 1px;" />

    <v-progress-circular
        v-if="loadingMore"
        indeterminate
        color="#9EBEFF"
        class="d-block mx-auto my-4"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import SearchForm from '@/components/search/SearchForm.vue'
import RecentSearch from '@/components/search/RecentSearch.vue'
import DealCard from '@/components/deal/DealCard.vue'
import { dealApi } from '@/domains/deal/infrastructure/dealApi'
import type { Deal } from '@/domains/deal/domain/deal/dealTypes'

const PAGE_SIZE = 20
const results = ref<Deal[]>([])
const page = ref(1)
const hasNext = ref(true)
const loadingMore = ref(false)
const latestFilters = ref<Record<string, any>>({})
const sentinel = ref<HTMLElement | null>(null)

const resetAndSearch = async (filters: Record<string, any>) => {
  latestFilters.value = {
    ...filters,
    useLocation: filters.useLocation ?? false,
    radius: filters.radius ?? 5,
  }
  page.value = 1
  results.value = []
  hasNext.value = true
  // await fetchPage()
}

const fetchPage = async () => {
  if (!hasNext.value || loadingMore.value) return
  loadingMore.value = true
  try {
    const res = await dealApi.searchDeals({
      ...latestFilters.value,
      page: page.value,
      pageSize: PAGE_SIZE,
    })
    if (res.length < PAGE_SIZE) {
      hasNext.value = false
    }
    results.value.push(...res)
    page.value += 1
  } catch (e) {
    console.error('검색 결과 로드 실패:', e)
  } finally {
    loadingMore.value = false
  }
}

// IntersectionObserver로 무한스크롤 감지
let observer: IntersectionObserver | null = null

// onMounted(() => {
//   observer = new IntersectionObserver(
//       (entries) => {
//         entries.forEach((entry) => {
//           if (entry.isIntersecting) {
//             fetchPage()
//           }
//         })
//       },
//       {
//         rootMargin: '100px',
//       }
//   )
//
//   if (sentinel.value) {
//     observer.observe(sentinel.value)
//   }
// })

onBeforeUnmount(() => {
  if (observer && sentinel.value) {
    observer.unobserve(sentinel.value)
  }
})
</script>
