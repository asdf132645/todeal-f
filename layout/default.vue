<template>
  <v-app>
    <AppHeader />

    <v-main class="pb-16 px-4">
      <NuxtPage />
    </v-main>


    <AppBottomNav class="bottom-nav-fixed" />

    <!-- 위치 허용 여부 안내 -->
    <v-dialog v-model="showConsentDialog" persistent max-width="400">
      <v-card>
        <v-card-title class="text-h6 font-weight-bold">
          위치 사용 허용
        </v-card-title>
        <v-card-text>
          내 주변의 중고 거래와 알바를 보기 위해 위치 정보를 사용합니다. 허용하시겠습니까?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="grey" text @click="handleConsent(false)">거부</v-btn>
          <v-btn color="primary" @click="handleConsent(true)">허용</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 에러 안내 -->
    <v-snackbar v-model="showLocationError" color="red" timeout="5000">
      {{ geo.error }}
    </v-snackbar>
  </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useGeoStore } from '@/stores/geoStore'
import AppHeader from '~/components/layout/AppHeader.vue'
import AppBottomNav from '~/components/layout/AppBottomNav.vue'

const geo = useGeoStore()
const showConsentDialog = ref(false)
const showLocationError = ref(false)

const LOCATION_KEY = 'locationConsent'

onMounted(async () => {
  const consent = localStorage.getItem(LOCATION_KEY)

  if (consent === 'true') {
    await geo.initLocationWithConsent(true)
  } else if (consent === 'false') {
    await geo.initLocationWithConsent(false)
  } else {
    showConsentDialog.value = true
  }
})

const handleConsent = async (agree: boolean) => {
  localStorage.setItem(LOCATION_KEY, String(agree))
  showConsentDialog.value = false
  await geo.initLocationWithConsent(agree)
  if (agree) {
    localStorage.setItem('userLat', String(geo.latitude))
    localStorage.setItem('userLng', String(geo.longitude))
    localStorage.setItem('userRegionName', geo.regionName)
  }
}

watch(() => geo.error, (val) => {
  if (val) showLocationError.value = true
})
</script>