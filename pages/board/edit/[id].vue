<template>
  <v-container>
    <!--  카테고리 안내 -->
    <v-alert
        type="warning"
        dense
        class="mb-3 text-caption"
        text
        style="font-size: 0.8rem; line-height: 1.4;"
    >
      커뮤니티 가이드라인에 어긋나는 내용은 사전 통보 없이 삭제될 수 있습니다.
    </v-alert>
    <div class="mb-1 text-caption text-grey-darken-1">글의 성격에 맞는 카테고리를 선택해주세요.</div>
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



    <!--  이미지 업로더 -->
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
    <!--  번역 패널 -->
    <v-expand-transition>
      <v-card v-show="showTranslatePanel" class="pa-4 mb-4">
        <div class="mb-1 text-caption text-grey-darken-1">제목과 내용을 선택한 언어로 번역해 드립니다. 정확한 번역을 위해 원문을 먼저 입력해주세요.</div>

        <v-row dense class="mb-3">
          <v-col cols="6">
            <v-select
                v-model="sourceLang"
                :items="langOptions"
                label="원문 언어"
                item-title="label"
                item-value="value"
                dense
                outlined
            />
          </v-col>
          <v-col cols="6">
            <v-select
                v-model="targetLang"
                :items="langOptions"
                label="번역할 언어"
                item-title="label"
                item-value="value"
                dense
                outlined
            />
          </v-col>
        </v-row>

        <v-btn
            :disabled="!sourceLang || !targetLang"
            color="secondary"
            block
            class="mb-3"
            :loading="loading"
            @click="runTranslation"
        >
          번역 시작
        </v-btn>
      </v-card>
    </v-expand-transition>
    <!--  제목/내용 입력 -->
    <v-text-field v-model="title" label="제목" outlined clearable class="mb-3" />
    <v-textarea v-model="content" label="내용" outlined rows="4" auto-grow class="mb-3" />



    <!--  수정 완료 -->
    <v-btn
        block
        color="primary"
        class="mt-2"
        :loading="loading"
        @click="submit"
    >
      수정 완료
    </v-btn>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { boardApi } from '@/domains/board/infrastructure/boardApi'
import { apiClient } from '@/libs/http/apiClient'
import { uploadImage } from '~/domains/upload/infrastructure/uploadApi'

const route = useRoute()
const router = useRouter()
const postId = Number(route.params.id)

const title = ref('')
const content = ref('')
const originalTitle = ref('')    //  원문 저장용
const originalContent = ref('')
const category = ref('')
const loading = ref(false)
const originalPost = ref<any>(null)

const imageUrls = ref<string[]>([])
const fileInput = ref<HTMLInputElement | null>(null)

const showTranslatePanel = ref(false)
const sourceLang = ref('ko')
const targetLang = ref('')
const translatedTitle = ref('')     //  번역본 저장용
const translatedContent = ref('')

const langOptions = [
  { label: '한국어', value: 'ko' },
  { label: '영어', value: 'en' }
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

const load = async () => {
  try {
    const res = await boardApi.getPost(postId)
    originalPost.value = res

    title.value = res.title
    content.value = res.content
    originalTitle.value = res.title      //  원문 저장
    originalContent.value = res.content
    translatedTitle.value = res.translatedTitle || ''
    translatedContent.value = res.translatedContent || ''

    category.value = res.category
    imageUrls.value = res.imageUrls || []
    sourceLang.value = res.language || 'ko'
  } catch (e) {
    alert('게시글을 불러올 수 없습니다.')
  }
}

const triggerFileInput = () => fileInput.value?.click()
const removeImage = (index: number) => imageUrls.value.splice(index, 1)

const handleImageUpload = async (e: Event) => {
  const files = (e.target as HTMLInputElement).files
  if (!files) return

  const selected = Array.from(files).slice(0, 5 - imageUrls.value.length)
  const uploaded: string[] = []

  for (const file of selected) {
    try {
      const url = await uploadImage(file)
      uploaded.push(url)
    } catch (e) {
      alert('이미지 업로드 실패')
      console.error(e)
    }
  }
  imageUrls.value.push(...uploaded)
  if (fileInput.value) fileInput.value.value = ''
}

const toggleTranslationPanel = () => showTranslatePanel.value = !showTranslatePanel.value

const runTranslation = async () => {
  if (!title.value || !content.value) {
    alert('제목과 내용을 먼저 입력해주세요.')
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

    translatedTitle.value = resTitle.data.translatedText
    translatedContent.value = resContent.data.translatedText
    showTranslatePanel.value = false
  } catch (e) {
    console.error(e)
    alert('번역 중 오류가 발생했습니다.')
  }
}

const submit = async () => {
  if (!title.value.trim() || !content.value.trim()) {
    alert('제목과 내용을 입력해주세요.')
    return
  }
  if (!category.value) {
    alert('카테고리를 선택해주세요.')
    return
  }

  loading.value = true
  try {
    await boardApi.updatePost(postId, {
      title: originalTitle.value || title.value,        //  원문
      content: originalContent.value || content.value,  //  원문
      translatedTitle: translatedTitle.value || null,   //  번역본
      translatedContent: translatedContent.value || null,
      category: category.value,
      language: sourceLang.value,
      latitude: originalPost.value.latitude,
      longitude: originalPost.value.longitude,
      nickname: originalPost.value.nickname,
      region: originalPost.value.region,
      imageUrls: imageUrls.value
    })
    router.push(`/board/view/${postId}`)
  } catch (e) {
    console.error(e)
    alert('게시글 수정 중 오류가 발생했습니다.')
  } finally {
    loading.value = false
  }
}

onMounted(load)
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