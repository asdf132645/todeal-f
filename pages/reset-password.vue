<template>
  <v-container class="fill-height d-flex align-center justify-center">
    <v-card width="400" class="pa-6" elevation="6">
      <div class="text-h6 font-weight-bold mb-4">비밀번호 재설정</div>

      <v-alert v-if="error" type="error" dense class="mb-4">{{ error }}</v-alert>
      <v-alert v-if="success" type="success" dense class="mb-4">{{ success }}</v-alert>

      <v-text-field
          v-model="newPassword"
          label="새 비밀번호"
          type="password"
          prepend-inner-icon="mdi-lock"
          outlined
          dense
          :error="passwordError"
          class="mb-1"
          @input="validatePassword"
      />
      <span v-if="passwordError" class="text-error text-caption mb-3 d-block">
        비밀번호는 8자 이상이어야 합니다.
      </span>

      <v-btn :loading="loading" color="primary" block @click="submit">비밀번호 변경</v-btn>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { apiClient } from '~/libs/http/apiClient'

const route = useRoute()
const router = useRouter()
const token = ref<string | null>(null)
const newPassword = ref('')
const passwordError = ref(false)
const loading = ref(false)
const error = ref('')
const success = ref('')

onMounted(() => {
  token.value = route.query.token as string
  if (!token.value) {
    error.value = '유효하지 않은 접근입니다.'
  }
})

const validatePassword = () => {
  passwordError.value = !newPassword.value || newPassword.value.length < 8
}

const submit = async () => {
  validatePassword()
  if (passwordError.value || !token.value) {
    error.value = '비밀번호를 올바르게 입력해주세요.'
    return
  }

  loading.value = true
  error.value = ''
  success.value = ''

  try {
    await apiClient.post('/api/userAuth/reset-password', {
      token: token.value,
      newPassword: newPassword.value
    })
    success.value = '비밀번호가 성공적으로 변경되었습니다.'
    setTimeout(() => router.push('/auth/login'), 1500)
  } catch (e: any) {
    error.value = e?.response?.data?.message || '변경에 실패했습니다.';

  } finally {
    loading.value = false
  }
}
</script>
