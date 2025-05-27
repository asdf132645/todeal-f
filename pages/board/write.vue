<template>
  <v-container>
    <v-alert type="warning" dense class="mb-3" text>
      커뮤니티 가이드라인에 어긋나는 내용은 사전 통보 없이 삭제될 수 있습니다.
    </v-alert>

    <!-- ✅ 카테고리 선택 -->
    <v-select
        v-model="category"
        :items="categoryOptions"
        label="카테고리 선택"
        item-title="label"
        item-value="value"
        outlined
        clearable
        class="mb-4"
    />

    <!-- ✅ 제목/내용 -->
    <v-text-field v-model="title" label="제목" outlined clearable class="mb-3" />
    <v-textarea v-model="content" label="내용" outlined rows="4" auto-grow class="mb-3" />

    <!-- ✅ 이미지 업로더 -->
    <div class="image-upload-wrapper mb-5">
      <div class="image-grid">
        <div
            v-for="(img, index) in imageUrls"
            :key="index"
            class="upload-image-slot"
            @click="removeImage(index)"
        >
          <v-img :src="img" cover max-width="100" max-height="100" class="rounded" />
        </div>

        <div v-if="imageUrls.length < 5" class="upload-image-slot add" @click="triggerFileInput">
          <v-icon size="50">mdi-plus</v-icon>
        </div>

        <input
            type="file"
            ref="fileInput"
            accept="image/*"
            class="d-none"
            multiple
            @change="handleImageUpload"
        />
      </div>
      <div class="text-caption text-grey-darken-1 mt-1">{{ imageUrls.length }} / 5</div>
    </div>

    <!-- ✅ 번역 패널 -->
    <v-btn block color="primary" class="mb-4" @click="toggleTranslationPanel">
      <v-icon start>mdi-translate</v-icon>
      {{ showTranslatePanel ? '번역 닫기' : '번역 도우미 열기' }}
    </v-btn>

    <v-expand-transition>
      <v-card v-show="showTranslatePanel" class="pa-4 mb-4">
        <v-row dense class="mb-3">
          <v-col cols="6">
            <v-select v-model="sourceLang" :items="langOptions" label="원문 언어" dense outlined />
          </v-col>
          <v-col cols="6">
            <v-select v-model="targetLang" :items="langOptions" label="번역할 언어" dense outlined />
          </v-col>
        </v-row>
        <v-btn
            :disabled="!sourceLang || !targetLang"
            color="secondary"
            block
            :loading="loading"
            @click="runTranslation"
        >
          번역 시작
        </v-btn>
        <v-card v-if="translatedTitle || translatedContent" class="pa-3 translated-box mt-4">
          <v-text-field v-model="translatedTitle" label="번역된 제목" readonly dense outlined />
          <v-textarea
              v-model="translatedContent"
              label="번역된 내용"
              readonly
              rows="3"
              auto-grow
              outlined
              class="mt-2"
          />
        </v-card>
        <v-btn block color="success" class="mt-3" @click="applyTranslation">번역 결과 적용하기</v-btn>
      </v-card>
    </v-expand-transition>

    <!-- ✅ 제출 버튼 -->
    <v-btn block color="primary" :loading="loading" @click="submit">작성 완료</v-btn>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { boardApi } from '@/domains/board/infrastructure/boardApi'
import { apiClient } from '@/libs/http/apiClient'
import { useGeoStore } from '@/stores/geoStore'
import { uploadImage } from '~/domains/upload/infrastructure/uploadApi'

const title = ref('')
const content = ref('')
const category = ref('')
const imageUrls = ref<string[]>([])
const fileInput = ref<HTMLInputElement | null>(null)
const translatedTitle = ref('')
const translatedContent = ref('')
const showTranslatePanel = ref(false)
const sourceLang = ref('ko')
const targetLang = ref('')
const loading = ref(false)

const geo = useGeoStore()
const router = useRouter()
const nickname = process.client ? localStorage.getItem('nickname') || '익명' : '익명'
const region = process.client ? localStorage.getItem('userRegion') ?? undefined : undefined

const langOptions = [
  { label: '한국어', value: 'ko' },
  { label: '영어', value: 'en' },
  { label: '일본어', value: 'ja' },
  { label: '베트남어', value: 'vi' },
  { label: '중국어 간체', value: 'zh-CN' },
  { label: '중국어 번체', value: 'zh-TW' },
  { label: '태국어', value: 'th' },
  { label: '인도네시아어', value: 'id' }
]

const categoryOptions = [
  { label: '우리 동네 생활', value: 'local-life' },
  { label: '중고거래 도움', value: 'trade-help' },
  { label: '알바 정보', value: 'parttime' },
  { label: '언어 교환', value: 'language-exchange' },
  { label: '문화 교류', value: 'culture' },
  { label: 'Q&A', value: 'qna' },
  { label: '자유', value: 'free' }
]

const triggerFileInput = () => {
  fileInput.value?.click()
}

const removeImage = (index: number) => {
  imageUrls.value.splice(index, 1)
}

const handleImageUpload = async (event: Event) => {
  const files = (event.target as HTMLInputElement).files
  if (!files || files.length === 0) return

  const newFiles = Array.from(files).slice(0, 5 - imageUrls.value.length)
  const uploadedUrls: string[] = []

  for (const file of newFiles) {
    try {
      const url = await uploadImage(file)
      if (!url) throw new Error('S3 업로드 실패')
      uploadedUrls.push(url)
    } catch (e) {
      console.error('이미지 업로드 실패:', e)
      alert('이미지 업로드에 실패했습니다.')
    }
  }

  imageUrls.value.push(...uploadedUrls)
  if (fileInput.value) fileInput.value.value = ''
}


const toggleTranslationPanel = () => showTranslatePanel.value = !showTranslatePanel.value
const applyTranslation = () => {
  title.value = translatedTitle.value
  content.value = translatedContent.value
}

const runTranslation = async () => {
  if (!title.value || !content.value) {
    alert('제목과 내용을 먼저 입력하세요.')
    return
  }
  try {
    const [resTitle, resContent] = await Promise.all([
      apiClient.post('/api/translate', { source: sourceLang.value, target: targetLang.value, text: title.value }),
      apiClient.post('/api/translate', { source: sourceLang.value, target: targetLang.value, text: content.value })
    ])
    translatedTitle.value = resTitle.translatedText
    translatedContent.value = resContent.translatedText
  } catch (e) {
    console.error(e)
    alert('번역 중 오류가 발생했습니다.')
  }
}

const submit = async () => {
  if (!title.value.trim() || !content.value.trim()) return alert('제목과 내용을 입력해주세요.')
  if (!category.value) return alert('카테고리를 선택해주세요.')

  loading.value = true
  try {
    await boardApi.createPost({
      title: title.value,
      content: content.value,
      category: category.value,
      language: sourceLang.value,
      translatedTitle: translatedTitle.value,
      translatedContent: translatedContent.value,
      latitude: geo.latitude,
      longitude: geo.longitude,
      nickname,
      region,
      imageUrls: imageUrls.value
    })
    router.push('/board')
  } catch (e) {
    console.error(e)
    alert('게시글 작성 실패')
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