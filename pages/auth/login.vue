<template>
  <v-container class="d-flex justify-center align-center fill-height">
    <v-card class="pa-6 rounded-lg" width="360">
      <v-img src="/logo.png" height="64" class="mb-4" />

      <!-- ✅ 이메일 로그인 입력 -->
      <v-text-field
          v-model="email"
          label="이메일"
          outlined
          dense
          class="mb-3"
          type="email"
      />
      <v-text-field
          v-model="password"
          label="비밀번호"
          type="password"
          outlined
          dense
          class="mb-4"
      />

      <v-btn
          block
          color="primary"
          class="mb-2"
          @click="handleEmailLogin"
      >
        일반 로그인
      </v-btn>

      <!-- ✅ 회원가입 버튼 -->
      <v-btn
          block
          variant="text"
          color="secondary"
          class="mb-4"
          @click="goToSignup"
      >
        아직 계정이 없으신가요? 회원가입 하기
      </v-btn>

      <v-divider class="my-4" />

      <!-- ✅ 카카오 로그인 버튼 -->
      <v-btn
          block
          color="#FEE500"
          class="text-black font-weight-bold"
          @click="handleKakaoLogin"
      >
        <v-icon left>mdi-chat</v-icon>
        카카오로 시작하기
      </v-btn>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'
import { useSnackbarStore } from '@/stores/snackbarStore'
import { ref } from 'vue'

const auth = useAuthStore()
const router = useRouter()
const snackbar = useSnackbarStore()

const email = ref('')
const password = ref('')

const handleEmailLogin = async () => {
  try {
    await auth.loginBasic(email.value, password.value)
    snackbar.show('로그인 성공!', 'success')
    router.push('/')
  } catch (err: any) {
    snackbar.show('이메일과 비밀번호를 확인 해주세요.', 'error')
  }
}

const handleKakaoLogin = async () => {
  try {
    const result = await auth.loginWithKakao()

    if (result.isNewUser && result.tempToken) {
      snackbar.show('추가 정보 입력이 필요합니다.', 'warning')
      setTimeout(() => {
        router.push({ path: '/auth/signup', query: { tempToken: result.tempToken } })
      }, 500)
    } else {
      router.push('/')
    }
  } catch (err: any) {
    snackbar.show(err.message || '카카오 로그인에 실패했습니다.', 'error')
  }
}

const goToSignup = () => {
  router.push('/auth/signup')
}

</script>

<style scoped>
.v-btn {
  font-size: 15px;
  height: 48px;
}
</style>
