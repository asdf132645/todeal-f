<template>
  <v-container fluid class="pa-0 bg-app">
    <!-- 1. 헤더 -->
    <v-sheet class="header-sheet py-4 main">
      <div class="header-title"  >
        {{ _t('home.header_title') }} <span class="highlight-text">{{ _t('home.toDeal') }}</span>
      </div>
      <div class="header-subtitle">{{ _t('home.header_subtitle') }}</div>
    </v-sheet>

    <BannerArea />

    <!-- 카테고리 -->
    <v-row class=" pt-0" dense>
      <v-col cols="6" sm="4" md="3" v-for="(item, i) in categories" :key="i">
        <v-card class="category-card d-flex flex-column align-center justify-center pa-4" @click="goToCategory(item.route)">
          <v-icon size="32" class="mb-2" color="#FFD54F">{{ item.icon }}</v-icon>
          <div class="text-subtitle-2 font-weight-bold">{{ _t(item.title) }}</div>
          <div class="text-caption mt-1 subtitle-text">{{ _t(item.subtitle) }}</div>
        </v-card>
      </v-col>
    </v-row>

    <!-- 위치 안내 -->
    <v-sheet class="location-banner px-4 py-3 mt-4">
      <div class="d-flex justify-space-between align-center">
        <div>
          <div class="location-title">{{ _t('location.title') }}</div>
          <div class="location-subtitle">
            {{ _t('location.subtitle_prefix') }} <strong>{{ userRadius }}km</strong> {{ _t('location.subtitle_suffix') }}
          </div>        </div>
        <v-btn icon variant="plain" class="location-icon-btn" @click="refreshLocationData">
          <v-icon>mdi-crosshairs-gps</v-icon>
        </v-btn>
      </div>
    </v-sheet>


    <!-- 오늘 급구 알바 + 구직 경매 -->
    <v-sheet class="highlight-jobs px-4 py-4 my-4">
      <!-- 급구 알바 -->
      <div class="d-flex justify-space-between align-center mb-3">
        <div>
          <div class="text-h7 font-weight-bold mb-1">{{ _t('section.urgent_parttime_title') }}</div>
          <div class=" gray-text">{{ _t('section.urgent_parttime_sub') }}</div>
        </div>
        <button type="button" class="text-custom-small" @click="router.push('/deals/parttime-request')">{{ _t('common.more') }}</button>
      </div>
      <v-slide-group show-arrows v-if="parttimeRequest.length > 0">
        <v-slide-group-item v-for="job in parttimeRequest" :key="job.id">
          <v-card class="job-card mx-2" width="220" flat>
            <JobCard :job="job" />
          </v-card>
        </v-slide-group-item>
      </v-slide-group>
      <div v-else class="section-empty mt-3">{{ _t('section.urgent_parttime_empty') }}</div>

      <!-- 구직 경매 -->
      <div class="d-flex justify-space-between align-center my-5">
        <div>
          <div class="text-h7 font-weight-bold mb-1">{{ _t('section.recruit_title') }}</div>
          <div class=" gray-text">{{ _t('section.recruit_sub') }}</div>
        </div>
        <button type="button" class="text-custom-small" @click="router.push('/deals/parttime')">{{ _t('common.more') }}</button>
      </div>
      <v-slide-group show-arrows v-if="jobs.length > 0">
        <v-slide-group-item v-for="job in jobs" :key="job.id">
          <v-card class="job-card mx-2" width="200" flat>
            <JobCard :job="job" />
          </v-card>
        </v-slide-group-item>
      </v-slide-group>
      <div v-else class="section-empty mt-3">{{ _t('section.recruit_empty') }}</div>
    </v-sheet>



    <!-- 빌려드려요 -->
    <div class="section-title px-4 mt-6 mb-2">{{ _t('section.barter_title') }}</div>

    <v-slide-group show-arrows v-if="barters.length > 0" class="px-3">
      <v-slide-group-item
          v-for="barter in barters.slice(0, 12)"
          :key="barter.id"
          class="slide-item"
      >
        <DealCard :deal="barter" />
      </v-slide-group-item>
    </v-slide-group>

    <div v-else class="section-empty">{{ _t('section.barter_empty') }}</div>

    <!-- 희귀템 섹션 -->
    <div class="section-title px-4 mt-6 mb-2">{{ _t('section.rare_item_title') }}</div>
    <v-slide-group show-arrows v-if="deals.length > 0" class="px-3">
      <v-slide-group-item
          v-for="deal in deals.slice(0, 12)"
          :key="deal.id"
          class="slide-item"
      >
        <DealCard :deal="deal" />
      </v-slide-group-item>
    </v-slide-group>
    <div v-else class="section-empty">{{ _t('section.rare_item_empty') }}</div>

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
import {useI18n} from "vue-i18n";
const { t: _t, locale } = useI18n()

const jobs = ref<Deal[]>([])
const deals = ref<Deal[]>([])
const barters = ref<Deal[]>([])
const parttimeRequest = ref<Deal[]>([])
const hashtags = ref<string[]>([])
const geo = useGeoStore()
const router = useRouter()
const userRadius = ref('')

const defaultHashtags = [
  '#알바구함', '#중고거래', '#희귀템', '#오늘출근', '#빌려드려요', '#유물', '#서울', '#신림동'
]

const categories = [
  { title: 'category.barter_title', subtitle: 'category.barter_subtitle', icon: 'mdi-arrow-left-right', route: '/deals/barter' },
  { title: 'category.used_title', subtitle: 'category.used_subtitle', icon: 'mdi-bag-personal-outline', route: '/deals/used' },
  { title: 'category.parttime_title', subtitle: 'category.parttime_subtitle', icon: 'mdi-storefront-outline', route: '/deals/parttime' },
  { title: 'category.parttime_request_title', subtitle: 'category.parttime_request_subtitle', icon: 'mdi-account-tie-outline', route: '/deals/parttime-request' }
]

const fetchNearbyDealsByType = async (type: 'used' | 'parttime' | 'barter' | 'parttime-request') => {
  const lat = Number(localStorage.getItem('userLat'))
  const lng = Number(localStorage.getItem('userLng'))
  try {
    const res = await dealApi.fetchNearbyDeals({
      lat: lat,
      lng: lng,
      radius: userRadius.value,
      type
    })
    if (type === 'parttime') jobs.value = res
    else if (type === 'used') deals.value = res
    else if (type === 'barter') barters.value = res
    else if (type === 'parttime-request') parttimeRequest.value = res
  } catch (e) {
    console.error(`위치 기반 ${type} 조회 실패:`, e)
  }
}

const fetchPopularHashtags = async () => {
  try {
    const res = await hashtagApi.fetchAllHashtags()
    hashtags.value = res.length > 0 ? res : defaultHashtags
  } catch (e) {
    console.error('인기 해시태그 조회 실패:', e)
    hashtags.value = defaultHashtags
  }
}

const refreshLocationData = async () => {
  await geo.initLocationOnce()
  if (geo.latitude && geo.longitude) {
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
  refreshLocationData()
})
</script>

<style scoped>
.highlight-jobs {
  background-color: #2C2D30;
  border-radius: 16px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.3);
}
.job-card {
  background-color: #1A1B1D;
  border-radius: 12px;
}
.section-empty {
  text-align: center;
  color: #999;
  padding: 20px;
}
</style>
