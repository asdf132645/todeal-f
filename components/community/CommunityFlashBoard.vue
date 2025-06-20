<template>
  <v-sheet class="bg-app ">
    <!--  타이틀 -->
    <div class="customText1 mb-4 px-1">오늘 올라온 게시글 💬</div>

    <!--  슬라이드 카드 리스트 -->
    <v-slide-group v-if="posts.length > 0" show-arrows="false" class="px-0">
      <!-- 글쓰기 카드 -->
      <v-slide-group-item>
        <v-card
            class="mx-2 flash-card d-flex align-center justify-center"
            width="90"
            height="120"
            @click="goToWrite"
            style="background-color: #2A2E9D;"
        >
          <div class="text-center white--text">
            <v-icon size="36">mdi-plus</v-icon>
          </div>
        </v-card>
      </v-slide-group-item>

      <!-- 게시글 카드 -->
      <v-slide-group-item v-for="post in posts" :key="post.id">
        <v-card class="mx-2 flash-card" width="260" @click="goToPost(post.id)">
          <div class="d-flex align-center px-3 pt-3">
<!--            <v-icon color="amber darken-2" class="mr-1">mdi-flash</v-icon>-->
            <span class="text-subtitle-2 font-weight-bold">{{ post.translatedTitle }}</span>
          </div>
          <div class="px-3 py-2 text-body-2 text-truncate">
            {{ post.translatedContent }}
          </div>
          <div class="px-3 pb-3 text-caption text-grey text-left">
             {{ post.commentCount }} · {{ formatDate(post.createdAt) }}
          </div>
        </v-card>
      </v-slide-group-item>
    </v-slide-group>

    <!-- ❌ 글 없음 -->
    <div v-else class="px-2">
      <v-card
          class="mx-2 flash-card d-flex align-center justify-center"
          width="90"
          height="120"
          @click="goToWrite"
          style="background-color: #2A2E9D;"
      >
        <div class="text-center white--text">
          <v-icon size="36">mdi-plus</v-icon>
        </div>
      </v-card>
    </div>
  </v-sheet>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { boardApi } from '@/domains/board/infrastructure/boardApi'

const router = useRouter()
const posts = ref([])

const fetchPosts = async () => {
  try {
    const res = await boardApi.getPosts();
    // console.log(res);
    posts.value = res.items
  } catch (e) {
    console.error('게시글 불러오기 실패', e)
  }
}

onMounted(fetchPosts)

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

<style scoped>
.flash-card {
  border-radius: 12px;
  background-color: #1A1B1D;
  color: #fff;
  cursor: pointer;
  transition: box-shadow 0.2s;
}
.flash-card:hover {
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}
</style>
