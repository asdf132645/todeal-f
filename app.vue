<template>
  <v-app>
   <Default/>
    <AppSnackbar />
  </v-app>
</template>

<script setup lang="ts">
import Default from '~/layout/default.vue'
import AppSnackbar from '~/components/common/AppSnackbar.vue'

import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { getStoredRefreshToken, saveAccessToken, saveRefreshToken } from '~/composables/useToken'
import { authApi } from '@/domains/user/infrastructure/authApi'

onMounted(async () => {
  const auth = useAuthStore()

  const refreshToken = getStoredRefreshToken()

  if (!auth.accessToken && refreshToken) {
    try {
      const { accessToken, refreshToken: newRefreshToken } =
          await authApi.refreshAccessToken(refreshToken)

      saveAccessToken(accessToken)
      saveRefreshToken(newRefreshToken)
      auth.accessToken = accessToken

      await auth.fetchMyInfo()
    } catch {
      auth.logout()
    }
  }
})
</script>
