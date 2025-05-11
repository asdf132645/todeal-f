<template>
  <v-card class="pa-4 rounded-lg elevation-1 mt-6">
    <div class="text-subtitle-1 font-weight-medium mb-2">💸 입찰가 입력</div>

    <v-text-field
        v-model.number="bidAmount"
        type="number"
        density="comfortable"
        label="입찰 금액 (₩)"
        variant="outlined"
        hide-details
        class="mb-4"
    />

    <v-btn
        color="primary"
        block
        size="large"
        :loading="bidding"
        @click="submitBid"
    >
      입찰하기
    </v-btn>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { bidApi } from '~/domains/bid/infrastructure/bidApi'
const emit = defineEmits(['bid-complete'])

const props = defineProps<{
  deal: any,
  onBidSuccess?: () => void // ✅ 리스트 새로고침 콜백
}>()

const bidAmount = ref(0)
const bidding = ref(false)

const submitBid = async () => {
  if (bidAmount.value <= props.deal.currentPrice) {
    alert(`⛔ 현재가보다 높은 금액만 입찰 가능합니다.\n(현재가: ${props.deal.currentPrice.toLocaleString()}원)`)
    return
  }

  bidding.value = true
  try {
    await bidApi.placeBid({
      dealId: props.deal.id,
      amount: bidAmount.value,
      nickname: '지영' // 나중엔 로그인 유저에서 자동 주입
    })

    alert('✅ 입찰이 완료되었습니다!')
    emit('bid-complete') // ✅ 부모에 알림

    // 🔥 리스트 새로고침 콜백 호출
    if (props.onBidSuccess) props.onBidSuccess()

    bidAmount.value = 0
  } catch {
    alert('❌ 입찰에 실패했습니다. 다시 시도해주세요.')
  } finally {
    bidding.value = false
  }
}
</script>
