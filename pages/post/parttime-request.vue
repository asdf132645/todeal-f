<template>
  <v-container class="py-6">
    <v-card class="pa-5 rounded-lg" elevation="2">
      <div class="text-h6 font-weight-bold mb-4">알바 요청 등록</div>

      <v-text-field v-model="form.title" label="제목" outlined dense />
      <v-textarea v-model="form.description" label="요청 메시지" rows="4" outlined dense required />
      <v-text-field v-model="form.deadline" label="마감 시간" type="datetime-local" outlined dense />

      <KakaoLocationPicker class="mb-4" v-model:region="region" />

      <v-file-input
          v-model="images"
          label="첨부 이미지 (선택)"
          prepend-icon="mdi-camera"
          accept="image/*"
          multiple
          outlined
          dense
          show-size
      />

      <v-combobox
          v-model="hashtags"
          label="해시태그"
          multiple
          variant="outlined"
          chips
          class="mt-3"
          hint="예: #당일알바 #바로출근"
          persistent-hint
      />

      <AdRewardButton v-if="showAdButton" class="mt-4" />
      <v-btn color="primary" class="mt-4" @click="submit" :loading="loading">
        요청 등록하기
      </v-btn>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import KakaoLocationPicker from '@/components/common/KakaoLocationPicker.vue'
import { useSnackbarStore } from '@/stores/snackbarStore'
import { dealApi } from '~/domains/deal/infrastructure/dealApi'
import { useAd } from '@/composables/useAd'
import { useAuthStore } from '@/stores/authStore'
import AdRewardButton from '@/components/common/AdRewardButton.vue'

const router = useRouter()
const snackbar = useSnackbarStore()
const loading = ref(false)
const auth = useAuthStore()
const user = computed(() => auth.user)

const form = ref({
  title: '알바 요청',
  description: '',
  deadline: ''
})

const region = ref({
  full: '',
  depth1: '',
  depth2: '',
  depth3: '',
  longitude: null,
  latitude: null
})
const images = ref<File[]>([])
const hashtags = ref<string[]>([])
const ticket = ref<any>(null)

const showAdButton = computed(() => {
  return !user.value?.isPremium && ticket.value?.adRequired
})

onMounted(async () => {
  try {
    const res = await dealApi.getTicket()
    ticket.value = res
  } catch (e) {
    console.warn('등록권 상태 불러오기 실패', e)
  }
})

const submit = async () => {
  if (!form.value.description || !form.value.deadline || !form.value.title) {
    snackbar.show('모든 항목을 입력해주세요.', 'error')
    return
  }

  if (!region.value.longitude || !region.value.latitude) {
    snackbar.show('위치를 선택해주세요.', 'error')
    return
  }

  loading.value = true
  try {
    const res = await dealApi.checkDealRegistration()

    if (!user.value?.isPremium && res.data?.adRequired) {
      const { showRewardAd } = useAd()
      const watched = await showRewardAd()

      if (!watched) {
        snackbar.show('광고를 끝까지 시청해야 등록할 수 있어요.', 'error')
        return
      }

      await dealApi.notifyAdComplete()
    }

    const uploadedImages = images.value.length
        ? images.value.map((_, i) => `https://s3.bucket/fake-${i}.jpg`)
        : []

    const payload = {
      title: form.value.title,
      description: form.value.description,
      type: 'parttime-request',
      startPrice: 0,
      currentPrice: 0,
      deadline: new Date(form.value.deadline).toISOString(),
      region: region.value.full,
      regionDepth1: region.value.depth1,
      regionDepth2: region.value.depth2,
      regionDepth3: region.value.depth3,
      latitude: parseFloat(region.value.latitude),
      longitude: parseFloat(region.value.longitude),
      images: uploadedImages,
      hashtags: hashtags.value
    }

    await dealApi.createDeal(payload)
    snackbar.show('등록 성공!', 'success')
    router.push('/deals/parttime-request')
  } catch (e: any) {
    snackbar.show(e?.message || '등록 실패', 'error')
    console.error('❌ 등록 실패:', e)
  } finally {
    loading.value = false
  }
}
</script>