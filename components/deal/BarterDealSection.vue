<!-- 물물교환 -->
<template>
  <div class="mt-4">
    <v-text-field v-model="item" label="제안할 물품" outlined dense />
    <v-textarea v-model="desc" label="설명" rows="2" outlined dense />
    <v-btn color="primary" @click="submit">교환 제안하기</v-btn>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { barterBidApi } from '~/domains/barterBid/infrastructure/barterBidApi'

const props = defineProps<{ deal: any }>()
const emit = defineEmits(['bid-complete'])

const item = ref('')
const desc = ref('')

const auth = useAuthStore()
const router = useRouter()

const submit = async () => {
  if (!auth.user) {
    router.push('/auth/login')
    return
  }

  if (!item.value.trim()) {
    alert('제안할 물품을 입력해주세요.')
    return
  }

  await barterBidApi.propose({
    dealId: props.deal.id,
    proposedItem: item.value,
    description: desc.value,
    images: []
  })

  alert('제안 완료!');
  emit('bid-complete')
}
</script>
