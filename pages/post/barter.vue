<template>
  <v-container class="py-6">
    <v-card class="pa-5 rounded-lg" elevation="2">
      <div class="text-h6 font-weight-bold mb-4">물물교환 등록</div>

      <v-text-field v-model="form.title" label="제목" required outlined dense />
      <v-textarea v-model="form.description" label="설명" rows="4" outlined dense />
      <v-text-field v-model="form.proposedItem" label="교환 희망 품목" required outlined dense />
      <v-text-field v-model="form.deadline" label="마감 시간" type="datetime-local" outlined dense required />
      <KakaoLocationPicker class="mb-4" v-model:region="region" />

      <v-file-input
          v-model="images"
          label="이미지 첨부 (mock)"
          prepend-icon="mdi-camera"
          accept="image/*"
          multiple
          outlined
          dense
          show-size
          class="mt-3"
      />

      <v-btn color="primary" class="mt-4" @click="submit" :loading="loading">
        등록하기
      </v-btn>
      <AdRewardButton v-if="showAdButton" class="mt-4" />

    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import KakaoLocationPicker from '@/components/common/KakaoLocationPicker.vue'
import { dealApi } from '~/domains/deal/infrastructure/dealApi'
import { useSnackbarStore } from '@/stores/snackbarStore'
import { useAd } from '@/composables/useAd'
import AdRewardButton from '~/components/common/AdRewardButton.vue'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const snackbar = useSnackbarStore()
const loading = ref(false)

const form = ref({
  title: '',
  description: '',
  proposedItem: '',
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
const ticket = ref<any>(null)
const auth = useAuthStore()
const user = computed(() => auth.user)

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
  if (!form.value.title || !form.value.description || !form.value.proposedItem || !form.value.deadline) {
    snackbar.show('모든 필수 항목을 입력해주세요.', 'error')
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
        ? images.value.map((_, i) => `https://via.placeholder.com/300x200`)
        : []

    const payload = {
      title: form.value.title,
      description: `${form.value.description}\n\n💬 교환 희망 품목: ${form.value.proposedItem}`,
      type: 'barter',
      startPrice: 0,
      currentPrice: 0,
      deadline: form.value.deadline,
      region: region.value.full,
      regionDepth1: region.value.depth1,
      regionDepth2: region.value.depth2,
      regionDepth3: region.value.depth3,
      latitude: parseFloat(region.value.latitude),
      longitude: parseFloat(region.value.longitude),
      images: uploadedImages,
      hashtags: []
    }

    await dealApi.createDeal(payload)
    snackbar.show('등록 성공!', 'success')
    router.push('/deals/barter')
  } catch (e: any) {
    snackbar.show(e?.message || '등록 실패', 'error')
    console.error(e)
  } finally {
    loading.value = false
  }
}
</script>
