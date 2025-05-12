<template>
  <v-app-bar app flat height="64" color="indigo-darken-3" class="px-4">
    <v-toolbar-title class="font-weight-bold text-white">
      to<span class="text-amber-accent-2">DEAL</span>
    </v-toolbar-title>

    <!-- 위치 및 반경 선택 -->
    <v-btn
        variant="flat"
        class="mx-2 px-3 py-1 rounded-pill bg-white"
        @click="locationDialog = true"
    >
      <v-icon size="18" color="deep-orange-darken-2">mdi-map-marker</v-icon>
      <span class="ml-1 text-caption font-weight-medium text-grey-darken-3">
        {{ regionName }} ({{ radius }}km)
      </span>
      <v-icon size="14" color="grey-darken-1" class="ml-1">mdi-chevron-down</v-icon>
    </v-btn>

    <v-spacer />

    <v-btn icon>
      <v-icon color="white">mdi-bell-outline</v-icon>
    </v-btn>

    <v-btn icon @click="drawer = true">
      <v-icon color="white">mdi-menu</v-icon>
    </v-btn>
  </v-app-bar>

  <!-- 드로어 -->
  <v-navigation-drawer v-model="drawer" temporary location="right">
    <v-list nav dense>
      <template v-if="auth.user">
        <v-list-item to="/mypage" title="마이페이지" prepend-icon="mdi-account" />
        <v-list-item to="/bids/history" title="입찰내역" prepend-icon="mdi-gavel" />
        <v-list-item to="/post" title="글 등록" prepend-icon="mdi-plus-box" />
        <v-list-item to="/settings" title="설정" prepend-icon="mdi-cog" />
        <v-list-item @click="auth.logout" title="로그아웃" prepend-icon="mdi-logout" />
      </template>
      <template v-else>
        <v-list-item to="/auth/login" title="로그인" prepend-icon="mdi-login" />
      </template>
    </v-list>
  </v-navigation-drawer>

  <!-- 위치 + 반경 선택 다이얼로그 -->
  <v-dialog v-model="locationDialog" max-width="400">
    <v-card>
      <v-card-title class="text-subtitle-1 font-weight-bold">지역/반경 설정</v-card-title>
      <v-card-text>
        <div class="mb-4">현재 위치: <strong>{{ regionName }}</strong></div>
        <RadiusSelector @change="onRadiusChange" />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" text @click="locationDialog = false">닫기</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import RadiusSelector from '@/components/common/RadiusSelector.vue'
import { useAuthStore } from '@/stores/authStore'

const drawer = ref(false)
const locationDialog = ref(false)
const regionName = ref('내 위치')
const radius = ref(2) // 기본값
const auth = useAuthStore()

const getRegionNameFromCoords = async () => {
  const lat = parseFloat(localStorage.getItem('userLat') || '37.5665')
  const lng = parseFloat(localStorage.getItem('userLng') || '126.9780')

  window.kakao.maps.load(() => {
    if (!window.kakao?.maps?.services) return

    const geocoder = new kakao.maps.services.Geocoder()
    geocoder.coord2RegionCode(lng, lat, (result, status) => {
      if (status === kakao.maps.services.Status.OK) {
        const region = result.find(r => r.region_type === 'H')
        regionName.value = region?.address_name || '알 수 없음'
      }
    })
  })
}

const onRadiusChange = (val: number) => {
  radius.value = val
  localStorage.setItem('userRadius', val.toString())
  locationDialog.value = false
  window.location.reload() // 반경 반영을 위해 새로고침
}

onMounted(() => {
  const stored = localStorage.getItem('userRadius')
  if (stored) radius.value = parseInt(stored)
  setTimeout(() => getRegionNameFromCoords(), 300)
})
</script>
