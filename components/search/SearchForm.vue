<!-- ✅ components/search/SearchForm.vue -->
<template>
  <v-sheet class="pa-4 mb-4" color="white" rounded>
    <div class="text-subtitle-2 font-weight-bold mb-2">🔍 키워드 검색</div>
    <v-row dense>
      <v-col cols="12">
        <v-text-field v-model="form.keyword" label="검색어 입력" clearable />
      </v-col>
      <v-col cols="12">
        <v-select
            v-model="form.type"
            :items="typeOptions"
            item-title="label"
            item-value="value"
            label="카테고리"
        />
      </v-col>
    </v-row>
    <v-btn color="primary" block class="mt-3" @click="submit">검색</v-btn>
  </v-sheet>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSearchStore } from '@/stores/searchStore'
import { useRoute } from 'vue-router'
import {useRouter} from "#vue-router";

const emit = defineEmits(['search'])
const store = useSearchStore()

const form = ref({
  keyword: '',
  type: 'used'
})

const typeOptions = [
  { label: '중고거래', value: 'used' },
  { label: '알바 급해요!', value: 'parttime' },
  { label: '구직 급해요!', value: 'parttime-request' },
  { label: '물물교환', value: 'barter' }
]
const router = useRouter();

const submit = () => {
  store.addRecentSearch(form.value)
  router.push({
    path: '/deals/search-result',
    query: {
      ...form.value,
      page: 1
    }
  })
}
</script>