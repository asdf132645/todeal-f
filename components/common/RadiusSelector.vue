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
        @click="recalculateLocation"
    >
      <v-icon start>mdi-crosshairs-gps</v-icon>
      내 위치 다시 설정
    </v-btn>

    <LocationConsentDialog
        v-model="showConsentDialog"
        @consent="handleConsent"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useGeoStore } from '@/stores/geoStore'
import LocationConsentDialog from '@/components/common/LocationConsentDialog.vue'

const emit = defineEmits<{
  (e: 'change', value: number): void
  (e: 'refresh'): void
}>()

const geo = useGeoStore()

const radiusOptions = [1, 2, 3, 5, 10, 15, 20, 25, 30, 40, 100]
const radius = ref(2)
const showConsentDialog = ref(false)

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

const recalculateLocation = async () => {
  showConsentDialog.value = true

}

const handleConsent = (accepted: boolean) => {
  if (accepted) {
    localStorage.setItem('locationConsent', 'true')
    recalculateLocation()
  } else {
    localStorage.setItem('locationConsent', 'false')
  }
  showConsentDialog.value = false
}
</script>

<style scoped>
.w-100 {
  width: 100%;
}
</style>
