<template>
  <v-container fluid class="py-6">
    <v-card class="pa-4 rounded-lg elevation-1">
      <div class="text-h6 font-weight-bold mb-2">중고 거래 등록</div>
      <div class="text-caption text-grey-darken-1 mb-4">실시간 경매용 여러 종류의 중고 거래를 등록하세요.</div>

      <v-row dense class="mb-5">
        <v-col
            v-for="(img, index) in images"
            :key="index"
            cols="4"
            class="d-flex justify-center align-center"
        >
          <div class="upload-slot" @click="triggerFileInput(index)">
            <template v-if="img">
              <v-img :src="getImageUrl(img)" cover max-width="100" max-height="100" class="rounded" />
            </template>
            <template v-else>
              <v-icon size="36" color="grey-lighten-1">mdi-plus</v-icon>
            </template>
          </div>
          <input
              type="file"
              accept="image/*"
              class="d-none"
              :ref="el => assignInputRef(el, index)"
              @change="onFileChange($event, index)"
          />
        </v-col>
      </v-row>

      <v-text-field v-model="title" label="제목" variant="outlined" density="comfortable" class="mb-3" />
      <v-textarea v-model="description" label="설명" variant="outlined" rows="4" auto-grow density="comfortable" class="mb-3" />
      <v-text-field v-model="startPrice" label="시작가 (₩)" type="number" variant="outlined" density="comfortable" class="mb-3" />

      <v-combobox
          v-model="hashtags"
          label="해시태그"
          multiple
          variant="outlined"
          chips
          class="mb-4"
          hint="예: #나이키 #급구"
          persistent-hint
      />

      <KakaoLocationPicker v-model:region="region" class="mb-4" />

      <v-text-field
          label="마감 날짜"
          readonly
          :model-value="formattedDeadline"
          variant="outlined"
          class="mb-3"
          @click="deadlineDialog = true"
      />

      <v-dialog v-model="deadlineDialog" persistent max-width="400px" attach="body">
        <v-card>
          <v-card-title class="text-subtitle-1 font-weight-bold">마감 날짜 선택</v-card-title>
          <v-divider />
          <v-card-text>
            <v-date-picker v-model="deadlineDate" />
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn text color="primary" @click="onConfirmDeadline">확인</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <AdRewardButton v-if="showAdButton" class="mb-4" />
      <v-btn block color="primary" size="large" @click="submit">등록하기</v-btn>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { dealApi } from '~/domains/deal/infrastructure/dealApi'
import { useSnackbarStore } from '@/stores/snackbarStore'
import KakaoLocationPicker from '@/components/common/KakaoLocationPicker.vue'
import { useAd } from '@/composables/useAd'
import { useAuthStore } from '@/stores/authStore'
import AdRewardButton from '@/components/common/AdRewardButton.vue'
import {useRouter} from "#vue-router";

const snackbar = useSnackbarStore()
const auth = useAuthStore()
const user = computed(() => auth.user)

const title = ref('')
const description = ref('')
const startPrice = ref<number | null>(null)
const hashtags = ref<string[]>([])
const images = ref<(File | null)[]>([null, null, null, null, null])
const fileInputs = ref<(HTMLInputElement | null)[]>([])
const router = useRouter()

const region = ref({
  full: '',
  depth1: '',
  depth2: '',
  depth3: '',
  longitude: null,
  latitude: null
})

const deadlineDialog = ref(false)
const deadlineDate = ref<Date | null>(null)
const formattedDeadline = ref('')
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

const assignInputRef = (el: Element | null, index: number) => {
  if (!el || el.tagName !== 'INPUT') return
  while (fileInputs.value.length <= index) fileInputs.value.push(null)
  fileInputs.value[index] = el as HTMLInputElement
}

const triggerFileInput = (index: number) => {
  const input = fileInputs.value[index]
  if (input instanceof HTMLInputElement) input.click()
}

const onFileChange = (e: Event, index: number) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    while (images.value.length <= index) images.value.push(null)
    images.value[index] = file
  }
}

const getImageUrl = (file: File) => URL.createObjectURL(file)

const onConfirmDeadline = () => {
  if (!deadlineDate.value) {
    snackbar.show('마감 날짜를 선택하세요.', 'error')
    return
  }
  const selected = new Date(deadlineDate.value)
  const today = new Date()
  const max = new Date()
  max.setDate(today.getDate() + 90)

  if (selected > max) {
    snackbar.show('마감 날짜는 최대 90일까지만 설정할 수 있어요.', 'error')
    return
  }

  const yyyy = selected.getFullYear()
  const mm = String(selected.getMonth() + 1).padStart(2, '0')
  const dd = String(selected.getDate()).padStart(2, '0')
  formattedDeadline.value = `${yyyy}-${mm}-${dd}`
  deadlineDialog.value = false
}

const getDeadlineISO = () => {
  if (!deadlineDate.value) return null
  const d = new Date(deadlineDate.value)
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

const submit = async () => {
  if (!title.value || !description.value || !startPrice.value || !deadlineDate.value) {
    snackbar.show('모든 필드를 입력하세요.', 'error')
    return
  }

  if (!region.value.longitude || !region.value.latitude) {
    snackbar.show('위치를 선택해주세요.', 'error')
    return
  }

  try {
    const res = await dealApi.checkDealRegistration()
    if (!res.success) throw new Error(res.message)

    if (!user.value?.isPremium && res.data?.adRequired) {
      const { showRewardAd } = useAd()
      const watched = await showRewardAd()

      if (!watched) {
        snackbar.show('광고를 끝까지 시청해야 등록할 수 있어요.', 'error')
        return
      }

      await dealApi.notifyAdComplete()
    }

    const uploadedUrls = images.value
        .filter((img): img is File => !!img)
        .map((_, idx) => `https://s3.bucket/fake-${idx}.jpg`)

    const payload = {
      title: title.value,
      description: description.value,
      startPrice: startPrice.value,
      currentPrice: startPrice.value,
      deadline: getDeadlineISO(),
      region: region.value.full,
      regionDepth1: region.value.depth1,
      regionDepth2: region.value.depth2,
      regionDepth3: region.value.depth3,
      latitude: parseFloat(region.value.latitude),
      longitude: parseFloat(region.value.longitude),
      images: uploadedUrls,
      hashtags: hashtags.value,
      type: 'used'
    }

    await dealApi.createDeal(payload)
    snackbar.show('등록 성공!', 'success');
    router.push('/deals/used')

  } catch (err: any) {
    console.error('등록 실패:', err)
    snackbar.show(err?.message || '등록 실패', 'error')
  }
}
</script>

<style scoped>
.upload-slot {
  width: 100px;
  height: 100px;
  border: 1px dashed #ccc;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>