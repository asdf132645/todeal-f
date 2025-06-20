<template>

  <v-card flat class="pa-4">
    <div class="text-subtitle-1 font-weight-bold mb-2">{{ $t('auto_key_165') }}</div>
    <v-btn block class="mb-2" color="primary">{{ $t('auto_key_5') }}</v-btn>
    <v-btn block class="mb-2" color="primary">{{ $t('auto_key_166') }}</v-btn>
    <v-btn block color="primary">{{ $t('auto_key_167') }}</v-btn>
  </v-card>

</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
// 향후 이벤트 연결 예정

</script>