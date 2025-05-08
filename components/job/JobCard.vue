<template>
  <v-card class="rounded-lg" elevation="2">
    <v-img
        :src="job.images?.[0] || 'https://via.placeholder.com/300x200'"
        height="160"
        cover
    />
    <v-card-text>
      <div class="text-subtitle-2 font-weight-bold">{{ job.title }}</div>
      <div class="text-body-2 grey--text">{{ job.description }}</div>
      <div class="mt-2">
        💵 시급: <strong>{{ job.currentPrice.toLocaleString() }}원</strong>
        <br />
        📍 {{ job.location || '위치 미지정' }}
      </div>
    </v-card-text>
    <v-card-actions>
      <v-btn color="success" block>지원하기</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
interface Job {
  id: number
  title: string
  description: string
  currentPrice: number
  location?: string
  images?: string[]
}

defineProps<{ job: Job }>()
</script>
