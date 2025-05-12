<!-- ParttimeDealSection.vue (알바 입찰) -->
<template>
  <div class="mt-4">
    <v-text-field v-model.number="bidAmount" label="시급 제안" type="number" outlined dense />
    <v-btn color="primary" @click="submitBid" :loading="bidding">지원하기</v-btn>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { bidApi } from '~/domains/bid/infrastructure/bidApi'
import { useAuthStore } from '@/stores/authStore'

const props = defineProps<{ deal: any }>()
const emit = defineEmits(['bid-complete'])

const bidAmount = ref(0)
const bidding = ref(false)

const auth = useAuthStore()

const submitBid = async () => {
  if (bidAmount.value <= props.deal.currentPrice) {
    alert(`⛔ 현재 시급보다 높게 입력해야 합니다.\n(현재 시급: ${props.deal.currentPrice.toLocaleString()}원)`)
    return
  }

  bidding.value = true
  try {
    await bidApi.placeBid({
      dealId: props.deal.id,
      amount: bidAmount.value,
      nickname: auth.user?.nickname || '알 수 없음'
    })

    alert('✅ 지원 완료!')
    emit('bid-complete')

    bidAmount.value = 0
  } catch {
    alert('❌ 지원 실패! 다시 시도해주세요.')
  } finally {
    bidding.value = false
  }
}
</script>
