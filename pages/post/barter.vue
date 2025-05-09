<template>
  <v-container class="py-6">
    <v-card class="pa-5 rounded-lg" elevation="2">
      <div class="text-h6 font-weight-bold mb-4">물물교환 등록</div>

      <v-text-field v-model="form.title" label="제목" required outlined dense />
      <v-textarea v-model="form.description" label="설명" rows="4" outlined dense />
      <v-text-field v-model="form.proposedItem" label="교환 희망 품목" required outlined dense />
      <v-text-field v-model="form.deadline" label="마감 시간" type="datetime-local" outlined dense required />

      <KakaoLocationPicker @selected="onLocationSelected" class="mt-3" />

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
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import KakaoLocationPicker from '@/components/common/KakaoLocationPicker.vue'
import { dealApi } from '~/domains/deal/infrastructure/dealApi'
import { useSnackbarStore } from '@/stores/snackbarStore'

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
  x: null,
  y: null
})

const images = ref<File[]>([])

const onLocationSelected = (item: any) => {
  region.value = {
    full: item.address_name,
    depth1: item.address_name.split(' ')[0],
    depth2: item.address_name.split(' ')[1],
    depth3: item.address_name.split(' ')[2] || '',
    x: item.x,
    y: item.y
  }
}

const submit = async () => {
  if (
      !form.value.title ||
      !form.value.description ||
      !form.value.proposedItem ||
      !form.value.deadline
  ) {
    snackbar.show('모든 필수 항목을 입력해주세요.', 'error')
    return
  }

  if (!region.value.x || !region.value.y) {
    snackbar.show('위치를 선택해주세요.', 'error')
    return
  }

  loading.value = true
  try {
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
      latitude: parseFloat(region.value.y),
      longitude: parseFloat(region.value.x),
      images: uploadedImages,
      hashtags: []
    }

    await dealApi.createDeal(payload)
    snackbar.show('등록 성공!', 'success')
    router.push('/post')
  } catch (e) {
    snackbar.show('등록 실패', 'error')
    console.error(e)
  } finally {
    loading.value = false
  }
}
</script>
