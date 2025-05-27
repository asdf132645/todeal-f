<template>
  <v-container>
    <v-alert
        type="warning"
        dense
        class="mb-3 text-caption"
        text
        style="font-size: 0.8rem; line-height: 1.4;"
    >
      {{ _t('board.guideline_warning') }}
    </v-alert>

    <!-- ✅ 카테고리 선택 -->
    <v-select
        v-model="category"
        :items="categoryOptions"
        :label="`${_t('board.category_select')}`"
        item-title="label"
        item-value="value"
        outlined
        clearable
        class="mb-4"
    />
    <!-- ✅ 번역 버튼 안내 -->
    <div class="mb-1 text-caption text-grey-darken-1">
      {{ _t('board.translate_tip') }}
    </div>
    <v-btn block color="primary" class="mb-4" @click="toggleTranslationPanel">
      <v-icon start>mdi-translate</v-icon>
      {{ showTranslatePanel ? `${_t('board.closeTranslation')}` : `${_t('board.openTranslationHelper')}` }}
    </v-btn>

    <v-expand-transition>
      <v-card v-show="showTranslatePanel" class="pa-4 mb-4">
        <v-row dense class="mb-3">
          <v-col cols="6">
            <v-select
                v-model="sourceLang"
                :items="langOptions"
                item-title="label"
                item-value="value"
                :label="`${_t('board.originalLanguage')}`"
                dense
                outlined
            />
          </v-col>
          <v-col cols="6">
            <v-select
                v-model="targetLang"
                :items="langOptions"
                item-title="label"
                item-value="value"
                :label="`${_t('board.targetLanguage')}`"
                dense
                outlined
            />
          </v-col>
        </v-row>
        <v-btn
            :disabled="!sourceLang || !targetLang"
            color="secondary"
            block
            :loading="loading"
            @click="runTranslation"
        >
          {{ _t('board.startTranslation') }}
        </v-btn>
      </v-card>
    </v-expand-transition>

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
    <!-- ✅ 제목/내용 -->
    <v-text-field v-model="title" :label="`${_t('board.title')}`" outlined clearable class="mb-3" />
    <v-textarea v-model="content" :label="`${_t('board.content')}`" outlined rows="4" auto-grow class="mb-3" />



    <!-- ✅ 제출 버튼 -->
    <v-btn block color="primary" :loading="loading" @click="submit">{{ _t("board.complete") }}</v-btn>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { boardApi } from '@/domains/board/infrastructure/boardApi'
import { apiClient } from '@/libs/http/apiClient'
import { useGeoStore } from '@/stores/geoStore'
import { uploadImage } from '~/domains/upload/infrastructure/uploadApi'
import {useI18n} from "vue-i18n";

const title = ref('')
const content = ref('')
const category = ref('')
const imageUrls = ref<string[]>([])
const fileInput = ref<HTMLInputElement | null>(null)
const showTranslatePanel = ref(false)
const sourceLang = ref('ko')
const targetLang = ref('')
const loading = ref(false)
const { t: _t, locale } = useI18n()

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

const triggerFileInput = () => fileInput.value?.click()
const removeImage = (index: number) => imageUrls.value.splice(index, 1)

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

const runTranslation = async () => {
  if (!title.value || !content.value) {
    alert('제목과 내용을 먼저 입력하세요.')
    return
  }
  try {
    const [resTitle, resContent] = await Promise.all([
      apiClient.post('/api/translate', {
        source: sourceLang.value,
        target: targetLang.value,
        text: title.value
      }),
      apiClient.post('/api/translate', {
        source: sourceLang.value,
        target: targetLang.value,
        text: content.value
      })
    ])
    title.value = resTitle.translatedText
    content.value = resContent.translatedText
    showTranslatePanel.value = false
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
      translatedTitle: title.value,
      translatedContent: content.value,
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