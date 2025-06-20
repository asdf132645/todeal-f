<!-- ParttimeDealSection.vue -->
<template>
  <div class="mt-4">
    <!-- 거래 방식 분기 -->
    <template v-if="deal.pricingType === 'BIDDING'">
      <v-text-field
          v-model.number="bidAmount"
          label="희망 시급 입력"
          type="number"
          outlined
          dense
          class="color-black"
      />
      <v-btn
          class="color-white"
          @click="submitBid"
          color="primary"
          :loading="bidding"
      >
        지원하기
      </v-btn>
    </template>

    <template v-else>
      <v-btn
          class="color-white"
          @click="submitDirect"
          color="green"
          :loading="bidding"
      >
        바로 지원하기
      </v-btn>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { bidApi } from '~/domains/bid/infrastructure/bidApi'
import { useAuthStore } from '@/stores/authStore'
import { useSnackbarStore } from '@/stores/snackbarStore'

const props = defineProps<{ deal: any }>()
const emit = defineEmits(['bid-complete'])

const bidAmount = ref(0)
const bidding = ref(false)
const auth = useAuthStore()
const snackbar = useSnackbarStore()
const router = useRouter()

// 입찰 방식
const submitBid = async () => {
  if (!auth.user) {
    router.push('/auth/login')
    return
  }

  if (props.deal.userId === auth.user.id) {
    snackbar.show('자기 글에는 지원할 수 없습니다.', 'error')
    return
  }

  if (bidAmount.value <= props.deal.currentPrice) {
    snackbar.show(
        `⛔ 현재 시급보다 높게 입력해야 합니다. (현재 시급: ${props.deal.currentPrice.toLocaleString()}원)`,
        'error'
    )
    return
  }

  bidding.value = true
  try {
    await bidApi.placeBid({
      dealId: props.deal.id,
      amount: bidAmount.value,
      nickname: auth.user?.nickname || '알 수 없음'
    })

    snackbar.show(' 지원 완료!', 'success')
    emit('bid-complete')
    bidAmount.value = 0
  } catch {
    snackbar.show('❌ 지원 실패! 다시 시도해주세요.', 'error')
  } finally {
    bidding.value = false
  }
}

// 정찰제 방식
const submitDirect = async () => {
  if (!auth.user) {
    router.push('/auth/login')
    return
  }

  if (props.deal.userId === auth.user.id) {
    snackbar.show('자기 글에는 지원할 수 없습니다.', 'error')
    return
  }

  bidding.value = true
  try {
    await bidApi.placeBid({
      dealId: props.deal.id,
      amount: props.deal.currentPrice,
      nickname: auth.user?.nickname || '알 수 없음'
    })

    snackbar.show(' 바로 지원 완료!', 'success')
    emit('bid-complete')
  } catch {
    snackbar.show('❌ 지원 실패! 다시 시도해주세요.', 'error')
  } finally {
    bidding.value = false
  }
}
</script>
