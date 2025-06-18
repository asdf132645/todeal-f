<template>
  <v-container>
    <!-- ✅ 고정 필터 영역 -->
    <div class="sticky-filters">
      <!-- 🧭 토글 버튼 -->
      <div class="d-flex justify-start align-center mb-2 gap-2">
        <!-- 내 동네 -->
        <div
            class="toggle-card mr-2"
            :class="{ active: tab === 'local' }"
            @click="tab = 'local'"
        >
          <v-icon class="mb-1" size="28">mdi-map-marker</v-icon>
          <div>내 동네</div>
        </div>

        <!-- 전체 -->
        <div
            class="toggle-card"
            :class="{ active: tab === 'all' }"
            @click="tab = 'all'"
        >
          <v-icon class="mb-1" size="28">mdi-map-search	</v-icon>
          <div class="text-no-icon">전체</div>
        </div>
      </div>

      <!-- 🏷 카테고리 칩 -->
      <v-slide-group
          v-model="category"
          class="mb-2"
      >
        <v-slide-group-item
            v-for="option in categoryOptions"
            :key="option.value"
            :value="option.value"
        >
          <v-chip
              :color="category === option.value ? 'primary' : 'grey-lighten-3-custom'"
              class="ma-1"
              variant="flat"
              @click="category = option.value"
          >
            {{ option.label }}
          </v-chip>
        </v-slide-group-item>
      </v-slide-group>

      <!-- 🔍 검색 영역 -->
      <div class="d-flex align-center gap-2 mb-2 search-bar-wrap">
        <v-select
            v-model="searchField"
            :items="searchFieldOptions"
            density="compact"
            variant="outlined"
            hide-details
            class="search-select mr-2"
            style="max-width: 120px"
        />
        <v-text-field
            v-model="keyword"
            label="검색어"
            density="compact"
            variant="outlined"
            clearable
            hide-details
            prepend-inner-icon="mdi-magnify"
            @keyup.enter="fetchPosts"
            class="search-input"
        />
      </div>
    </div>

    <!-- ✅ 게시글 리스트 -->
    <template v-if="posts.length">
      <v-list lines="three" density="comfortable">
        <template v-for="(post, idx) in posts" :key="post.id">
          <v-list-item
              @click="goToPost(post.id)"
              class="hoverable px-3 py-3"
          >
            <v-list-item-title class="font-weight-bold">
              {{ post.translatedTitle }}
            </v-list-item-title>
            <v-list-item-subtitle class="text-truncate">
              {{ post.translatedContent }}
            </v-list-item-subtitle>
            <v-list-item-subtitle class="text-caption text-grey">
              💬 {{ post.commentCount }} ・ {{ formatDate(post.createdAt) }}
            </v-list-item-subtitle>
          </v-list-item>
          <v-divider v-if="idx !== posts.length - 1" class="my-1" />
        </template>
      </v-list>
    </template>

    <!-- ❌ 글 없음 -->
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

.sticky-filters {
  position: sticky;
  top: 0;
  background: #0E0F10;
  z-index: 100;
  padding-top: 12px;
  padding-bottom: 4px;
  border-bottom: 1px solid #eee;
}
.toggle-card {
  width: 80px;
  height: 72px;
  border-radius: 16px;
  background-color: #2c2c2e;
  text-align: center;
  padding: 12px 4px;
  color: #aaa;
  font-size: 15px;
  font-weight: 600;
  transition: all 0.2s;
  border: 1px solid transparent;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.toggle-card.active {
  background-color: #ffffff10;
  border-color: #2a2e9d;
  color: #fff;
}
.text-no-icon {
  margin-top: 6px;
}
</style>