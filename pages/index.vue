<template>
  <v-container fluid class="pa-0">
    <!-- 1. 헤더 슬로건 -->
    <v-sheet color="white" class="px-4 pt-8 pb-4">
      <div class="text-h5 font-weight-bold text-indigo-darken-3">
        요즘 뜨는 동네 경매는 <span class="text-primary">투딜에서 ✨</span>
      </div>
      <div class="text-body-2 text-grey-darken-1 mt-1">
        단기알바부터 희귀템까지, 지금 내 주변에서 실시간 입찰 중!
      </div>
    </v-sheet>

    <BannerArea />

    <!-- 2. 카테고리 선택 -->
    <v-row class="pa-4 pt-3" dense>
      <v-col cols="6" v-for="(item, i) in categories" :key="i">
        <v-card
            class="text-center py-6 px-2 rounded-xl elevation-1 hover:scale-105 transition-transform"
            color="white"
            style="border: 1px solid #eee"
            @click="goToCategory(item.route)"
        >
          <v-icon size="36" color="deep-purple-darken-2">{{ item.icon }}</v-icon>
          <div class="mt-3 font-weight-bold text-subtitle-1 text-indigo-darken-3">
            {{ item.title }}
          </div>
          <div class="text-caption mt-1 text-grey-darken-1">
            {{ item.subtitle }}
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- 3. 해시태그 -->
    <v-sheet color="white" class="mx-4 mb-4 px-3 pt-4 pb-4 rounded-xl elevation-1">
      <div class="text-subtitle-1 font-weight-bold mb-2 text-deep-purple-darken-2">🔥 요즘 핫한 해시태그</div>
      <v-slide-group show-arrows>
        <v-slide-group-item v-for="tag in hashtags" :key="tag">
          <v-chip class="ma-1 px-4" color="indigo" text-color="white" pill elevated>
            {{ tag }}
          </v-chip>
        </v-slide-group-item>
      </v-slide-group>
    </v-sheet>

    <!-- 4. 위치 안내 배너 -->
    <v-sheet color="indigo-lighten-5" class="mx-4 mb-6 px-4 py-4 rounded-xl border d-flex justify-space-between align-center">
      <div>
        <div class="text-subtitle-2 font-weight-bold text-indigo-darken-3">
          📍 내 주변 실시간 경매
        </div>
        <div class="text-caption mt-1 text-grey-darken-2">
          반경 <strong>{{ userRadius }}km</strong> 안에 이런 꿀딜이?
        </div>
      </div>
      <v-btn icon color="indigo" variant="tonal" @click="refreshLocationData">
        <v-icon>mdi-crosshairs-gps</v-icon>
      </v-btn>
    </v-sheet>

    <!-- 5. 오늘 급구 알바 -->
    <div class="px-4 mb-2 d-flex justify-space-between align-end">
      <div>
        <div class="font-weight-bold text-subtitle-1">오늘 급구 알바</div>
        <div class="text-caption text-grey">당일 출근도 OK, 짧고 빠른 알바 경매</div>
      </div>
      <div class="text-caption text-orange">{{ userRadius }}km 이내</div>
    </div>
    <v-row class="px-4" dense v-if="parttimeRequest.length > 0">
      <v-col cols="12" sm="6" md="3" v-for="job in parttimeRequest" :key="job.id">
        <JobCard :job="job" />
      </v-col>
    </v-row>
    <div v-else class="text-caption text-grey text-center pb-4">아직 등록된 단기알바 경매가 없어요. ㅠㅠ 등록 좀 해주세요 ..</div>

    <!-- 6. 오늘의 희귀템 중고거래 -->
    <div class="px-4 mt-6 mb-2 font-weight-bold text-subtitle-1">오늘의 희귀템 경매</div>
    <v-row class="px-4" dense v-if="deals.length > 0">
      <v-col cols="12" sm="6" md="3" v-for="deal in deals" :key="deal.id">
        <DealCard :deal="deal" />
      </v-col>
    </v-row>
    <div v-else class="text-caption text-grey text-center pb-6">근처에 희귀템 중고 경매가 아직 없어요 🧺</div>

    <!-- 7. 오늘의 물물교환 -->
    <div class="px-4 mt-6 mb-2 font-weight-bold text-subtitle-1">오늘의 물물교환</div>
    <v-row class="px-4" dense v-if="barters.length > 0">
      <v-col cols="12" sm="6" md="3" v-for="barter in barters" :key="barter.id">
        <DealCard :deal="barter" />
      </v-col>
    </v-row>
    <div v-else class="text-caption text-grey text-center pb-6">주변에 교환 가능한 물건이 아직 없어요 🧺</div>

    <!-- 8. 오늘의 구직 경매 -->
    <div class="px-4 mt-6 mb-2 font-weight-bold text-subtitle-1">💼 오늘의 구직 경매</div>
    <v-row class="px-4" dense v-if="jobs.length > 0">
      <v-col cols="12" sm="6" md="3" v-for="job in jobs" :key="job.id">
        <JobCard :job="job" />
      </v-col>
    </v-row>
    <div v-else class="text-caption text-grey text-center pb-6">구직 중인 이웃이 아직 없어요 🧳</div>
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
const barters = ref<Deal[]>([])
const parttimeRequest = ref<Deal[]>([])
const hashtags = ref<string[]>([])
const locationLabel = ref('위치 정보 없음')
const geo = useGeoStore()
const router = useRouter()
const userRadius = ref('')

const defaultHashtags = [
  '#알바구함', '#중고거래', '#희귀템', '#오늘출근', '#물물교환', '#유물', '#서울', '#신림동'
]

const categories = [
  {
    title: '희귀템 경매',
    subtitle: '레어한 중고, 실시간 입찰!',
    icon: 'mdi-bag-personal',
    route: '/deals/used'
  },
  {
    title: '오늘 알바 구함!',
    subtitle: '시급 쎈 단기알바 모음',
    icon: 'mdi-storefront',
    route: '/deals/parttime'
  },
  {
    title: '구직도 경매다',
    subtitle: '내 시간, 누가 사갈래?',
    icon: 'mdi-account-tie',
    route: '/deals/parttime-request'
  },
  {
    title: '물건 맞교환',
    subtitle: '돈 없이 물건만 바꾸자!',
    icon: 'mdi-swap-horizontal',
    route: '/deals/barter'
  }
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
    else if (type === 'barter') barters.value = res
    else if (type === 'parttime-request') parttimeRequest.value = res
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
  userRadius.value = localStorage.getItem('userRadius') || '5'
  fetchPopularHashtags()
  refreshLocationData()
})
</script>
