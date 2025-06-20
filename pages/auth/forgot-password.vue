<template>

  <v-container class="fill-height d-flex align-center justify-center">
    <v-card width="400" class="pa-6" elevation="6">
      <div class="text-h6 font-weight-bold mb-4 color-black">{{ $t('auto_key_139') }}</div>

      <v-alert v-if="message" type="success" dense class="mb-4">{{ message }}</v-alert>
      <v-alert v-if="error" type="error" dense class="mb-4">{{ error }}</v-alert>

      <v-text-field
          v-model="email"
          label="이메일 주소"
          type="email"
          prepend-inner-icon="mdi-email"
          outlined
          dense
          class="mb-3 color-black"
      />

      <v-btn :loading="loading" color="primary" block @click="submit">{{ $t('auto_key_140') }}</v-btn>
    </v-card>
  </v-container>

</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { ref } from "vue";
import { apiClient } from "~/libs/http/apiClient";
const email = ref("");
const loading = ref(false);
const error = ref("");
const message = ref("");

const submit = async () => {
    if (!email.value) {
        error.value = "이메일을 입력해주세요.";
        return;
    }

    loading.value = true;
    error.value = "";
    message.value = "";

    try {
        await apiClient.post("/api/userAuth/reset-password-request", {
            email: email.value
        });

        message.value = "비밀번호 재설정 메일이 발송되었습니다.";
    } catch (e: any) {
        const msg = e?.response?.data?.message || "메일 전송에 실패했습니다.";

        if (msg.includes(t("auto_key_141"))) {
            error.value = "가입되지 않은 이메일입니다.";
        } else {
            error.value = msg;
        }
    } finally {
        loading.value = false;
    }
};
</script>