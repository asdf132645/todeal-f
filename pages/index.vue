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
      <v-col cols="6" v-for="(item, i) in categories" :key="i">
        <v-card
            class="text-center py-5 rounded-lg elevation-0"
            color="grey-lighten-4"
            style="border: 1px solid #ddd"
            @click="goToCategory(item.route)"
        >
          <v-icon size="30" color="primary">{{ item.icon }}</v-icon>
          <div class="mt-2 font-weight-bold text-body-1">{{ item.title }}</div>
          <div class="text-caption text-grey-darken-1">{{ item.subtitle }}</div>
        </v-card>
      </v-col>
    </v-row>

    <!-- 3. 해시태그 -->
    <v-sheet color="white" class="mx-4 mb-4 px-2 pt-3 pb-3 rounded-lg">
      <div class="text-subtitle-2 font-weight-bold mb-2 text-indigo-darken-3">🔥 인기 해시태그</div>
      <v-slide-group show-arrows>
        <v-slide-group-item v-for="tag in hashtags" :key="tag">
          <v-chip
              class="ma-1 px-3"
              color="#8264ee"
              text-color="#8264ee"
              style="border: 1px solid #8264ee"
              pill
          >
            {{ tag }}
          </v-chip>
        </v-slide-group-item>
      </v-slide-group>
    </v-sheet>

    <!-- 4. 위치 안내 배너 -->
    <v-sheet color="orange-lighten-5" class="mx-4 mb-5 px-4 py-4 rounded-xl border">
      <div class="d-flex justify-space-between align-center">
        <div>
          <div class="text-subtitle-2 font-weight-bold text-brown-darken-2">
            📍 현재 위치 기반 실시간 경매
          </div>
          <div class="text-caption mt-1 text-grey-darken-2">
            내 주변 <strong>{{ userRadius }}km</strong> 반경의 최신 경매글
          </div>
        </div>
        <v-btn icon color="brown" variant="tonal" @click="refreshLocationData">
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
      <div class="text-caption text-orange">{{ userRadius }}km 이내</div>
    </div>
    <v-row class="px-4" dense v-if="parttimeRequest.length > 0">
      <v-col cols="6" v-for="job in parttimeRequest" :key="job.id">
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

    <!-- 7. 오늘의 물물교환 -->
    <div class="px-4 mt-6 mb-2 font-weight-bold text-subtitle-1">오늘의 물물교환</div>
    <v-row class="px-4" dense v-if="barters.length > 0">
      <v-col cols="6" v-for="barter in barters" :key="barter.id">
        <DealCard :deal="barter" />
      </v-col>
    </v-row>
    <div v-else class="text-caption text-grey text-center pb-6">주변에 물물교환 경매가 아직 없어요 🧺</div>

    <!-- 8. 오늘의 구직 -->
    <div class="px-4 mt-6 mb-2 font-weight-bold text-subtitle-1">오늘의 구직 경매</div>
    <v-row class="px-4" dense v-if="jobs.length > 0">
      <v-col cols="6" v-for="job in jobs" :key="job.id">
        <JobCard :job="job" />
      </v-col>
    </v-row>
    <div v-else class="text-caption text-grey text-center pb-6">주변에 구직 경매가 아직 없어요 🧳</div>
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
import { useRouter } from '#vue-router'

const jobs = ref<Deal[]>([])
const deals = ref<Deal[]>([])
const barters = ref<Deal[]>([]);
const parttimeRequest = ref<Deal[]>([]);
const hashtags = ref<string[]>([])
const locationLabel = ref('위치 정보 없음')
const geo = useGeoStore()
const router = useRouter()
const userRadius = ref('');

const defaultHashtags = [
  '#알바구함', '#중고거래', '#급처분', '#오늘출근', '#물물교환', '#시급만원', '#서울', '#신림동'
]

const categories = [
  { title: '중고거래', subtitle: '실시간 경매 등록', icon: 'mdi-bag-personal', route: '/deals/used' },
  { title: '알바 급해요!', subtitle: '시급 알바 경매', icon: 'mdi-storefront', route: '/deals/parttime' },
  { title: '구직 급해요!', subtitle: '시간 경매 구직', icon: 'mdi-account-tie', route: '/deals/parttime-request' },
  { title: '물물교환', subtitle: '물건끼리 맞교환', icon: 'mdi-swap-horizontal', route: '/deals/barter' },
]

const fetchNearbyDealsByType = async (type: 'used' | 'parttime' | 'barter' | 'parttime-request') => {
  try {

    const res = await dealApi.fetchNearbyDeals({
      lat: geo.latitude!,
      lng: geo.longitude!,
      radius: userRadius.value,
      type
    })
    if (type === 'parttime') jobs.value = res
    else if (type === 'used') deals.value = res
    else if (type === 'barter') barters.value = res;
    else if (type === 'parttime-request') parttimeRequest.value = res;
    else jobs.value = res
  } catch (e) {
    console.error(`위치 기반 ${type} 조회 실패:`, e)
  }
}

const fetchPopularHashtags = async () => {
  try {
    const res = await hashtagApi.fetchPopularHashtags()
    hashtags.value = res.length > 0 ? res : defaultHashtags
  } catch (e) {
    console.error('인기 해시태그 조회 실패:', e)
    hashtags.value = defaultHashtags
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
    await fetchNearbyDealsByType('barter')
    await fetchNearbyDealsByType('parttime-request')
  }
}

const goToCategory = (path: string) => {
  router.push(path)
}

onMounted(() => {
  userRadius.value = localStorage.getItem('userRadius')
  fetchPopularHashtags()
  refreshLocationData()
})
</script>
