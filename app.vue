<template>

  <v-app>
    <Default />
    <AppSnackbar />

    <!--  카카오 인앱 브라우저 경고 다이얼로그 -->
    <v-dialog v-model="showKakaoWarning" persistent max-width="400">
      <v-card>
        <v-card-title class="headline">{{ $t('auto_key_1') }}</v-card-title>
        <v-card-text>
          카카오톡 인앱 브라우저에서는 일부 기능이 제대로 작동하지 않을 수 있습니다.<br />
          <strong>{{ $t('auto_key_2') }}</strong>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="openInBrowser">{{ $t('auto_key_3') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>

</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
//  카카오 인앱 브라우저 감지
import { ref, onMounted } from "vue";
import Default from "~/layout/default.vue";
import AppSnackbar from "~/components/common/AppSnackbar.vue";
import { useAuthStore } from "@/stores/authStore";
import { getStoredRefreshToken, saveAccessToken, saveRefreshToken } from "~/composables/useToken";
import { authApi } from "@/domains/user/infrastructure/authApi";
const showKakaoWarning = ref(false);

const isKakaoInAppBrowser = () => {
    const ua = navigator.userAgent.toLowerCase();
    return ua.includes("kakaotalk");
};

const openInBrowser = () => {
    const url = window.location.href;
    window.open(url, "_blank");
};

onMounted(async () => {
    if (isKakaoInAppBrowser()) {
        showKakaoWarning.value = true;
        return;
    }

    const auth = useAuthStore();
    const refreshToken = getStoredRefreshToken();

    if (!auth.accessToken && refreshToken) {
        try {
            const {
                accessToken,
                refreshToken: newRefreshToken
            } = await authApi.refreshAccessToken(refreshToken);

            saveAccessToken(accessToken);
            saveRefreshToken(newRefreshToken);
            auth.accessToken = accessToken;
            await auth.fetchMyInfo();
        } catch {
            auth.logout();
        }
    }
});
</script>