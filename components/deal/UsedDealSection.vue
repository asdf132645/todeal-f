<template>
  <v-card class="pa-4 rounded-lg elevation-1 mt-6">
    <!-- ✅ 거래 방식에 따라 분기 -->
    <template v-if="deal.pricingType === 'BIDDING'">
      <div class="text-subtitle-1 font-weight-medium mb-2 color-black">입찰가 입력</div>

      <v-text-field
          v-model.number="bidAmount"
          type="number"
          density="comfortable"
          label="입찰 금액 (₩)"
          variant="outlined"
          hide-details
          class="mb-4 color-black"
      />

      <v-btn
          color="primary"
          block
          size="large"
          :loading="bidding"
          @click="submitBid"
          class="color-black"
      >
        입찰하기
      </v-btn>
    </template>

    <template v-else>
      <div class="text-subtitle-1 font-weight-medium mb-3 color-black">정가 방식입니다</div>

      <v-btn
          color="green"
          block
          size="large"
          :loading="bidding"
          @click="submitDirect"
          class="color-white"
      >
        바로 지원하기
      </v-btn>
    </template>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { bidApi } from '~/domains/bid/infrastructure/bidApi'
import { useAuthStore } from '@/stores/authStore'
import { useSnackbarStore } from '~/stores/snackbarStore'

const auth = useAuthStore()
const router = useRouter()
const emit = defineEmits(['bid-complete'])
const snackbar = useSnackbarStore()

const props = defineProps<{
  deal: any,
  onBidSuccess?: () => void
}>()

const bidAmount = ref(0)
const bidding = ref(false)

// ✅ 입찰 방식 처리
const submitBid = async () => {
  if (!auth.user) {
    router.push('/auth/login')
    return
  }
  if (props.deal.userId === auth.user.id) {
    snackbar.show(`자기 글에는 지원하기가 안됩니다.`, 'error')
    return
  }
  if (bidAmount.value <= props.deal.currentPrice) {
    snackbar.show(`⛔ 현재가보다 높은 금액만 입찰 가능합니다.\n(현재가: ${props.deal.currentPrice.toLocaleString()}원)`, 'error')
    return
  }

  bidding.value = true
  try {
    await bidApi.placeBid({
      dealId: props.deal.id,
      amount: bidAmount.value,
      nickname: auth.user.nickname || '알 수 없음'
    })

    snackbar.show(`✅ 입찰이 완료되었습니다!`, 'success')
    emit('bid-complete')
    props.onBidSuccess?.()
    bidAmount.value = 0
  } catch {
    snackbar.show(`❌ 입찰에 실패했습니다. 다시 시도해주세요.`, 'error')
  } finally {
    bidding.value = false
  }
}

// ✅ 정찰제 방식 처리
const submitDirect = async () => {
  if (!auth.user) {
    router.push('/auth/login')
    return
  }
  if (props.deal.userId === auth.user.id) {
    snackbar.show(`자기 글에는 지원하기가 안됩니다.`, 'error')
    return
  }

  bidding.value = true
  try {
    // 입찰이 아닌 바로 거래 요청
    await bidApi.placeBid({
      dealId: props.deal.id,
      amount: props.deal.currentPrice,
      nickname: auth.user.nickname || '알 수 없음'
    })

    snackbar.show(`✅ 바로 지원이 완료되었습니다!`, 'success')
    emit('bid-complete')
    props.onBidSuccess?.()
  } catch {
    snackbar.show(`❌ 지원에 실패했습니다. 다시 시도해주세요.`, 'error')
  } finally {
    bidding.value = false
  }
}
</script>
