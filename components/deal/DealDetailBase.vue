<!--공통 정보-->
<template>
  <div>
    <v-carousel hide-delimiters height="200" v-if="deal.images.length">
      <v-carousel-item v-for="(img, i) in deal.images" :key="i">
        <v-img :src="img" cover />
      </v-carousel-item>
    </v-carousel>

    <div class="mt-4">
      <div class="text-h6 font-weight-bold">{{ deal.title }}</div>
      <div class="text-body-2 text-grey-darken-1 mt-1">{{ deal.description }}</div>
    </div>

    <div class="mt-3 text-caption">
      마감: <strong>{{ formatDeadline(deal.deadline) }}</strong><br />
      현재가: <strong>{{ deal.currentPrice.toLocaleString() }}원</strong>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ deal: any }>()

const formatDeadline = (iso: string) =>
    new Date(iso).toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
</script>
