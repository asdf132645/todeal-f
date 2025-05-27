<template>
  <v-container class="py-6">
    <v-card class="pa-5 rounded-lg" elevation="2">
      <div class="text-h6 font-weight-bold mb-4">게시글 수정</div>

      <div class="image-upload-wrapper mb-5">
        <div class="image-grid">
          <div
              v-for="(img, index) in images"
              :key="index"
              class="upload-image-slot"
              @click="removeImage(index)"
          >
            <v-img :src="getImageUrl(img)" cover max-width="100" max-height="100" class="rounded" />
          </div>

          <div
              v-if="images.length < 5"
              class="upload-image-slot add"
              @click="triggerFileInput"
          >
            <v-icon size="50">mdi-plus</v-icon>
          </div>

          <input
              type="file"
              ref="fileInput"
              accept="image/*"
              class="d-none"
              multiple
              @change="onFileChange"
          />
        </div>
        <div class="text-caption text-grey-darken-1 mt-1">{{ images.length }} / 5</div>
      </div>

      <div class="text-caption text-grey-darken-1 mb-1">제목은 최대 40자까지 입력할 수 있어요</div>
      <v-text-field
          v-model="form.title"
          label="제목"
          :counter="40"
          :rules="[v => (v?.length <= 40) || '40자 이내로 입력해주세요.']"
          outlined
          dense
          class="mb-1"
          ref="titleInput"
      />

      <div class="text-caption text-grey-darken-1 mb-1 mt-0">설명은 최대 500자까지 입력할 수 있어요</div>
      <v-textarea
          v-model="form.description"
          label="설명"
          :counter="500"
          :rules="[v => (v?.length <= 500) || '500자 이내로 입력해주세요.']"
          outlined
          rows="4"
          class="mb-1"
          ref="descriptionInput"
      />

      <!-- ✅ 거래 방식 선택 UI -->
      <div class="text-subtitle-2 font-weight-bold mt-4 mb-1">
        가격 설정 방식
      </div>
      <div class="text-caption text-grey-darken-1 mb-2">
        경매 방식은 여러 명이 입찰해서 가장 높은 금액에 판매되고,<br />
        정가 방식는 내가 지정한 가격에 바로 거래되어요.
      </div>
      <v-select
          v-model="form.pricingType"
          :items="pricingTypeOptions"
          label="가격 설정 방식"
          item-title="label"
          item-value="value"
          outlined
          dense
          class="mb-4"
      />

      <KakaoLocationPicker v-model:region="region" />

      <div class="text-caption text-grey-darken-1 mb-1 mt-4">마감일은 최대 30일까지 선택 가능해요</div>
      <v-text-field
          v-model="formattedDeadline"
          label="마감일"
          readonly
          outlined
          dense
          class="mb-3"
          @click="deadlineDialog = true"
      />

      <v-dialog v-model="deadlineDialog" width="320px">
        <v-card>
          <v-date-picker v-model="tempDate" :min="minDate" :max="maxDate" />
          <v-card-actions>
            <v-spacer />
            <v-btn text @click="cancelDeadline">취소</v-btn>
            <v-btn text color="primary" @click="confirmDeadline">확인</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-btn color="primary" class="mt-4" @click="updateDeal" :loading="loading">
        수정 완료
      </v-btn>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { dealApi } from '~/domains/deal/infrastructure/dealApi'
import { useSnackbarStore } from '@/stores/snackbarStore'
import KakaoLocationPicker from '@/components/common/KakaoLocationPicker.vue'
import { uploadImage } from '@/domains/upload/infrastructure/uploadApi'

const uploadedImageUrls = ref<string[]>([])
const pricingTypeOptions = [
  { label: '경매 방식 (여러 명이 입찰)', value: 'BIDDING' },
  { label: '정가 방식 (가격 고정)', value: 'FIXED' }
]

const route = useRoute()
const router = useRouter()
const snackbar = useSnackbarStore()
const loading = ref(false)
const dealId = Number(route.params.id)

const form = ref({
  title: '',
  description: '',
  type: '',
  startPrice: 0,
  currentPrice: 0,
  pricingType: 'BIDDING'
})

const images = ref<(File | string)[]>([])
const fileInput = ref<HTMLInputElement | null>(null)
const titleInput = ref<HTMLInputElement | null>(null)
const descriptionInput = ref<HTMLInputElement | null>(null)
const deadlineDialog = ref(false)
const deadlineDate = ref<Date | null>(null)
const formattedDeadline = ref('')
const tempDate = ref<Date | null>(null)

const region = ref({
  full: '',
  depth1: '',
  depth2: '',
  depth3: '',
  latitude: 0,
  longitude: 0,
  x: null,
  y: null
})

const minDate = new Date()
const maxDate = new Date()
maxDate.setDate(minDate.getDate() + 30)

onMounted(async () => {
  const data = await dealApi.getDealById(dealId)
  form.value = {
    title: data.title,
    description: data.description,
    type: data.type,
    startPrice: data.startPrice,
    currentPrice: data.currentPrice,
    pricingType: data.pricingType || 'BIDDING'
  }
  uploadedImageUrls.value = [...(data.images || [])]
  images.value = [...(data.images || [])]
  deadlineDate.value = new Date(data.deadline)
  tempDate.value = new Date(data.deadline)
  formattedDeadline.value = deadlineDate.value.toISOString().split('T')[0]

  region.value = {
    full: data.region || `${data.regionDepth1} ${data.regionDepth2} ${data.regionDepth3}`,
    depth1: data.regionDepth1,
    depth2: data.regionDepth2,
    depth3: data.regionDepth3,
    zonecode: '',
    latitude: Number(data.latitude),
    longitude: Number(data.longitude)
  }
})

const triggerFileInput = () => {
  if (fileInput.value) fileInput.value.click()
}

const onFileChange = async (e: Event) => {
  const files = (e.target as HTMLInputElement).files
  if (!files) return
  const newFiles = Array.from(files).slice(0, 5 - images.value.length)

  for (const file of newFiles) {
    try {
      const url = await uploadImage(file)
      if (!url) throw new Error('url is null')
      uploadedImageUrls.value.push(url)
      images.value.push(file)
    } catch (e) {
      snackbar.show('이미지 업로드 실패', 'error')
      console.error('이미지 업로드 에러:', e)
    }
  }
  if (fileInput.value) fileInput.value.value = ''
}

const removeImage = (index: number) => {
  images.value.splice(index, 1)
  uploadedImageUrls.value.splice(index, 1)
}

const getImageUrl = (item: File | string): string => {
  return typeof item === 'string' ? item : URL.createObjectURL(item)
}

const confirmDeadline = () => {
  if (!tempDate.value) return
  deadlineDate.value = tempDate.value
  formattedDeadline.value = tempDate.value.toISOString().split('T')[0]
  deadlineDialog.value = false
}

const cancelDeadline = () => {
  deadlineDialog.value = false
}

const updateDeal = async () => {
  if (!form.value.title) {
    snackbar.show('제목을 입력해주세요.', 'error')
    titleInput.value?.focus()
    return
  }
  if (form.value.title.length > 40) {
    snackbar.show('제목은 40자 이내로 입력해주세요.', 'error')
    titleInput.value?.focus()
    return
  }
  if (!form.value.description) {
    snackbar.show('설명을 입력해주세요.', 'error')
    descriptionInput.value?.focus()
    return
  }
  if (form.value.description.length > 500) {
    snackbar.show('설명은 500자 이내로 입력해주세요.', 'error')
    descriptionInput.value?.focus()
    return
  }
  if (!region.value.full) {
    snackbar.show('지역을 선택해주세요.', 'error')
    return
  }
  if (!deadlineDate.value) {
    snackbar.show('마감일을 선택해주세요.', 'error')
    return
  }

  loading.value = true
  try {
    const payload = {
      ...form.value,
      deadline: deadlineDate.value.toISOString(),
      region: region.value.full,
      regionDepth1: region.value.depth1,
      regionDepth2: region.value.depth2,
      regionDepth3: region.value.depth3,
      latitude: Number(region.value.y),
      longitude: Number(region.value.x),
      images: uploadedImageUrls.value
    }
    await dealApi.updateDeal(dealId, payload)
    snackbar.show('수정 성공', 'success')
    router.push(`/deals/detail/${dealId}`)
  } catch (e) {
    snackbar.show('수정 실패', 'error')
    console.error(e)
  } finally {
    loading.value = false
  }
}
</script>

<style>
.image-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.upload-image-slot {
  width: 100px;
  height: 100px;
  border: 1px dashed #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  cursor: pointer;
}
.upload-image-slot.add:hover {
  background-color: #f5f5f5;
}
</style>