<template>
  <v-app-bar app flat height="64" style="background-color: #1A1B1D; color: #F2F3F4" class="px-4">
    <NuxtLink to="/" class="text-decoration-none">
      <v-toolbar-title class="font-weight-bold" style="color: #F2F3F4">
        to<span style="color: #FFD54F">DEAL</span>
      </v-toolbar-title>
    </NuxtLink>

    <v-btn
        variant="flat"
        class="mx-2 px-3 py-1 rounded-pill main"
        style="background-color: #2A2C30; color: #F2F3F4"
        @click="locationDialog = true"
    >
      <v-icon size="18" color="#FFB74D">mdi-map-marker</v-icon>
      <span class="ml-1 text-caption font-weight-medium" style="color: #F2F3F4">
        {{ regionName }} ({{ radius }}km)
      </span>
      <v-icon size="14" color="#AAAAAA" class="ml-1">mdi-chevron-down</v-icon>
    </v-btn>

    <v-spacer />
    <NotificationBell />
    <v-btn icon style="color: #F2F3F4" @click="toggleDrawer" class="ml-2">
      <v-icon>mdi-menu</v-icon>
    </v-btn>
  </v-app-bar>

  <AppDrawer v-if="drawer" v-model="drawer" />

  <!-- 위치 + 반경 설정 다이얼로그 -->
  <v-dialog v-model="locationDialog" max-width="400">
    <v-card style="background-color: #1A1B1D; color: #F2F3F4">
      <v-card-title class="text-subtitle-1 font-weight-bold">지역/반경 설정</v-card-title>
      <v-card-text>
        <div class="mb-4">현재 위치: <strong>{{ regionName }}</strong></div>
        <div id="map" style="width: 100%; height: 200px; border-radius: 8px; margin-bottom: 16px;" />
        <RadiusSelector @change="onRadiusChange" />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" @click="applyRadius">확인</v-btn> <!-- ✅ 추가 -->
        <v-btn text color="primary" @click="locationDialog = false">닫기</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import RadiusSelector from '@/components/common/RadiusSelector.vue'
import NotificationBell from '@/components/common/NotificationBell.vue'
import AppDrawer from '~/components/common/AppDrawer.vue'
import { useRouter } from 'vue-router'
import {useGeoStore} from "~/stores/geoStore";
const router = useRouter()

const drawer = ref(false)
const locationDialog = ref(false)
const regionName = ref('내 위치')
const radius = ref(2)
const auth = useAuthStore()
const geo = useGeoStore()

const lat = ref(37.5665)
const lng = ref(126.9780)
let map: any = null
let circle: any = null
let marker: any = null
watch(() => geo.regionDepth3, (newVal) => {
  if (newVal) {
    console.log('📍 지역명이 바뀜 → 지도/마커 갱신')
    getRegionNameFromCoords()
  }
})

const onRadiusChange = (val: number) => {
  radius.value = val
  localStorage.setItem('userRadius', val.toString())
  drawCircle();

}
const applyRadius = () => {
  locationDialog.value = false
  window.location.reload();
}

const getMapLevelForRadius = (km: number): number => {
  if (km <= 0.3) return 5   // 골목
  if (km <= 0.7) return 6   // 1동
  if (km <= 1.5) return 7   // 동 전체
  if (km <= 3) return 8     // 구 단위
  if (km <= 7) return 9     // 시 전체
  if (km <= 15) return 9    // 수도권 핵심
  return 10                 // 충청도 보일 때
}


const getRegionNameFromCoords = async () => {
  lat.value = parseFloat(localStorage.getItem('userLat') || '37.5665')
  lng.value = parseFloat(localStorage.getItem('userLng') || '126.9780')

  window.kakao.maps.load(() => {
    if (!window.kakao?.maps?.services) return

    const geocoder = new kakao.maps.services.Geocoder()
    geocoder.coord2RegionCode(lng.value, lat.value, (result, status) => {
      if (status === kakao.maps.services.Status.OK) {
        const region = result.find(r => r.region_type === 'H')
        regionName.value = region?.region_3depth_name || '알 수 없음'
        localStorage.setItem('userRegion', regionName.value)
      }
    })

    initMap()
  })
}

const initMap = () => {
  const container = document.getElementById('map')
  if (!container) return

  const center = new window.kakao.maps.LatLng(lat.value, lng.value)
  const level = getMapLevelForRadius(radius.value)

  map = new window.kakao.maps.Map(container, {
    center,
    level
  })

  marker = new window.kakao.maps.Marker({ position: center })
  marker.setMap(map)

  drawCircle()
}

const drawCircle = () => {
  if (!map || !window.kakao?.maps) return

  if (circle) circle.setMap(null)

  circle = new window.kakao.maps.Circle({
    center: new window.kakao.maps.LatLng(lat.value, lng.value),
    radius: radius.value * 600, //시각적으로 맞게 줄임
    strokeWeight: 2,
    strokeColor: '#FFD54F',
    strokeOpacity: 0.8,
    fillColor: '#FFD54F',
    fillOpacity: 0.2
  })

  circle.setMap(map)

  const level = getMapLevelForRadius(radius.value)
  map.setLevel(level)
  map.setCenter(new window.kakao.maps.LatLng(lat.value, lng.value))
}

const toggleDrawer = () => {
  drawer.value = !drawer.value
}

onMounted(() => {
  if (process.client) {
    const stored = localStorage.getItem('userRadius')
    if (!stored) {
      localStorage.setItem('userRadius','2')
    }
    if (stored) radius.value = parseInt(stored)
    setTimeout(() => getRegionNameFromCoords(), 300)
  }
})

watch(locationDialog, (val) => {
  if (val) {
    setTimeout(() => {
      initMap()
    }, 300)
  }
})
</script>
