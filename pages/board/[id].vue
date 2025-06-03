<template>
  <v-container>
    <!-- 📌 게시글 카드 -->
    <v-card class="mb-4 pa-4">
      <div class="d-flex align-center mb-3">
        <div>
          <div class="font-weight-medium color-black">{{ post.nickname || '익명' }}</div>
          <div class="text-caption grey--text color-black">
            {{ post.region || '지역정보 없음' }} ・ {{ formatDate(post.createdAt) }}
          </div>
        </div>
      </div>

      <div class="text-h6 font-weight-bold mb-3 color-black">
        {{ post.translatedTitle }}
      </div>

      <div class="text-body-1 color-black" style="white-space: pre-line;">
        {{ post.translatedContent }}
      </div>

      <!-- ✅ 이미지 썸네일 출력 -->
      <v-row v-if="post.imageUrls?.length" class="mt-3" dense>
        <v-col cols="4" v-for="(url, idx) in post.imageUrls" :key="idx">
          <v-img :src="url" aspect-ratio="1" class="rounded"></v-img>
        </v-col>
      </v-row>

      <div class="d-flex justify-end mt-6 color-black">
        <span class="text-caption text-grey">조회 {{ post.viewCount || 0 }}</span>
      </div>
    </v-card>

    <!-- 💬 댓글 카드 -->
    <v-card class="pa-4 mb-4">
      <div class="text-subtitle-2 font-weight-bold mb-3 color-black">
        댓글 {{ comments.length }}
      </div>

      <!-- ✅ 댓글 목록 -->
      <template v-if="comments.length">
        <v-list class="comment-list">
          <v-list-item
              v-for="comment in comments"
              :key="comment.id"
              class="pa-2"
          >
            <v-list-item-content>
              <div class="d-flex align-center justify-space-between mb-1">
                <span class="text-caption font-weight-medium color-black">
                  {{ comment.nickname }}
                </span>
                <span class="text-caption text-grey-darken-1 color-black">
                  {{ formatDate(comment.createdAt) }}
                </span>
              </div>
              <div class="text-body-2 color-black">
                {{ comment.content }}
              </div>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </template>

      <!-- ❗ 댓글 없을 때 -->
      <template v-else>
        <div class="text-caption text-grey text-center py-4 color-black">
          아직 댓글이 없어요<br />가장 먼저 댓글을 남겨보세요.
        </div>
      </template>

      <!-- 댓글 입력 -->
      <v-textarea
          v-model="newComment"
          placeholder="댓글을 입력하세요"
          rows="2"
          auto-grow
          class="color-black"
      />
      <v-btn color="primary" class="mt-2" @click="submitComment">댓글 작성</v-btn>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { boardApi } from '@/domains/board/infrastructure/boardApi'
import { useAuthStore } from '@/stores/authStore'

const route = useRoute()
const router = useRouter()
const postId = Number(route.params.id)
const post = ref<any>({})
const comments = ref<any[]>([])
const newComment = ref('')

const authStore = useAuthStore()

const userId = process.client
    ? Number(localStorage.getItem('userId') || 0)
    : 0

const isMine = computed(() => post.value.userId === userId)

const load = async () => {
  try {
    post.value = await boardApi.getPost(postId)
    comments.value = await boardApi.getComments(postId)
  } catch (e) {
    alert('게시글을 불러오는 데 실패했습니다.')
    router.push('/board')
  }
}

const submitComment = async () => {
  if (!newComment.value.trim()) return
  await boardApi.createComment({
    postId,
    content: newComment.value.trim(),
    nickname: authStore.user?.nickname || '익명'
  })
  newComment.value = ''
  await load()
}

const formatDate = (iso: string) => {
  try {
    const date = new Date(iso)
    return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
  } catch {
    return '-'
  }
}

onMounted(load)
</script>

<style>
.comment-list {
  padding: 0;
  border-top: 1px solid #eee;
}
.v-list-item {
  border-bottom: 1px solid #f0f0f0;
}
</style>