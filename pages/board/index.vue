<template>
  <v-container>
    <div class="d-flex justify-space-between align-center mb-2">
      <div class="text-h6 font-weight-bold">커뮤니티</div>
      <v-btn
          color="primary"
          density="comfortable"
          size="small"
          @click="goToWrite"
      >
        ✏️ 글쓰기
      </v-btn>
    </div>

    <v-tabs v-model="tab" bg-color="white" class="mb-4">
      <v-tab value="local">내 동네</v-tab>
      <v-tab value="all">전체</v-tab>
    </v-tabs>

    <v-list lines="three" density="comfortable">
      <v-list-item
          v-for="post in posts"
          :key="post.id"
          @click="goToPost(post.id)"
          class="hoverable"
      >
        <v-list-item-title class="font-weight-bold">{{ post.title }}</v-list-item-title>
        <v-list-item-subtitle class="text-truncate">{{ post.content }}</v-list-item-subtitle>
        <v-list-item-subtitle class="text-caption text-grey">
          💬 {{ post.commentCount }} ・ {{ formatDate(post.createdAt) }}
        </v-list-item-subtitle>
      </v-list-item>
    </v-list>
  </v-container>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useGeoStore } from '@/stores/geoStore'
import { useRouter } from 'vue-router'
import { boardApi } from '@/domains/board/infrastructure/boardApi'

const posts = ref([])
const tab = ref('local')
const router = useRouter()
const geo = useGeoStore()

const fetchPosts = async () => {
  const lat = geo.latitude
  const lng = geo.longitude
  const radius = process.client
      ? Number(localStorage.getItem('radius') || 0)
      : 0
  const params = tab.value === 'local' && typeof lat === 'number' && typeof lng === 'number'
      ? {
        latitude: lat,
        longitude: lng,
        distance: radius // ← 기본 5km
      }
      : {}

  const res = await boardApi.getPosts(params)
  posts.value = res
}

watch(tab, fetchPosts, { immediate: true })

const goToPost = (id: number) => router.push(`/board/${id}`)
const goToWrite = () => {
  if (!localStorage.getItem('accessToken')) {
    router.push('/auth/login')
  } else {
    router.push('/board/write')
  }
}
const formatDate = (iso: string) => new Date(iso).toLocaleDateString()
</script>
