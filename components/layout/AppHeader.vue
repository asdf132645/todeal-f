<template>
  <v-app-bar app flat height="64" color="indigo-darken-3" class="px-4">
    <!-- 로고 및 앱명 -->
    <v-toolbar-title class="font-weight-bold text-white">
      to<span class="text-amber-accent-2">DEAL</span>
    </v-toolbar-title>

    <!-- 위치 정보 pill -->
    <v-btn
        variant="flat"
        class="mx-2 px-3 py-1 rounded-pill bg-white"
        @click="onClickLocation"
    >
      <v-icon size="18" color="deep-orange-darken-2">mdi-map-marker</v-icon>
      <span class="ml-1 text-caption font-weight-medium text-grey-darken-3">
        {{ regionName }}
      </span>
      <v-icon size="14" color="grey-darken-1" class="ml-1">mdi-chevron-down</v-icon>
    </v-btn>

    <v-spacer />

    <!-- 알림 아이콘 -->
    <v-btn icon>
      <v-icon color="white">mdi-bell-outline</v-icon>
    </v-btn>

    <!-- 햄버거 메뉴 -->
    <v-btn icon @click="drawer = true">
      <v-icon color="white">mdi-menu</v-icon>
    </v-btn>
  </v-app-bar>

  <!-- 드로어 메뉴 -->
  <v-navigation-drawer v-model="drawer" temporary location="right">
    <v-list nav dense>
      <v-list-item to="/mypage" title="마이페이지" prepend-icon="mdi-account" />
      <v-list-item to="/bids/history" title="입찰내역" prepend-icon="mdi-gavel" />
      <v-list-item to="/post" title="글 등록" prepend-icon="mdi-plus-box" />
      <v-list-item to="/settings" title="설정" prepend-icon="mdi-cog" />
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const drawer = ref(false)
const regionName = ref('내 위치')

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

onMounted(() => {
  setTimeout(() => getRegionNameFromCoords(), 300)
})

const onClickLocation = () => {
  console.log('위치 버튼 클릭됨')
}
</script>
