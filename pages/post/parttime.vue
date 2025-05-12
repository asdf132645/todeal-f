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

      <v-btn color="orange" class="mt-4" @click="submit">등록하기</v-btn>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { dealApi } from '@/domains/deal/infrastructure/dealApi'
import { useSnackbarStore } from '@/stores/snackbarStore'
import KakaoLocationPicker from '@/components/common/KakaoLocationPicker.vue'

const snackbar = useSnackbarStore()
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

const submit = async () => {
  if (
      !title.value ||
      !description.value ||
      !startPrice.value ||
      !deadline.value ||
      !region.value.full
  ) {
    snackbar.show('모든 필드를 입력하세요.', 'error')
    return
  }

  if (!region.value.longitude || !region.value.latitude) {
    snackbar.show('위치를 선택해주세요.', 'error')
    return
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

  try {
    const res = await dealApi.createDeal(payload)
    console.log('✅ 등록 성공:', res)
    snackbar.show('등록 성공!', 'success')
  } catch (e) {
    console.error('❌ 등록 실패:', e)
    snackbar.show('등록 실패', 'error')
  }
}
</script>
