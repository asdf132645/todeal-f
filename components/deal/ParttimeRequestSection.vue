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
import { useRouter } from 'vue-router'
import { bidApi } from '~/domains/bid/infrastructure/bidApi'
import { useAuthStore } from '@/stores/authStore'

const emit = defineEmits(['bid-complete'])
const props = defineProps<{ deal: any }>()

const hourlyWage = ref(0)
const bidding = ref(false)
const auth = useAuthStore()
const router = useRouter()

const submitBid = async () => {
  if (!auth.user) {
    router.push('/auth/login')
    return
  }

  if (hourlyWage.value <= 0) {
    alert('시급은 0원 이상이어야 합니다.')
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
    alert('✅ 알바 제안을 보냈습니다!')
    hourlyWage.value = 0
  } catch {
    alert('❌ 제안 실패! 다시 시도해주세요.')
  } finally {
    bidding.value = false
  }
}
</script>
