<template>
  <v-app-bar app color="white" flat height="64" class="px-4">
    <v-toolbar-title class="font-weight-bold text-indigo-darken-3">
      to<span class="text-primary">DEAL</span>
    </v-toolbar-title>

    <v-btn variant="text" class="mx-2 text-caption" icon @click="onClickLocation">
      <v-icon size="20" color="deep-orange-darken-2">mdi-map-marker</v-icon>
      <span class="ml-1 text-body-2 font-weight-medium">{{ regionName }}</span>
      <v-icon size="16" class="ml-1">mdi-chevron-down</v-icon>
    </v-btn>

    <v-spacer />

    <v-btn icon class="mr-2">
      <v-icon>mdi-bell-outline</v-icon>
    </v-btn>

    <v-btn icon @click="drawer = true">
      <v-icon>mdi-menu</v-icon>
    </v-btn>
  </v-app-bar>

  <v-navigation-drawer v-model="drawer" temporary location="right">
    <v-list nav dense>
      <v-list-item to="/mypage" title="마이페이지" prepend-icon="mdi-account" />
      <v-list-item to="/bids" title="입찰내역" prepend-icon="mdi-gavel" />
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
  if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services) return
    const geocoder = new kakao.maps.services.Geocoder()
    const coord = new kakao.maps.LatLng(lat, lng)

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
