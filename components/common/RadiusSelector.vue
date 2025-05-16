<template>
  <div>
    <v-select
        v-model="radius"
        :items="radiusOptions"
        label="반경 거리 (km)"
        dense
        outlined
        hide-details
        class="w-100 mb-2"
        @update:model-value="onRadiusChange"
    />

    <v-btn
        color="brown"
        variant="tonal"
        block
        @click="dialogVisible = true"
    >
      <v-icon start>mdi-crosshairs-gps</v-icon>
      내 위치 다시 설정
    </v-btn>

    <!-- ✅ 직접 만든 위치 권한 다이얼로그 -->
    <v-dialog v-model="dialogVisible" max-width="400">
      <v-card>
        <v-card-title class="text-h6 font-weight-bold">
          📍 위치 권한 요청
        </v-card-title>
        <v-card-text>
          현재 위치 정보를 기반으로 주변 딜을 추천하려고 해요.<br />
          위치 정보를 사용해도 괜찮을까요?
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn variant="text" color="grey" @click="handleConsent(false)">거절</v-btn>
          <v-btn variant="flat" color="primary" @click="handleConsent(true)">허용</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useGeoStore } from '@/stores/geoStore'
import { apiClient } from '~/libs/http/apiClient'

const emit = defineEmits<{
  (e: 'change', value: number): void
  (e: 'refresh'): void
}>()

const geo = useGeoStore()
const radiusOptions = [1, 2, 3, 5, 10, 15, 20, 25, 30, 40, 100]
const radius = ref(2)
const dialogVisible = ref(false)

onMounted(() => {
  if (process.client) {
    const stored = localStorage.getItem('userRadius')
    radius.value = stored ? parseFloat(stored) : 2
  }
})

const onRadiusChange = (val: number) => {
  if (process.client) {
    localStorage.setItem('userRadius', val.toString())
  }
  emit('change', val)
}

const handleConsent = async (accepted: boolean) => {
  dialogVisible.value = false
  localStorage.setItem('locationConsent', accepted ? 'true' : 'false')

  if (accepted) {
    try {
      await apiClient.post('/users/location', {
        latitude: geo.latitude,
        longitude: geo.longitude,
      })
      emit('refresh') // 위치 새로고침 시 화면 갱신 필요 시 사용
    } catch (e) {
      console.error('📡 위치 저장 실패:', e)
    }
  }
}
</script>

<style scoped>
.w-100 {
  width: 100%;
}
</style>
