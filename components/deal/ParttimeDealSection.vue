<!--ParttimeDealSection.vue (알바 입찰)-->
<template>
  <div class="mt-4">
    <v-text-field v-model.number="bidAmount" label="시급 제안" type="number" outlined dense />
    <v-btn color="primary" @click="submitBid" :loading="bidding">지원하기</v-btn>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { bidApi } from '~/domains/bid/infrastructure/bidApi'
const props = defineProps<{ deal: any }>()
const bidAmount = ref(0)
const bidding = ref(false)
const emit = defineEmits(['bid-complete'])

const submitBid = async () => {
  if (bidAmount.value <= props.deal.currentPrice) return
  bidding.value = true
  try {
    await bidApi.placeBid({ dealId: props.deal.id, amount: bidAmount.value })
    alert('지원 완료!')
    emit('bid-complete') // ✅ 부모에 알림

  } catch {
    alert('실패')
  } finally {
    bidding.value = false
  }
}
</script>
