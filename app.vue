<template>
  <v-app>
   <Default/>
    <AppSnackbar />
  </v-app>
</template>

<script setup lang="ts">
import Default from "~/layout/default.vue";
import AppSnackbar from "~/components/common/AppSnackbar.vue";

import { useAuthStore } from '@/stores/authStore'
import {
  getStoredRefreshToken,
} from '~/composables/useToken'
onMounted(async () => {
  const auth = useAuthStore();
  if (!auth.accessToken && getStoredRefreshToken()) {
    try {
      await auth.fetchMyInfo();
      await auth.refreshAccessToken();
    } catch (e) {
      alert('⛔ 세션이 만료되었습니다. 다시 로그인해주세요.')
      auth.logout()
    }
  }
})


</script>
