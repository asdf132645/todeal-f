<template>
  <v-card class="pa-3 rounded-sm elevation-1" color="#1A1B1D">
    <!-- 이미지 캐러셀 -->
    <v-carousel
        hide-delimiters
        height="200"
        class="rounded-sm elevation-1 overflow-hidden"
        v-if="deal.images.length"
    >
      <v-carousel-item
          v-for="(img, i) in deal.images"
          :key="i"
      >
        <v-img :src="img" cover />
      </v-carousel-item>
    </v-carousel>

    <!-- 언어 토글 버튼 -->
    <v-btn
        text
        size="small"
        class="mt-2"
        @click="showOriginal = !showOriginal"
    >
      {{ toggleButtonText }}
    </v-btn>
    <!-- 제목 + 설명 -->
    <div class="mt-4">
      <div class="text-h6 font-weight-bold" style="color: #F2F3F4">
        {{ showOriginal ? deal.title : (deal.translatedTitle || deal.title) }}
      </div>
      <div class="text-body-2 mt-1" style="color: #A6A9AD">
        {{ showOriginal ? deal.description : (deal.translatedContent || deal.description) }}
      </div>

    </div>

    <!-- 가격/마감 정보 -->
    <v-card
        class="mt-4 pa-3 rounded-lg elevation-0"
        :style="{ backgroundColor: '#2A2C30' }"
    >
      <div class="text-caption" style="color: #CCCCCC">
        마감일: <strong>{{ formatDeadline(deal.deadline) }}</strong>
      </div>
      <div
          class="text-caption mt-1"
          v-if="deal.type !== 'barter'"
          style="color: #CCCCCC"
      >
        현재가: <strong>{{ deal.pricingType === 'FIXED' ? deal.startPrice.toLocaleString() : deal.currentPrice.toLocaleString() }}원</strong>
      </div>
    </v-card>
  </v-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const props = defineProps<{ deal: any }>()

const showOriginal = ref(false)

const toggleButtonText = computed(() => {
  const originalLang = props.deal.language ?? 'ko'
  const targetLang = originalLang === 'ko' ? 'en' : 'ko'
  const isSame = originalLang === targetLang

  return showOriginal.value
      ? isSame ? '영어 보기' : '한국어 보기'
      : isSame ? '한국어 보기' : '영어 보기'
})

const formatDeadline = (iso: string) =>
    new Date(iso).toLocaleString('ko-KR', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
</script>
