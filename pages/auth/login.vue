<template>
  <v-container class="d-flex justify-center align-center fill-height login-bg">
    <v-card class="pa-6 text-center login-card" width="360" elevation="3">
      <div class="login-header">
        <div class="text-h5 font-weight-black">
          <span style="color: white">to</span><span style="color: #FEDA3C">DEAL</span>
        </div>
      </div>

      <v-text-field
          v-model="email"
          label="이메일"
          outlined
          dense
          color="white"
          hide-details
          class="mt-5 white-input"
          type="email"
      />
      <v-text-field
          v-model="password"
          label="비밀번호"
          type="password"
          outlined
          dense
          color="white"
          hide-details
          class="mb-4 white-input"
      />

      <v-btn
          block
          class="mb-3 rounded-pill login-button"
          @click="handleEmailLogin"
      >
        로그인
      </v-btn>

      <div class="d-flex justify-space-between text-caption text-white mb-1 px-1">
        <span @click="goToSignup" class="clickable">회원가입</span>
        <span class="clickable">비밀번호 찾기</span>
      </div>
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
    const res = await auth.loginBasic(email.value, password.value)
    snackbar.show('로그인 성공!', 'success')
    router.push('/')
  } catch (err: any) {
    snackbar.show('이메일과 비밀번호를 확인 해주세요.', 'error')
  }
}

const goToSignup = () => {
  router.push('/auth/signup')
}
</script>

<style scoped>

.login-card {
  border-radius: 18px;
  background-color: #1f2687;
}
.login-header {
  margin-top: -10px;
  margin-bottom: 28px;
}
.clickable {
  cursor: pointer;
  text-decoration: underline;
  color: #FEDA3C;
}
.white-input .v-label,
.white-input input {
  color: #ffffff !important;
  background-color: rgba(255, 255, 255, 0.1);
}
.login-button {
  font-size: 15px;
  font-weight: bold;
  height: 48px;
  background-color: #ffffff !important;
  color: #1f2687;
}
</style>