<!--// ✅ pages/deals/search-result.vue-->
<template>
  <v-container fluid class="pa-4 pt-6" style="background-color: #F5F7FA; min-height: 100vh;">
    <div class="text-h6 font-weight-bold mb-3">🔍 검색 결과</div>

    <v-row v-if="results.length > 0" dense>
      <v-col cols="6" v-for="deal in results" :key="deal.id">
        <DealCard :deal="deal" />
      </v-col>
    </v-row>
    <div v-else class="text-caption text-grey text-center py-6">검색 결과가 없습니다 😢</div>

    <div v-intersection-observer @enter="loadMore" />
    <v-progress-circular
        v-if="loadingMore"
        indeterminate
        color="primary"
        class="d-block mx-auto my-4"
    />
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import DealCard from '@/components/deal/DealCard.vue'
import { dealApi } from '@/domains/deal/infrastructure/dealApi'
import type { Deal } from '@/domains/deal/domain/deal/dealTypes'

const route = useRoute()
const results = ref<Deal[]>([])
const page = ref(1)
const hasNext = ref(true)
const loadingMore = ref(false)

const fetchPage = async () => {
  if (!hasNext.value) return
  loadingMore.value = true
  try {
    const res = await dealApi.searchDeals({
      type: route.query.type,
      keyword: route.query.keyword,
      page: page.value
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

const loadMore = () => {
  if (!loadingMore.value) fetchPage()
}

watch(() => route.query, () => {
  // 쿼리 변경 시 초기화 후 재검색
  results.value = []
  page.value = 1
  hasNext.value = true
  fetchPage()
}, { immediate: true })
</script>