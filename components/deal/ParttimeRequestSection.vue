<template>
  <div class="mt-4">
    <!-- ✅ 거래 방식에 따라 분기 -->
    <template v-if="deal.pricingType === 'BIDDING'">
      <v-text-field
          v-model.number="hourlyWage"
          label="희망 시급 입력"
          type="number"
          outlined
          dense
      />
      <v-btn color="primary" @click="submitBid" :loading="bidding">
        일자리 제안하기
      </v-btn>
    </template>

    <template v-else>
      <v-btn color="green" class="color-white" @click="submitDirect" :loading="bidding">
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
import { useSnackbarStore } from '~/stores/snackbarStore'

const emit = defineEmits(['bid-complete'])
const props = defineProps<{ deal: any }>()

const hourlyWage = ref(0)
const bidding = ref(false)
const auth = useAuthStore()
const router = useRouter()
const snackbar = useSnackbarStore()

const submitBid = async () => {
  if (!auth.user) {
    router.push('/auth/login')
    return
  }

  if (props.deal.userId === auth.user.id) {
    snackbar.show(`자기 글에는 지원하기가 안됩니다.`, 'error')
    return
  }

  if (hourlyWage.value <= 0) {
    snackbar.show(`시급은 0원 이상이어야 합니다.`, 'error')
    return
  }

  bidding.value = true
  try {
    await bidApi.placeBid({
      dealId: props.deal.id,
      amount: hourlyWage.value,
      nickname: auth.user?.nickname || '익명'
    })

    emit('bid-complete')
    snackbar.show(`알바 제안을 보냈습니다!`, 'success')
    hourlyWage.value = 0
  } catch {
    snackbar.show(`❌ 제안 실패! 다시 시도해주세요.`, 'error')
  } finally {
    bidding.value = false
  }
}

// ✅ 정찰제 바로 지원
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
    await bidApi.placeBid({
      dealId: props.deal.id,
      amount: props.deal.currentPrice, // 바로 지원은 현재가로
      nickname: auth.user?.nickname || '익명'
    })

    emit('bid-complete')
    snackbar.show(`바로 지원되었습니다!`, 'success')
  } catch {
    snackbar.show(`❌ 지원 실패! 다시 시도해주세요.`, 'error')
  } finally {
    bidding.value = false
  }
}
</script>
