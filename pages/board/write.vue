<template>
  <v-container>
    <v-text-field
        v-model="title"
        label="제목"
        outlined
        class="mb-3"
        clearable
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
      작성 완료
    </v-btn>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useGeoStore } from '@/stores/geoStore'
import { useAuthStore } from '@/stores/authStore'
import { boardApi } from '@/domains/board/infrastructure/boardApi'

const title = ref('')
const content = ref('')
const geo = useGeoStore()
const auth = useAuthStore()
const router = useRouter()

const submit = async () => {
  if (!title.value.trim() || !content.value.trim()) {
    alert('제목과 내용을 입력해주세요.')
    return
  }

  const lat = geo.latitude
  const lng = geo.longitude
  const nickname =   (process.client ? localStorage.getItem('nickname') : null)
  const region = geo.regionName || '알 수 없음'

  if (typeof lat !== 'number' || typeof lng !== 'number') {
    alert('위치 정보가 없습니다. 위치를 설정해주세요.')
    return
  }

  await boardApi.createPost({
    title: title.value,
    content: content.value,
    latitude: lat,
    longitude: lng,
    nickname,
    region
  })

  // router.push('/board')
}
</script>
