<template>
  <v-container class="py-6">
    <v-card class="pa-4">
      <v-card-title class="font-weight-bold">알바 모집 등록</v-card-title>

      <v-text-field label="제목" v-model="title" outlined class="mt-3" />
      <v-textarea label="설명" v-model="description" outlined class="mt-3" />

      <KakaoLocationPicker v-model:region="region" class="mt-3" />

      <v-text-field label="시급 (₩)" v-model="startPrice" type="number" outlined class="mt-3" />
      <v-text-field label="마감 시간" v-model="deadline" type="datetime-local" outlined class="mt-3" />
      <v-file-input label="이미지 업로드" v-model="images" multiple outlined class="mt-3" />

      <v-combobox
          v-model="hashtags"
          label="해시태그"
          multiple
          variant="outlined"
          chips
          class="mt-3"
          hint="예: #급구 #야간알바"
          persistent-hint
      />

      <AdRewardButton v-if="showAdButton" class="mt-4" />
      <v-btn color="orange" class="mt-4" @click="submit">등록하기</v-btn>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { dealApi } from '@/domains/deal/infrastructure/dealApi'
import { useSnackbarStore } from '@/stores/snackbarStore'
import KakaoLocationPicker from '@/components/common/KakaoLocationPicker.vue'
import { useAd } from '@/composables/useAd'
import { useAuthStore } from '@/stores/authStore'
import AdRewardButton from '@/components/common/AdRewardButton.vue'
import {useRouter} from "#vue-router";
const router = useRouter()

const snackbar = useSnackbarStore()
const auth = useAuthStore()
const user = computed(() => auth.user)

const title = ref('')
const description = ref('')
const startPrice = ref<number | null>(null)
const deadline = ref('')
const images = ref<File[]>([])
const hashtags = ref<string[]>([])

const region = ref({
  full: '',
  depth1: '',
  depth2: '',
  depth3: '',
  longitude: null,
  latitude: null
})

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
  if (!title.value || !description.value || !startPrice.value || !deadline.value || !region.value.full) {
    snackbar.show('모든 필드를 입력하세요.', 'error')
    return
  }

  if (!region.value.longitude || !region.value.latitude) {
    snackbar.show('위치를 선택해주세요.', 'error')
    return
  }

  try {
    const res = await dealApi.checkDealRegistration();

    if (!user.value?.isPremium && res.data?.adRequired) {
      const { showRewardAd } = useAd()
      const watched = await showRewardAd()

      if (!watched) {
        snackbar.show('광고를 끝까지 시청해야 등록할 수 있어요.', 'error')
        return
      }

      await dealApi.notifyAdComplete()
    }

    const uploadedUrls = images.value.map((_, i) => `https://s3.bucket/fake-${i}.jpg`)

    const payload = {
      title: title.value,
      description: description.value,
      region: region.value.full,
      regionDepth1: region.value.depth1,
      regionDepth2: region.value.depth2,
      regionDepth3: region.value.depth3,
      latitude: parseFloat(region.value.latitude),
      longitude: parseFloat(region.value.longitude),
      startPrice: startPrice.value,
      deadline: deadline.value,
      type: 'parttime',
      images: uploadedUrls,
      hashtags: hashtags.value
    }

    await dealApi.createDeal(payload)
    snackbar.show('등록 성공!', 'success');
    router.push('/deals/parttime')

  } catch (e: any) {
    console.error('❌ 등록 실패:', e)
    snackbar.show(e?.message || '등록 실패', 'error')
  }
}
</script>