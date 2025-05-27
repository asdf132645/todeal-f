<template>
  <v-card class="pa-4 rounded-xl elevation-1" color="#1A1B1D">
    <!-- 이미지 캐러셀 -->
    <v-carousel
        hide-delimiters
        height="200"
        class="rounded-lg elevation-1 overflow-hidden"
        v-if="deal.images.length"
    >
      <v-carousel-item
          v-for="(img, i) in deal.images"
          :key="i"
      >
        <v-img :src="img" cover />
      </v-carousel-item>
    </v-carousel>

    <!-- 제목 + 설명 -->
    <div class="mt-4">
      <div class="text-h6 font-weight-bold color-black" style="color: #F2F3F4">
        {{ deal.title }}
      </div>
      <div class="text-body-2 mt-1 color-black" style="color: #A6A9AD">
        {{ deal.description }}
      </div>
    </div>

    <!-- 가격/마감 정보 -->
    <v-card
        class="mt-4 pa-3 rounded-lg elevation-0"
        :style="{ backgroundColor: '#2A2C30' }"
    >
      <div class="text-caption color-black" style="color: #CCCCCC">
        마감일: <strong>{{ formatDeadline(deal.deadline) }}</strong>
      </div>
      <div
          class="text-caption mt-1 color-black"
          v-if="deal.type !== 'barter'"
          style="color: #CCCCCC"
      >
        현재가: <strong>{{ deal.currentPrice.toLocaleString() }}원</strong>
      </div>
    </v-card>
  </v-card>
</template>

<script setup lang="ts">
const props = defineProps<{ deal: any }>()

const formatDeadline = (iso: string) =>
    new Date(iso).toLocaleString('ko-KR', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
</script>
