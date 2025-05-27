<template>
  <v-card class="post-popup-card" elevation="8">
    <v-row dense>
      <v-col cols="12" v-for="item in postOptions" :key="item.title">
        <v-card
            tag="div"
            class="d-flex justify-space-between align-center px-4 py-3 mb-2 rounded-lg hover-sheet"
            color="white"
            @click="$emit('select', item.to)"
        >
          <div>
            <div class="text-body-1 font-weight-medium">{{ item.title }}</div>
            <div class="text-caption text-grey-darken-1 mt-1">{{ item.subtitle }}</div>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup lang="ts">
const postOptions = [
  {
    title: '빌려드려요 등록',
    subtitle: '물건끼리 맞교환 경매 등록하기',
    to: '/post/barter',
  },
  {
    title: '중고 거래 등록',
    subtitle: '중고 물건을 경매로 올려보세요',
    to: '/post/used',
  },
  {
    title: '알바 모집 등록',
    subtitle: '사장님이 알바를 모집할 수 있어요',
    to: '/post/parttime',
  },
  {
    title: '알바 구해요',
    subtitle: '알바생이 직접 경매 등록 가능',
    to: '/post/parttime-request',
  },
]
</script>

<style>
.post-popup-card {
  position: fixed;
  bottom: 160px;
  right: 24px;
  width: 260px;
  padding: 12px;
  z-index: 999;
}

.hover-sheet:hover {
  background-color: #f5f5f5;
  transition: background-color 0.2s ease;
}
</style>
