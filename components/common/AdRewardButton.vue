<template>
  <v-btn
      color="primary"
      :loading="loading"
      block
      @click="handleWatchAd"
  >
    📺 광고 보고 등록권 받기
  </v-btn>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { dealApi } from '~/domains/deal/infrastructure/dealApi'
import { useSnackbarStore } from '@/stores/snackbarStore'
import { useAd } from '@/composables/useAd'

const snackbar = useSnackbarStore()
const loading = ref(false)

const handleWatchAd = async () => {
  const { showRewardAd } = useAd()

  loading.value = true
  try {
    const watched = await showRewardAd()

    if (!watched) {
      snackbar.show('광고를 끝까지 시청해야 등록권이 지급돼요.', 'error')
      return
    }

    await dealApi.notifyAdComplete()
    snackbar.show('✅ 등록권 10회 지급 완료!', 'success')
  } catch (e) {
    console.error('광고 시청 실패:', e)
    snackbar.show('오류가 발생했어요. 잠시 후 다시 시도해주세요.', 'error')
  } finally {
    loading.value = false
  }
}
</script>
