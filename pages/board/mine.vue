// ✅ /pages/board/mine.vue
<template>
  <v-container>
    <div class="text-h6 font-weight-bold mb-4">내가 쓴 게시글</div>
    <v-list lines="three" density="comfortable">
      <v-list-item
          v-for="(post, idx) in posts"
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
          <v-btn icon size="small" @click.stop="editPost(post.id)" class="mr-2">
            <v-icon>mdi-pencil-outline</v-icon>
          </v-btn>
          <v-btn icon size="small" color="error" @click.stop="deletePost(post.id)">
            <v-icon>mdi-delete-outline</v-icon>
          </v-btn>
        </template>

        <!-- ✅ 리스트 항목 간 구분선 -->
        <v-divider v-if="idx !== posts.length - 1" class="my-2" />
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
  posts.value = res
}

const deletePost = async (postId: number) => {
  if (confirm('정말 삭제하시겠습니까?')) {
    await boardApi.deletePost(postId)
    load()
  }
}

const goToPost = (id: number) => router.push(`/board/${id}`)
const editPost = (id: number) => router.push(`/board/edit/${id}`)
const formatDate = (iso: string) => new Date(iso).toLocaleDateString()

onMounted(load)
</script>