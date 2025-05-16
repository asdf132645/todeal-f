<template>
  <v-container class="py-6">
    <v-card class="pa-5 rounded-lg" elevation="2">
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
              capture="environment"
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

      <KakaoLocationPicker v-model:region="region" />

      <div class="text-caption text-grey-darken-1 mb-1 mt-4">마감일은 최대 30일까지 선택 가능합니다</div>
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

      <v-btn
          :disabled="loading"
          block
          class="mt-3 rounded-pill"
          color="primary"
          @click="submit"
      >
        등록하기
      </v-btn>

      <AdRewardButton v-if="showAdButton" @rewarded="submit" class="mt-2" />
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useSnackbarStore } from '@/stores/snackbarStore'
import KakaoLocationPicker from '@/components/common/KakaoLocationPicker.vue'
import AdRewardButton from '@/components/common/AdRewardButton.vue'
import { dealApi } from '~/domains/deal/infrastructure/dealApi'

const { type } = defineProps<{ type: string }>()

const router = useRouter()
const snackbar = useSnackbarStore()
const auth = useAuthStore()
const user = computed(() => auth.user)

const form = ref({
  title: '',
  description: ''
})
const images = ref<File[]>([])
const fileInput = ref<HTMLInputElement | null>(null)
const titleInput = ref<HTMLInputElement | null>(null)
const descriptionInput = ref<HTMLInputElement | null>(null)
const deadlineDialog = ref(false)
const deadlineDate = ref<Date | null>(null)
const formattedDeadline = ref('')
const tempDate = ref<Date | null>(null)
const ticket = ref<any>(null)
const loading = ref(false)

const minDate = new Date()
const maxDate = new Date()
maxDate.setDate(minDate.getDate() + 30)

const region = ref({
  full: '',
  depth1: '',
  depth2: '',
  depth3: '',
  longitude: null,
  latitude: null
})

const showAdButton = computed(() => !user.value?.isPremium && ticket.value?.adRequired)

const headerTitle = computed(() => {
  switch (type) {
    case 'used': return '중고 거래 등록'
    case 'parttime': return '알바 등록'
    case 'parttime-request': return '알바 요청 등록'
    case 'barter': return '물물교환 등록'
    default: return '등록'
  }
})

onMounted(async () => {
  try {
    const res = await dealApi.getTicket()
    ticket.value = res
  } catch (e) {
    console.warn('등록권 상태 불러오기 실패', e)
  }
})

const triggerFileInput = () => {
  if (fileInput.value) fileInput.value.click()
}

const onFileChange = (e: Event) => {
  const files = (e.target as HTMLInputElement).files
  if (!files) return
  const newFiles = Array.from(files).slice(0, 5 - images.value.length)
  images.value.push(...newFiles)
  if (fileInput.value) fileInput.value.value = ''
}

const removeImage = (index: number) => {
  images.value.splice(index, 1)
}

const getImageUrl = (file: File) => URL.createObjectURL(file)

const confirmDeadline = () => {
  if (!tempDate.value) return
  deadlineDate.value = tempDate.value
  formattedDeadline.value = tempDate.value.toISOString().split('T')[0]
  deadlineDialog.value = false
}

const cancelDeadline = () => {
  deadlineDialog.value = false
}

const submit = async () => {
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

  const formData = new FormData()
  formData.append('type', type)
  formData.append('title', form.value.title)
  formData.append('description', form.value.description)
  formData.append('deadline', deadlineDate.value.toISOString())
  formData.append('region', region.value.full)
  formData.append('regionDepth1', region.value.depth1)
  formData.append('regionDepth2', region.value.depth2)
  formData.append('regionDepth3', region.value.depth3)
  formData.append('longitude', String(region.value.longitude))
  formData.append('latitude', String(region.value.latitude))

  images.value.forEach((file) => {
    if (file) formData.append('images', file)
  })

  loading.value = true
  try {
    await dealApi.createDeal(formData)
    snackbar.show('등록이 완료되었습니다.', 'success')
    router.push(`/deals/${type}`)
  } catch (e) {
    snackbar.show('등록에 실패했습니다.', 'error')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
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