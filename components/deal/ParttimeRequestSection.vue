<!-- 요청 전용 -->

<template>
  <v-alert type="info" class="mt-4">
    이 알바 요청은 입찰을 받지 않으며, 요청자가 원하는 내용을 참고해주세요.
  </v-alert>
</template>

<script setup lang="ts">
defineProps<{ deal: any }>()
</script>
