<template>
  <div>
    <v-text-field
        v-model="keyword"
        label="상호명 또는 지역 검색"
        append-icon="mdi-magnify"
        @click:append="search"
        @keydown.enter.prevent="search"
        class="mb-3"
    />

    <v-list v-if="results.length">
      <v-list-item
          v-for="item in results"
          :key="item.id"
          @click="select(item)"
      >
        {{ item.place_name }} <!-- 상호명 표시 -->
      </v-list-item>
    </v-list>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const emit = defineEmits(['update:region'])

const keyword = ref('')
const results = ref<any[]>([])

watch(keyword, (val) => {
  if (val.length >= 1) {
    search()
  }
})

const search = () => {
  if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services) return
  const ps = new window.kakao.maps.services.Places()

  // 검색어에 대한 장소 검색
  ps.keywordSearch(keyword.value, (data, status) => {
    if (status === window.kakao.maps.services.Status.OK) {
      // 검색된 장소 목록을 results에 저장
      results.value = data.filter(item => item.place_name.includes(keyword.value))
    }
  })
}

const select = (item: any) => {
  // 선택된 장소 정보 전달
  emit('update:region', {
    full: item.address_name,
    depth1: item.address_name.split(' ')[0],
    depth2: item.address_name.split(' ')[1],
    depth3: item.address_name.split(' ')[2] || '',
    x: item.x, // 위도
    y: item.y  // 경도
  })

  results.value = []  // 결과 목록 초기화
  keyword.value = item.place_name  // 선택된 장소의 이름으로 키워드 설정
}
</script>
