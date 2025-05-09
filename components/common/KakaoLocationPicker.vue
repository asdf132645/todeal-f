<template>
  <div>
    <v-text-field
        v-model="keyword"
        label="지역 검색"
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
        {{ item.address_name }}
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
  ps.keywordSearch(keyword.value, (data, status) => {
    if (status === window.kakao.maps.services.Status.OK) {
      results.value = data
    }
  })
}

const select = (item: any) => {
  emit('update:region', {
    full: item.address_name,
    depth1: item.address_name.split(' ')[0],
    depth2: item.address_name.split(' ')[1],
    depth3: item.address_name.split(' ')[2] || '',
    x: item.x, // ✅ 위도 (경도)
    y: item.y  // ✅ 경도 (위도)
  })

  results.value = []
  keyword.value = item.address_name
}

</script>
