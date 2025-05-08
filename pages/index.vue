<template>
  <v-container fluid class="pa-0">
    <!-- 1. 헤더 슬로건 -->
    <v-sheet color="white" class="px-4 pt-6 pb-2">
      <div class="text-h6 font-weight-bold text-indigo-darken-3">
        내 근처 꿀딜, <span class="text-primary">여기서 시작!</span>
      </div>
      <div class="text-caption text-grey-darken-1 mt-1">
        근처 알바도 중고도, 한판 경매!
      </div>
    </v-sheet>


    <BannerArea />

    <!-- 2. 카테고리 선택 -->
    <v-row class="pa-4 pt-2" dense>
      <v-col cols="4" v-for="(item, i) in categories" :key="i">
        <v-card class="text-center py-5 rounded-xl elevation-1 hover-highlight hover-blue" color="blue-grey-lighten-5">
          <v-icon size="32" :color="item.color">{{ item.icon }}</v-icon>
          <div class="mt-2 font-weight-bold text-body-1">{{ item.title }}</div>
          <div class="text-caption text-grey-darken-1">{{ item.subtitle }}</div>
        </v-card>
      </v-col>
    </v-row>

    <!-- 3. 해시태그 -->
    <v-sheet color="white" class="mx-4 mb-4 px-2 pt-3 pb-3 rounded-lg">
      <div class="text-subtitle-2 font-weight-bold mb-2">🔥 인기 해시태그</div>
      <v-slide-group show-arrows>
        <v-slide-group-item v-for="tag in hashtags" :key="tag">
          <v-chip class="ma-1 px-3" color="orange-lighten-4 hover-highlight hover-blue" text-color="orange-darken-3" pill>
            {{ tag }}
          </v-chip>
        </v-slide-group-item>
      </v-slide-group>
    </v-sheet>

    <!-- 4. 위치 안내 배너 -->
    <v-sheet color="indigo-darken-1" dark class="mx-4 mb-5 px-4 py-4 rounded-xl">
      <div class="d-flex justify-space-between align-center">
        <div>
          <div class="text-subtitle-2 font-weight-bold">현재 위치 기반 실시간 경매</div>
          <div class="text-caption mt-1">내 주변 5km 반경의 최신 경매글</div>
        </div>
        <v-btn icon color="amber" @click="refreshLocationData">
          <v-icon>mdi-crosshairs-gps</v-icon>
        </v-btn>
      </div>
    </v-sheet>

    <!-- 5. 오늘의 알바 -->
    <div class="px-4 mb-2 d-flex justify-space-between align-end">
      <div>
        <div class="font-weight-bold text-subtitle-1">오늘의 알바 경매</div>
        <div class="text-caption text-grey">당일 핫 한 알바 경매</div>
      </div>
      <div class="text-caption text-orange">5km 이내</div>
    </div>

    <v-row class="px-4" dense  v-if="jobs.length > 0">
      <v-col cols="6" v-for="job in jobs" :key="job.id">
        <JobCard :job="job" />
      </v-col>
    </v-row>
    <div v-else class="text-caption text-grey text-center pb-4">근처에 등록된 알바 경매가 없어요 😢</div>

    <!-- 6. 오늘의 중고거래 -->
    <div class="px-4 mt-6 mb-2 font-weight-bold text-subtitle-1">오늘의 중고 경매</div>
    <v-row class="px-4" dense v-if="deals.length > 0">
      <v-col cols="6" v-for="deal in deals" :key="deal.id">
        <DealCard :deal="deal" />
      </v-col>
    </v-row>
    <div v-else class="text-caption text-grey text-center pb-6">주변에 중고거래 경매가 아직 없어요 🧺</div>

  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import JobCard from '@/components/job/JobCard.vue'
import DealCard from '@/components/deal/DealCard.vue'
import BannerArea from '~/components/layout/BannerArea.vue'
import { dealApi } from '@/domains/deal/infrastructure/dealApi'
import { hashtagApi } from '@/domains/hashtag/infrastructure/hashtagApi'
import type { Deal } from '@/domains/deal/domain/deal/dealTypes'
import { useGeoStore } from '@/stores/geoStore'

const jobs = ref<Deal[]>([])
const deals = ref<Deal[]>([])
const hashtags = ref<string[]>([])
const locationLabel = ref('위치 정보 없음')
const geo = useGeoStore()

const categories = [
  { title: '중고거래', subtitle: '실시간 경매 등록', icon: 'mdi-bag-personal', color: 'orange' },
  { title: '알바 구해요', subtitle: '시급 알바 경매', icon: 'mdi-storefront', color: 'blue-grey' },
  { title: '알바 합니다', subtitle: '시간 경매 구직', icon: 'mdi-account-tie', color: 'indigo' },
]

const fetchNearbyDealsByType = async (type: 'used' | 'parttime') => {
  try {
    const res = await dealApi.fetchNearbyDeals({
      lat: geo.latitude!,
      lng: geo.longitude!,
      type
    })
    if (type === 'parttime') jobs.value = res
    else deals.value = res
  } catch (e) {
    console.error(`위치 기반 ${type === 'parttime' ? '알바' : '중고'} 조회 실패:`, e)
  }
}

const fetchPopularHashtags = async () => {
  try {
    const res = await hashtagApi.fetchPopularHashtags()
    hashtags.value = res
  } catch (e) {
    console.error('인기 해시태그 조회 실패:', e)
  }
}

const fetchLocationLabel = async (lat: number, lng: number): Promise<string> => {
  if (lat >= 37.5 && lng >= 126.9) return '서울 강남구'
  return '내 위치'
}

const refreshLocationData = async () => {
  await geo.initLocationOnce()
  if (geo.latitude && geo.longitude) {
    locationLabel.value = await fetchLocationLabel(geo.latitude, geo.longitude)
    await fetchNearbyDealsByType('parttime')
    await fetchNearbyDealsByType('used')
  }
}

onMounted(() => {
  fetchPopularHashtags()
  refreshLocationData()
  fetchNearbyDealsByType('parttime')
  fetchNearbyDealsByType('used')
})
</script>
