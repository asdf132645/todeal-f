<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { apiClient } from '@/libs/http/apiClient'
import { useAuthStore } from '@/stores/authStore'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

onMounted(async () => {
  const code = route.query.code
  if (!code) return

  try {
    const res = await apiClient.post('/api/auth/kakao-login/callback', { code })
    auth.setUser(res.user)
    router.push('/')
  } catch (e) {
    console.error('카카오 로그인 실패:', e)
    router.push('/auth/login')
  }
})
</script>
