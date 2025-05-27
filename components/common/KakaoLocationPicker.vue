<template>
  <div>
    <v-text-field
        v-model="region.full"
        label="주소 검색"
        prepend-inner-icon="mdi-map-marker"
        readonly
        outlined
        hide-details
        @click="openPostcode"
        class="rounded-lg color-black"
    />

    <div v-if="region.latitude && region.longitude" class="mt-2 text-caption text-grey-darken-1">
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  region: {
    full: string
    depth1: string
    depth2: string
    depth3: string
    zonecode: string
    latitude: number
    longitude: number
    x: number
    y: number
  }
}>()

const emit = defineEmits<{
  (e: 'update:region', region: typeof props.region): void
}>()


const region = toRef(props, 'region') // 또는 그냥 props.region 직접 사용


const openPostcode = () => {
  if (typeof window === 'undefined') return

  if (window.kakao?.maps?.load) {
    window.kakao.maps.load(() => {
      launchPostcode()
    })
  } else if (window.daum?.Postcode) {
    launchPostcode()
  } else {
    console.warn('❌ 카카오 SDK가 아직 로드되지 않았습니다.')
  }
}

const launchPostcode = () => {
  new window.daum.Postcode({
    oncomplete(data: any) {
      const address = data.address
      const parts = address.split(' ')
      const depth1 = parts[0] || ''
      const depth2 = parts[1] || ''
      const depth3 = parts[2] || ''
      const zonecode = data.zonecode

      const geocoder = new window.kakao.maps.services.Geocoder()
      geocoder.addressSearch(address, (result: any[], status: any) => {
        if (status === window.kakao.maps.services.Status.OK && result.length > 0) {
          const lat = parseFloat(result[0].y)
          const lng = parseFloat(result[0].x)

          emit('update:region', {
            full: `${depth1} ${depth2} ${depth3}`,
            depth1,
            depth2,
            depth3,
            zonecode,
            latitude: lat,
            longitude: lng,
            x: lng,
            y: lat
          })
        } else {
          console.error('❌ 주소 → 좌표 변환 실패')
        }
      })
    }
  }).open()
}
</script>
