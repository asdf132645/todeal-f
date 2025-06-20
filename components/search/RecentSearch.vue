<!--  components/search/RecentSearch.vue -->
<template>
  <v-sheet class="pa-3 mb-3" rounded>
    <div class="text-caption font-weight-bold mb-2">최근 검색</div>
    <v-chip
        v-for="(item, index) in store.recentSearches"
        :key="index"
        class="ma-1"
        @click="goToSearchResult(item)"
        pill
        outlined
    >
      {{ getTypeLabel(item.type) }} / {{ item.keyword || '전체' }}
    </v-chip>
  </v-sheet>
</template>

<script setup lang="ts">
import { useSearchStore } from '@/stores/searchStore'
import { useRouter } from 'vue-router'

const store = useSearchStore()
const router = useRouter()

const typeLabels = {
  used: '중고거래',
  parttime: '알바 급해요!',
  'parttime-request': '구직 급해요!',
  barter: '빌려드려요'
}

const getTypeLabel = (type: string) => typeLabels[type] || type

const goToSearchResult = (item: any) => {
  router.push({
    path: '/deals/search-result',
    query: {
      type: item.type,
      keyword: item.keyword || ''
    }
  })
}
</script>
