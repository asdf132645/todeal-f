<template>
  <v-container>
    <!-- ✅ 헤더: 커뮤니티 + 글쓰기 버튼 -->
    <div class="d-flex justify-space-between align-center mb-4">
      <div class="d-flex gap-2">
        <v-btn color="secondary" density="comfortable" class="mr-2" @click="goToMine">
          내 글 보기
        </v-btn>
        <v-btn color="primary" density="comfortable" @click="goToWrite">
          글쓰기
        </v-btn>
      </div>
    </div>
    <!-- ✅ 탭 (내 동네 / 전체) -->
    <div flat class="mb-4 d-flex justify-center">
      <div class="custom-toggle">
        <button
            :class="['toggle-btn', tab === 'local' ? 'active' : '']"
            @click="tab = 'local'"
        >
          내 동네
        </button>
        <button
            :class="['toggle-btn', tab === 'all' ? 'active' : '']"
            @click="tab = 'all'"
        >
          전체
        </button>
      </div>
    </div>


    <div class="d-flex gap-2 mb-4">
      <!-- 검색 대상 선택 -->
      <v-select
          v-model="searchField"
          :items="searchFieldOptions"
          dense
          variant="outlined"
          hide-details
          style="max-width: 120px"
          class="mr-3"
      />

      <!-- 검색어 입력 -->
      <v-text-field
          v-model="keyword"
          label="검색어"
          variant="outlined"
          dense
          clearable
          hide-details
          prepend-inner-icon="mdi-magnify"
          @keyup.enter="fetchPosts"
          class="flex-grow-1"
      />
    </div>


    <!-- ✅ 카테고리 필터 (태그형 칩 + 가로 스크롤) -->
    <v-slide-group
        v-model="category"
        class="mb-4"
        show-arrows
    >
      <v-slide-group-item
          v-for="option in categoryOptions"
          :key="option.value"
          :value="option.value"
      >
        <v-chip
            :color="category === option.value ? 'primary' : 'grey-lighten-3'"
            class="ma-1"
            variant="flat"
            @click="category = option.value"
        >
          {{ option.label }}
        </v-chip>
      </v-slide-group-item>
    </v-slide-group>


    <!-- ✅ 게시글 리스트 -->
    <template v-if="posts.length">
      <v-list lines="three" density="comfortable">
        <template v-for="(post, idx) in posts" :key="post.id">
          <v-list-item
              @click="goToPost(post.id)"
              class="hoverable px-3 py-3"
          >
            <v-list-item-title class="font-weight-bold">
              {{ post.title }}
            </v-list-item-title>
            <v-list-item-subtitle class="text-truncate">
              {{ post.content }}
            </v-list-item-subtitle>
            <v-list-item-subtitle class="text-caption text-grey">
              💬 {{ post.commentCount }} ・ {{ formatDate(post.createdAt) }}
            </v-list-item-subtitle>
          </v-list-item>

          <v-divider v-if="idx !== posts.length - 1" class="my-1" />
        </template>
      </v-list>
    </template>

    <!-- ❌ 글이 없을 경우 -->
    <v-container class="text-center py-16" v-else>
      <v-icon size="56" color="grey">mdi-chat-remove</v-icon>
      <div class="text-subtitle-1 font-weight-bold mt-4">아직 글이 없어요</div>
      <div class="text-body-2 text-grey mt-1">첫 번째 글을 남겨보세요!</div>
      <v-btn color="primary" class="mt-6" @click="goToWrite">글쓰기</v-btn>
    </v-container>
  </v-container>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { boardApi } from '@/domains/board/infrastructure/boardApi'

const posts = ref([])
const router = useRouter()
const route = useRoute()

// ✅ 쿼리에서 tab/category 복원
const tab = ref(route.query.tab?.toString() || 'local')
const category = ref(route.query.category?.toString() || 'all')
const keyword = ref('')
const searchField = ref('title') // 기본값: 제목

const searchFieldOptions = [
  { title: '제목', value: 'title' },
  { title: '내용', value: 'content' },
  { title: '닉네임', value: 'nickname' }
]
const categoryOptions = [
  { label: '전체', value: 'all' },
  { label: '우리 동네 생활', value: 'local-life' },
  { label: '중고거래 도움', value: 'trade-help' },
  { label: '알바 정보', value: 'parttime' },
  { label: '언어 교환', value: 'language-exchange' },
  { label: '문화 교류', value: 'culture' },
  { label: 'Q&A', value: 'qna' },
  { label: '자유', value: 'free' }
]

// ✅ 상태 변경 시 쿼리 반영 (기존 위치 쿼리 포함)
watch([tab, category], ([newTab, newCategory]) => {
  router.replace({
    query: {
      ...route.query,
      tab: newTab,
      category: newCategory
    }
  })
})

// ✅ 게시글 불러오기
const fetchPosts = async () => {
  const lat = Number(localStorage.getItem('userLat'))
  const lng = Number(localStorage.getItem('userLng'))
  const radius = Number(localStorage.getItem('userRadius') || 5)

  const params: any =
      tab.value === 'local' && !isNaN(lat) && !isNaN(lng)
          ? { latitude: lat, longitude: lng, distance: radius }
          : {}

  if (category.value !== 'all') {
    params.category = category.value
  }

  if (keyword.value.trim()) {
    params.keyword = keyword.value.trim()
    params.field = searchField.value // ✅ 검색 대상 전달
  }

  const res = await boardApi.getPosts(params)
  posts.value = res
}


watch([tab, category], fetchPosts, { immediate: true })

const goToPost = (id: number) => router.push(`/board/${id}`)

const goToWrite = () => {
  if (!localStorage.getItem('accessToken')) {
    router.push('/auth/login')
  } else {
    router.push('/board/write')
  }
}
const goToMine = () => {
  if (!localStorage.getItem('accessToken')) {
    router.push('/auth/login')
  } else {
    router.push('/board/mine')
  }
}

const formatDate = (iso: string) => new Date(iso).toLocaleDateString()

</script>
<style>
.custom-toggle {
  display: flex;
  gap: 4px;
  background: #2a2a2a;
  padding: 4px;
  border-radius: 999px;
  max-width: 240px;
  width: 100%;
}

.toggle-btn {
  flex: 1;
  border: none;
  background: transparent;
  color: #ccc;
  font-weight: 500;
  padding: 8px 12px;
  border-radius: 999px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.toggle-btn:hover {
  background-color: #3a3a3a;
  color: #fff;
}

.toggle-btn.active {
  background-color: #f1c40f; /* primary 색상 */
  color: #000;
  font-weight: 600;
}
</style>