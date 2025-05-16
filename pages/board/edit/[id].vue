<template>
  <v-container>
    <v-text-field
        v-model="title"
        label="제목"
        outlined
        clearable
        class="mb-3"
    />
    <v-textarea
        v-model="content"
        label="내용"
        outlined
        rows="6"
        auto-grow
    />
    <v-btn
        block
        color="primary"
        class="mt-4"
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

const route = useRoute()
const router = useRouter()
const postId = Number(route.params.id)

const title = ref('')
const content = ref('')

const load = async () => {
  try {
    const post = await boardApi.getPost(postId)
    title.value = post.title
    content.value = post.content
  } catch (e) {
    alert('게시글을 불러올 수 없습니다.')
    router.push('/board')
  }
}

const submit = async () => {
  if (!title.value.trim() || !content.value.trim()) {
    alert('제목과 내용을 입력해주세요.')
    return
  }

  await boardApi.updatePost(postId, {
    title: title.value,
    content: content.value
  })

  router.push(`/board/view/${postId}`)
}

onMounted(load)
</script>
