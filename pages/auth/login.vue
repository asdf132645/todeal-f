<template>

  <v-container class="d-flex justify-center align-center fill-height login-bg">
    <v-card class="pa-6 text-center login-card" width="360" elevation="3">
      <div class="login-header mb-5">
        <div class="text-h5 font-weight-black">
          <span style="color: white" class="color-blue">to</span><span style="color: #FEDA3C">DEAL</span>
        </div>
      </div>

      <v-text-field
          v-model="email"
          label="이메일"
          outlined
          dense
          color="white"
          hide-details
          class="white-input mb-3 color-black"
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
          class="white-input mb-4 color-black"
      />

      <v-btn
          block
          class="mb-4 login-button color-black"
          @click="handleEmailLogin"
      >
        로그인
      </v-btn>

      <!--  카카오 로그인 버튼 이미지 -->
      <v-img
          :src="kakaoImg"
          alt="카카오로 로그인"
          class="kakao-login-img mb-4"
          @click="handleKakaoLogin"
      />

      <div class="d-flex justify-space-between text-caption text-white px-1">
        <span @click="goToSignup" class="clickable color-blue">{{ $t('auto_key_135') }}</span>
        <span @click="goToForgotPassword" class="clickable color-blue">{{ $t('auto_key_136') }}</span>
      </div>
    </v-card>
  </v-container>

</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "vue-router";
import { useSnackbarStore } from "@/stores/snackbarStore";
import { ref } from "vue";
import kakaoImg from "@/assets/img/kakao_login_medium_wide.png";
import { Capacitor } from '@capacitor/core';
const auth = useAuthStore();
const router = useRouter();
const snackbar = useSnackbarStore();
const email = ref("");
const password = ref("");

const handleEmailLogin = async () => {
    try {
        await auth.loginBasic(email.value, password.value);
        snackbar.show(t("auto_key_137"), "success");
        router.push("/");
    } catch (err: any) {
        const serverMsg = err?.response?.data?.message;

        if (serverMsg?.includes(t("auto_key_138"))) {
            snackbar.show(serverMsg, "error");
        } else {
            snackbar.show("이메일과 비밀번호를 확인 해주세요.", "error");
        }
    }
};

const handleKakaoLogin = async () => {
  try {
    const isWebView = Capacitor.getPlatform() !== 'web';

    if (isWebView) {
      const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${import.meta.env.VITE_KAKAO_REST_API_KEY}&redirect_uri=https://app.to-deal.com/auth/kakao/callback&response_type=code`;
      //  외부 브라우저 대신 WebView 내부에서 리디렉션
      window.location.assign(kakaoAuthUrl);
      return;
    }

    const result = await auth.loginWithKakao();

    if (result.isNewUser) {
      if (!result.tempToken) {
        snackbar.show("카카오 인증 토큰이 없습니다. 다시 시도해 주세요.", "error");
        return;
      }

      router.push({
        path: "/auth/signup",
        query: {
          tempToken: result.tempToken
        }
      });
    } else {
      snackbar.show(t("auto_key_137"), "success");
      router.push("/");
    }
  } catch (err: any) {
    console.error('[카카오 로그인 오류]', err)
    snackbar.show(`카카오 로그인 중 문제가 발생했어요. ${err}`, "error")
  }
};




const goToForgotPassword = () => {
    router.push("/auth/forgot-password");
};

const goToSignup = () => {
    router.push("/auth/signup");
};
</script>

.login-card {
  border-radius: 16px !important;
  background-color: #1f2687;
}

.login-header {
  margin-top: -10px;
}

.clickable {
  cursor: pointer;
  text-decoration: underline;
  color: #FEDA3C;
}

.white-input ::v-deep .v-field {
  background-color: #ffffff !important;
  border: 1px solid #000000 !important;
  border-radius: 8px;
}
.white-input ::v-deep .v-field--focused {
  border-color: #000000 !important;
}
.white-input ::v-deep .v-label {
  color: #000000 !important;
}
.white-input ::v-deep input {
  color: #000000 !important;
}

.login-button {
  font-size: 15px;
  font-weight: bold;
  height: 44px;
  background-color: #ffffff !important;
  color: #1f2687;
}

.kakao-login-img {
  width: 100%;
  max-width: 320px;
  height: auto;
  cursor: pointer;
}