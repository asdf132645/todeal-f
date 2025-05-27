<template>
  <v-container class="pa-4">
    <v-card flat class="pa-4 mt-4" style="background-color: #1A1B1D; color: #F2F3F4">
      <div class="text-h6 font-weight-bold mb-4">고객센터 문의</div>

      <v-select
          v-model="form.type"
          :items="['계정 문의', '입찰/결제 문제', '거래 관련 신고', '기타']"
          label="문의 유형"
          outlined
          dense
          class="mb-3"
          hide-details
      />

      <v-text-field
          v-model="form.title"
          label="제목"
          outlined
          dense
          class="mb-3"
          hide-details
      />

      <v-text-field
          v-model="form.email"
          label="답변 받을 이메일"
          outlined
          dense
          class="mb-3"
          hide-details
          type="email"
      />

      <v-textarea
          v-model="form.content"
          label="문의 내용"
          outlined
          rows="5"
          class="mb-3"
          hide-details
      />

      <v-btn
          block
          style="background-color: #FFD54F; color: #0E0F10"
          class="rounded-pill mt-1"
          :loading="submitting"
          @click="submit"
      >
        문의 보내기
      </v-btn>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSnackbarStore } from '@/stores/snackbarStore'
import { supportApi } from '@/domains/support/infrastructure/supportApi'

const snackbar = useSnackbarStore()

const form = ref({
  type: '',
  title: '',
  email: '',
  content: ''  // ✅ 이름 수정됨
})

const submitting = ref(false)

const submit = async () => {
  if (!form.value.type || !form.value.title || !form.value.email || !form.value.content) {
    snackbar.show('모든 항목을 입력해주세요.', 'error')
    return
  }

  submitting.value = true
  try {
    await supportApi.submitInquiry(form.value)
    snackbar.show('문의가 접수되었습니다.', 'success')
    form.value = { type: '', title: '', email: '', content: '' }
  } catch (e) {
    snackbar.show('문의 접수에 실패했습니다.', 'error')
  } finally {
    submitting.value = false
  }
}
</script>
