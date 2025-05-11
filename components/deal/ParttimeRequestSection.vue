<template>
  <div class="mt-4">
    <v-text-field
        v-model.number="hourlyWage"
        label="희망 시급 입력"
        type="number"
        outlined
        dense
    />
    <v-btn color="primary" @click="submitBid" :loading="bidding">일자리 제안하기</v-btn>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { bidApi } from '~/domains/bid/infrastructure/bidApi'
const emit = defineEmits(['bid-complete'])

const props = defineProps<{ deal: any }>()

const hourlyWage = ref(0)
const bidding = ref(false)

const submitBid = async () => {
  if (hourlyWage.value <= 0) return alert('시급은 0원 이상이어야 합니다.')

  bidding.value = true
  try {
    await bidApi.placeBid({
      dealId: props.deal.id,
      amount: hourlyWage.value,
      nickname: '지영' // 나중엔 로그인 유저에서 자동 주입
    })
    emit('bid-complete') // ✅ 부모에 알림
    alert('알바 제안을 보냈습니다!')
  } catch {
    alert('제안 실패')
  } finally {
    bidding.value = false
  }
}
</script>
