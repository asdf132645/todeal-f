<template>
  <div>
    <v-text-field
        v-model="keyword"
        label="지역(동 단위) 검색"
        append-icon="mdi-magnify"
        @click:append="search"
        @keydown.enter.prevent="search"
        outlined
    />
    <div class="text-caption text-grey-darken-1 mb-3">
      📌 주소는 동까지만 선택되며, 너무 자세한 위치는 입력하지 않아도 돼요.
    </div>
    <v-list v-if="results.length" class="search-results">
      <v-list-item
          v-for="item in results"
          :key="item.id"
          @click="select(item)"
          class="result-item"
      >
        <v-card class="result-card" flat>
          <v-card-text>
            <div class="place-name">{{ item.place_name }}</div>
            <div class="address">{{ item.address_name }}</div>
          </v-card-text>
        </v-card>
      </v-list-item>
    </v-list>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits(['update:region'])

const keyword = ref('')
const results = ref<any[]>([])

const search = () => {
  if (!keyword.value || !window.kakao?.maps?.services) return
  const ps = new window.kakao.maps.services.Places()

  ps.keywordSearch(keyword.value, (data, status) => {
    if (status === window.kakao.maps.services.Status.OK) {
      results.value = data.filter((item) => {
        const parts = item.address_name.split(' ')
        return parts.length >= 3
      })
    } else {
      results.value = []
    }
  })
}

const select = (item: any) => {
  const parts = item.address_name.split(' ')
  const regionDepth1 = parts[0]
  const regionDepth2 = parts[1]
  const regionDepth3 = parts[2] || ''

  emit('update:region', {
    full: `${regionDepth1} ${regionDepth2} ${regionDepth3}`,
    depth1: regionDepth1,
    depth2: regionDepth2,
    depth3: regionDepth3,
    latitude: parseFloat(item.y),
    longitude: parseFloat(item.x)
  })

  keyword.value = item.place_name
  results.value = [] // 리스트 닫기
}
</script>

<style scoped>
.search-results {
  padding: 0;
  margin: 0;
}

.result-item {
  margin-bottom: 10px;
  cursor: pointer;
}

.result-card {
  padding: 12px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease-in-out;
}

.result-card:hover {
  transform: scale(1.03);
}

.place-name {
  font-weight: bold;
  font-size: 16px;
  color: #333;
}

.address {
  font-size: 14px;
  color: #777;
  margin-top: 4px;
}
</style>
