<template>
  <v-container>
    <!-- ✅ 카테고리 안내 -->
    <v-alert type="warning" dense class="mb-3" text>
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

    <!-- ✅ 제목/내용 입력 -->
    <div class="mb-1 text-caption text-grey-darken-1">내용을 명확하고 간결하게 수정해주세요.</div>
    <v-text-field v-model="title" label="제목" outlined clearable class="mb-3" />
    <v-textarea v-model="content" label="내용" outlined rows="4" auto-grow class="mb-3" />

    <!-- ✅ 번역 버튼 안내 -->
    <div class="mb-1 text-caption text-grey-darken-1">다른 언어 사용자도 볼 수 있도록 번역 기능을 활용해보세요</div>
    <v-btn block color="primary" class="mb-4" @click="toggleTranslationPanel">
      <v-icon start>mdi-translate</v-icon>
      {{ showTranslatePanel ? '번역 닫기' : '번역 도우미 열기' }}
    </v-btn>

    <!-- ✅ 번역 패널 -->
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

        <v-card
            v-show="translatedTitle.trim().length > 0 || translatedContent.trim().length > 0"
            class="pa-3 translated-box mb-3"
        >
          <div class="text-subtitle-2 mb-2">🔁 번역 결과 미리보기</div>
          <v-text-field
              v-if="translatedTitle"
              v-model="translatedTitle"
              label="번역된 제목"
              readonly
              dense
              outlined
              class="translated-field"
          />
          <v-textarea
              v-if="translatedContent"
              v-model="translatedContent"
              label="번역된 내용"
              readonly
              rows="3"
              auto-grow
              outlined
              class="mt-2 translated-field"
          />
        </v-card>

        <v-btn block color="success" @click="applyTranslation">
          번역 결과 적용하기
        </v-btn>
      </v-card>
    </v-expand-transition>

    <!-- ✅ 수정 완료 -->
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

const route = useRoute()
const router = useRouter()
const postId = Number(route.params.id)

const title = ref('')
const content = ref('')
const category = ref('')
const loading = ref(false)
const originalPost = ref<any>(null)

const showTranslatePanel = ref(false)
const sourceLang = ref('ko')
const targetLang = ref('')
const translatedTitle = ref('')
const translatedContent = ref('')

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

const load = async () => {
  try {
    const res = await boardApi.getPost(postId)
    originalPost.value = res.data
    title.value = res.data.title
    content.value = res.data.content
    category.value = res.data.category
    sourceLang.value = res.data.language || 'ko'
  } catch (e) {
    alert('게시글을 불러올 수 없습니다.')
    router.push('/board')
  }
}

const toggleTranslationPanel = () => {
  showTranslatePanel.value = !showTranslatePanel.value
}

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
  } catch (e) {
    console.error(e)
    alert('번역 중 오류가 발생했습니다.')
  }
}

const applyTranslation = () => {
  title.value = translatedTitle.value
  content.value = translatedContent.value
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
      title: title.value,
      content: content.value,
      category: category.value,
      language: sourceLang.value,
      translatedTitle: translatedTitle.value,
      translatedContent: translatedContent.value,
      latitude: originalPost.value.latitude,
      longitude: originalPost.value.longitude,
      nickname: originalPost.value.nickname,
      region: originalPost.value.region
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