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
import { barterBidApi } from '~/domains/barterBid/infrastructure/barterBidApi'
const props = defineProps<{ deal: any }>()
const item = ref('')
const desc = ref('')

const submit = async () => {
  await barterBidApi.propose({
    dealId: props.deal.id,
    proposedItem: item.value,
    description: desc.value,
    images: []
  })
  alert('제안 완료!')
}
</script>
