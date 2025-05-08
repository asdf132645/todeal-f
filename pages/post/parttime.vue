<template>
  <v-container class="py-6">
    <v-card class="pa-4">
      <v-card-title class="font-weight-bold">알바 모집 등록</v-card-title>
      <v-text-field label="제목" v-model="title" outlined class="mt-3" />
      <v-textarea label="설명" v-model="description" outlined class="mt-3" />
      <v-text-field label="시급 (₩)" v-model="startPrice" type="number" outlined class="mt-3" />
      <v-text-field label="마감 시간" v-model="deadline" type="datetime-local" outlined class="mt-3" />
      <v-file-input label="이미지 업로드" v-model="images" multiple outlined class="mt-3" />
      <v-btn color="orange" class="mt-4" @click="submit">등록하기</v-btn>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
const title = ref('')
const description = ref('')
const startPrice = ref<number | null>(null)
const deadline = ref('')
const images = ref<File[] | null>(null)

const submit = () => {
  console.log('알바 등록', { title, description, startPrice, deadline, images })
  // TODO: API 연동
}
</script>
