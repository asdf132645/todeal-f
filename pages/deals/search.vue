<template>
  <v-container fluid class="pa-4 pt-6" style="min-height: 100vh; background-color: #0E0F10; color: #F2F3F4">
    <!-- 헤더에서 자연스럽게 이어지는 부분 -->
    <SearchForm @search="resetAndSearch" />
    <RecentSearch @select="resetAndSearch" />

    <div class="mt-4">
      <v-row v-if="results.length > 0" dense>
        <v-col cols="6" v-for="deal in results" :key="deal.id">
          <DealCard :deal="deal" />
        </v-col>
      </v-row>
      <div v-else class="text-caption text-center py-6" style="color: #888">
        검색 결과가 없습니다.
      </div>
    </div>

    <div v-intersection-observer @enter="loadMore" />
    <v-progress-circular
        v-if="loadingMore"
        indeterminate
        color="#9EBEFF"
        class="d-block mx-auto my-4"
    />
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SearchForm from '@/components/search/SearchForm.vue'
import RecentSearch from '@/components/search/RecentSearch.vue'
import DealCard from '@/components/deal/DealCard.vue'
import { dealApi } from '@/domains/deal/infrastructure/dealApi'
import type { Deal } from '@/domains/deal/domain/deal/dealTypes'

const results = ref<Deal[]>([])
const page = ref(1)
const hasNext = ref(true)
const loadingMore = ref(false)
const latestFilters = ref<Record<string, any>>({})

const resetAndSearch = async (filters: Record<string, any>) => {
  latestFilters.value = {
    ...filters,
    useLocation: filters.useLocation ?? false,
    radius: filters.radius ?? 5
  }
  page.value = 1
  results.value = []
  hasNext.value = true
  await fetchPage()
}

const fetchPage = async () => {
  if (!hasNext.value) return
  loadingMore.value = true
  try {
    const res = await dealApi.searchDeals({ ...latestFilters.value, page: page.value })
    if (res.length === 0) {
      hasNext.value = false
    } else {
      results.value.push(...res)
      page.value += 1
    }
  } catch (e) {
    console.error('검색 페이지 로드 실패:', e)
  } finally {
    loadingMore.value = false
  }
}

const loadMore = () => {
  if (!loadingMore.value) fetchPage()
}
</script>