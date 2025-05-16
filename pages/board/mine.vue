// ✅ /pages/board/mine.vue
<template>
  <v-container>
    <div class="text-h6 font-weight-bold mb-4">내가 쓴 게시글</div>
    <v-list lines="three" density="comfortable">
      <v-list-item
          v-for="post in posts"
          :key="post.id"
          class="hoverable"
      >
        <v-list-item-content @click="goToPost(post.id)">
          <v-list-item-title class="font-weight-bold">{{ post.title }}</v-list-item-title>
          <v-list-item-subtitle class="text-truncate">{{ post.content }}</v-list-item-subtitle>
          <v-list-item-subtitle class="text-caption text-grey">
            💬 {{ post.commentCount }} ・ {{ formatDate(post.createdAt) }}
          </v-list-item-subtitle>
        </v-list-item-content>
        <template #append>
          <v-btn size="small" variant="text" color="error" @click="deletePost(post.id)">
            삭제
          </v-btn>
        </template>
      </v-list-item>
    </v-list>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { boardApi } from '@/domains/board/infrastructure/boardApi'

const posts = ref([])
const router = useRouter()

const load = async () => {
  const res = await boardApi.getMyPosts()
  posts.value = res.data
}

const deletePost = async (postId: number) => {
  if (confirm('정말 삭제하시겠습니까?')) {
    await boardApi.deletePost(postId)
    load()
  }
}

onMounted(load)
const goToPost = (id: number) => router.push(`/board/${id}`)
const formatDate = (iso: string) => new Date(iso).toLocaleDateString()
</script>
