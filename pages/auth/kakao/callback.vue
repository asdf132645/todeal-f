<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { onMounted } from 'vue'
import { apiClient } from '@/libs/http/apiClient'
import { saveAccessToken, saveRefreshToken } from '@/composables/useToken'
import { useFcm } from '@/composables/useFcm'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const { registerFcm } = useFcm()

onMounted(async () => {
  const code = route.query.code as string | undefined
  if (!code) {
    console.error('카카오 redirect 후 code 없음')
    return router.push('/auth/login')
  }

  try {
    const res = await apiClient.post<{
      accessToken: string
      refreshToken: string
      user: any
    }>('/api/auth/kakao-login/callback', { code })

    saveAccessToken(res.accessToken)
    saveRefreshToken(res.refreshToken)
    auth.setUser(res.user)
    await registerFcm(res.user.id)

    router.push('/')
  } catch (err) {
    console.error('카카오 로그인 처리 실패:', err)
    router.push('/auth/login')
  }
})
</script>

<template>
  <v-container class="text-center py-16">
    <v-progress-circular indeterminate color="primary" size="48" class="mb-4" />
    <div class="text-subtitle-1">로그인 처리 중입니다...</div>
  </v-container>
</template>
