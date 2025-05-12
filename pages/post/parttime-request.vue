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

      <v-btn color="primary" class="mt-4" @click="submit" :loading="loading">
        요청 등록하기
      </v-btn>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import KakaoLocationPicker from '@/components/common/KakaoLocationPicker.vue'
import { useSnackbarStore } from '@/stores/snackbarStore'
import { dealApi } from '~/domains/deal/infrastructure/dealApi'

const router = useRouter()
const snackbar = useSnackbarStore()
const loading = ref(false)

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
});
const images = ref<File[]>([]);
const hashtags = ref<string[]>([]);

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
    // // 이미지가 있다면 실제 URL 받아오는 부분
    // const uploadedImages = images.value.length
    //     ? await uploadImages(images.value) // 이미지 업로드 처리 함수 호출
    //     : []

    const payload = {
      title: form.value.title,
      description: form.value.description,
      type: 'parttime-request',
      startPrice: 0,
      currentPrice: 0,
      deadline: new Date(form.value.deadline).toISOString(),  // 날짜 포맷 맞추기
      region: region.value.full,
      regionDepth1: region.value.depth1,
      regionDepth2: region.value.depth2,
      regionDepth3: region.value.depth3,
      latitude: parseFloat(region.value.latitude),
      longitude: parseFloat(region.value.longitude),
      // images: uploadedImages, // S3 업로드된 이미지 URL
      hashtags: hashtags.value
    }

    await dealApi.createDeal(payload)
    snackbar.show('등록 성공!', 'success')
    router.push('/')
  } catch (e) {
    snackbar.show('등록 실패', 'error')
  } finally {
    loading.value = false
  }
}

</script>
